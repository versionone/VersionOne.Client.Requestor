VersionOneAssetEditor = (options) ->
  contentType = "haljson"
  options.headers = Authorization: "Basic " + btoa(@versionOneAuth) # TODO: clean this up
  options.whereCriteria = Name: options.projectName
  options.whereParamsForProjectScope =
    acceptFormat: contentType
    sel: ""

  options.queryOpts = acceptFormat: contentType
  options.contentType = contentType
  for key of options
    this[key] = options[key]
  @initializeThenSetup()
_.extend VersionOneAssetEditor::, Backbone.Events

VersionOneAssetEditor::debug = (message) ->
  console.log message  if @showDebug

VersionOneAssetEditor::initializeThenSetup = ->
  @requestorName = ""
  if @serviceGateway
    @setup()
    return
  url = @service + "Scope" + "?where=" + $.param(@whereCriteria) + "&" + $.param(@whereParamsForProjectScope)
  @debug "initializeThenSetup: " + url
  that = this
  $.ajax(
    url: url
    headers: @headers
    type: "GET"
  ).done((data) ->
    if data.length > 0
      that.projectScopeId = data[0]._links.self.id
      that.setup()
    else
      that.debug "No results for query: " + url
  ).fail @_ajaxFail

VersionOneAssetEditor::setup = ->
  if @serviceGateway
    @host = @serviceGateway
    @service = @host + "/"
  @debug @fields
  $("#assetForm").html $("#fieldsTemplate").render(fields: @fields)
  that = this
  $(".new").click ->
    that.newAsset()

  selectFields = []
  that.enumFields (key, field) ->
    selectFields.push key

  
  # Populate the assets list
  @loadAssets @assetName, selectFields
  refreshList = $("#refreshList")
  refreshList.bind "click", ->
    that.loadAssets that.assetName, selectFields

  
  # Setup the data within select lists
  $(".selectField").each ->
    that.debug that
    item = $(this)
    fieldName = item.attr("name")
    field = that.findField(fieldName)
    assetName = field.assetName
    fields = field.fields
    fields = ["Name"]  if not fields? or fields.length is 0
    url = that.service + assetName + "?" + $.param(that.queryOpts) + "&" + $.param(sel: fields.join(","))
    $.ajax(
      url: url
      headers: @headers
      type: "GET"
    ).done((data) ->
      if data.length > 0
        item.selectmenu()
        i = 0

        while i < data.length
          option = data[i]
          item.append "<option value='" + option._links.self.id + "'>" + option.Name + "</option>"
          i++
        item.selectmenu "refresh"
      else
        that.debug "No results for query: " + url
    ).fail @_ajaxFail

  @configureValidation()
  @toggleNewOrEdit "new"

VersionOneAssetEditor::_ajaxFail = (ex) ->
  console.log ex

VersionOneAssetEditor::configureValidation = ->
  that = this
  $("#assetForm").validVal form:
    onInvalid: ($fields, language) ->
      that.debug $fields
      toastr.error "Please review the form for errors", null,
        positionClass: "toast-bottom-right"



VersionOneAssetEditor::loadAssets = (assetName, selectFields) ->
  url = @getAssetUrl(assetName) + "&" + $.param(sel: selectFields.join(","))
  request = @createRequest(url: url)
  that = this
  assets = $("#assets")
  assets.empty()
  $.ajax(request).done((data) ->
    toastr.info "Found " + data.length + " requests"
    i = 0

    while i < data.length
      item = data[i]
      that.listAppend item
      i++
    assets.listview "refresh"
  ).fail @_ajaxFail

VersionOneAssetEditor::listAppend = (item) ->
  assets = $("#assets")
  templ = @listItemFormat(item)
  assets.append templ

VersionOneAssetEditor::listItemFormat = (item) ->
  templ = $("<li></li>")
  that = this
  templ.html $("#assetItemTemplate").render(item)
  templ.children(".assetItem").bind "click", ->
    href = $(this).attr("data-href")
    that.debug "Href: " + href
    that.editAsset $(this).attr("data-href")

  templ

VersionOneAssetEditor::listItemPrepend = (item) ->
  templ = @listItemFormat(item)
  assets = $("#assets")
  assets.prepend templ
  assets.listview "refresh"

VersionOneAssetEditor::_normalizeIdWithoutMoment = (item) ->
  id = item._links.self.id
  @debug "The id from server with moment: " + id
  id = id.split(":")
  id.pop()  if id.length is 3
  id = id.join(":")
  item._links.self.id = id
  @debug "Normalized id: " + id

VersionOneAssetEditor::listItemReplace = (item) ->
  
  # Thanks to Moments:
  id = item._links.self.id
  templ = @listItemFormat(item)
  assets = $("#assets")
  that = this
  assets.find("a[data-assetid='" + id + "']").each ->
    that.debug "Found a list item:"
    that.debug this
    listItem = $(this)
    
    #var newItem = that.listItemFormat(item);
    listItem.closest("li").replaceWith templ

  assets.listview "refresh"

VersionOneAssetEditor::newAsset = ->
  @toggleNewOrEdit "new"
  @changePage "#detail"
  @resetForm()
  
  # Hardcoded:
  unless @requestorName is ""
    $("#RequestedBy").val @requestorName
    $("#Name").focus()
  else
    $("#RequestedBy").focus()

VersionOneAssetEditor::editAsset = (href) ->
  url = @host + href + "?" + $.param(@queryOpts)
  request = @createRequest(url: url)
  that = this
  # See if a link exists
  # TODO: handle this better, but works for now...
  
  # Again: hard-coded select list here:
  $.ajax(request).done((data) ->
    that.debug data
    that.enumFields (key, field) ->
      that.debug "getting: " + key
      val = data[key]
      if val? and val isnt "undefined"
        els = $("#" + key)
        if els.length > 0
          that.debug key
          el = $(els[0])
          el.val data[key]
      else
        links = data._links
        val = links[key][0]
        if val?
          id = val.idref
          href = val.href
          relUrl = that.host + href + "?" + $.param(that.queryOpts) + "&sel=Name"
          relRequest = that.createRequest(url: relUrl)
          $.ajax(relRequest).done((data) ->
            if data? and data isnt "undefined" and data isnt ""
              els = $("#" + key)
              if els.length > 0
                select = $(els[0])
                select.selectmenu()
                that._normalizeIdWithoutMoment data
                id = data._links.self.id
                that.debug key + ": " + id
                select.val id
                select.selectmenu "refresh", true
          ).fail @_ajaxFail

    that.toggleNewOrEdit "edit", href
    that.changePage "#detail"
  ).fail @_ajaxFail

VersionOneAssetEditor::toggleNewOrEdit = (type, href) ->
  save = $("#save")
  saveAndNew = $("#saveAndNew")
  that = this
  if type is "new"
    save.unbind "click"
    save.bind "click", (evt) ->
      evt.preventDefault()
      that.createAsset that.assetName, (asset) ->
        
        # refresh
        that.editAsset asset._links.self.href


    saveAndNew.unbind "click"
    saveAndNew.bind "click", (evt) ->
      evt.preventDefault()
      that.createAsset that.assetName, ->
        that.debug "About to call newAsset"
        that.newAsset()
        
        # Hardcoded:
        $("#Name").focus()


  else if type is "edit"
    save.unbind "click"
    save.bind "click", (evt) ->
      evt.preventDefault()
      that.updateAsset href

    saveAndNew.unbind "click"
    saveAndNew.bind "click", (evt) ->
      evt.preventDefault()
      that.updateAsset href, ->
        that.debug "edit:saveAndNew: about to call newAsset"
        that.newAsset()



VersionOneAssetEditor::createRequest = (options) ->
  options.headers = @headers  unless @serviceGateway
  options

VersionOneAssetEditor::createAsset = (assetName, callback) ->
  url = @getAssetUrl(assetName)
  @requestorName = $("#RequestedBy").val()
  @saveAsset url, "assetCreated", callback

VersionOneAssetEditor::on "assetCreated", (that, asset) ->
  toastr.success "New item created"
  that._normalizeIdWithoutMoment asset
  that.listItemPrepend asset

VersionOneAssetEditor::updateAsset = (href, callback) ->
  url = @host + href + "?" + $.param(@queryOpts)
  @debug url
  @saveAsset url, "assetUpdated", callback

VersionOneAssetEditor::on "assetUpdated", (that, asset) ->
  toastr.success "Save successful"
  that._normalizeIdWithoutMoment asset
  that.listItemReplace asset

VersionOneAssetEditor::saveAsset = (url, eventType, callback) ->
  dtoResult = @createDto()
  return  if dtoResult[0] is true
  @clearErrors()
  dto = dtoResult[1]
  request = @createRequest(
    url: url
    type: "POST"
    data: JSON.stringify(dto)
    contentType: @contentType
  )
  that = this
  $.ajax(request).done((data) ->
    that.debug "Ajax done: "
    that.debug data
    if callback
      that.debug "About to call callback"
      callback data
    that.trigger eventType, that, data
  ).fail @_ajaxFail

VersionOneAssetEditor::createDto = (addProjectIdRef) ->
  addProjectIdRef = true  if addProjectIdRef isnt false
  data = $("#assetForm").triggerHandler("submitForm")
  @debug "After submit trigger (validation should fire):"
  @debug data
  return [true, null]  unless data
  attributes = {}
  attributes._links = Scope:
    idref: @projectScopeId

  hasError = false
  $("#assetForm .inputField").each ->
    el = $(this)
    id = el.attr("id")
    val = el.val()
    required = el.attr("data-required")
    relationAssetName = el.attr("data-rel")
    if required is "true" and (not val? or val is "undefined" or val is "")
      hasError = true
      error = $("#err" + id)
      label = error.attr("data-label")
      error.text label + " is required"
    if relationAssetName? and relationAssetName isnt "" and relationAssetName isnt "undefined"
      attributes._links[relationAssetName] = idref: val
    else
      attributes[id] = val  if id isnt "undefined" and id?

  @debug attributes
  [hasError, attributes]

VersionOneAssetEditor::getAssetUrl = (assetName) ->
  url = @service + assetName + "?" + $.param(@queryOpts)
  url

VersionOneAssetEditor::changePage = (page) ->
  @debug page
  $.mobile.changePage page

VersionOneAssetEditor::clearErrors = ->
  $(".error").text ""

VersionOneAssetEditor::resetForm = ->
  @debug "resetForm"
  @enumFields (key, field) ->
    $("#" + field.name).each ->
      unless field.type is "select"
        $(this).val ""
        $(this).textinput()


  
  # TODO: this is hard-coded
  sel = $("#Priority")
  sel.val "RequestPriority:167"
  sel.selectmenu "refresh"


#this.configureValidation();
VersionOneAssetEditor::enumFields = (callback) ->
  for i of @fields
    field = @fields[i]
    key = field.name
    callback key, field

VersionOneAssetEditor::findField = (fieldName) ->
  fields = [null]
  index = 0
  addField = (key, field) ->
    fields[index++] = field  if key is fieldName

  @enumFields addField
  fields[0]