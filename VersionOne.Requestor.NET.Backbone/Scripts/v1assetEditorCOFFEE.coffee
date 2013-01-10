define ["backbone", "underscore", "toastr", "jquery", "jquery.mobile", "jsrender"], (Backbone, _, toastr, $) ->
  log = (message) ->
    console.log message
  error = (message) ->
    toastr.error message
  success = (message) ->
    toastr.success message
  info = (message) ->
    toastr.info message
  debug = (message) ->
    console.log message  if debugEnabled
  VersionOneAssetEditor = (options) ->
    continueSettingOptions = ->
      options.whereParamsForProjectScope =
        acceptFormat: contentType
        sel: ""

      options.queryOpts = acceptFormat: contentType
      options.contentType = contentType
      for key of options
        that[key] = options[key]
      that.initialize()
    contentType = "haljson"
    that = this
    debugEnabled = options.showDebug
    if options.serviceGateway
      $.ajax(options.serviceGateway).done((data) ->
        options.headers = data
        continueSettingOptions()
      ).fail (ex) ->
        error "Failed to get setup data. The URL used was: " + options.serviceGateway
        log ex

    else
      options.headers = Authorization: "Basic " + btoa(options.versionOneAuth) # TODO: clean this up
      continueSettingOptions()
  $.fn.pressEnter = (fn) ->
    @each ->
      $(this).bind "enterPress", fn
      $(this).keyup (e) ->
        $(this).trigger "enterPress"  if e.keyCode is 13



  debugEnabled = false
  _.extend VersionOneAssetEditor::, Backbone.Events
  VersionOneAssetEditor::debug = (message) ->
    log message  if @showDebug

  VersionOneAssetEditor::initialize = ->
    @requestorName = ""
    @refreshFieldSet "default"
    @debug @formFields
    that = this
    $(".new").click ->
      that.newAsset()

    selectFields = []
    that.enumFields (key, field) ->
      
      # TODO: hard-coded
      selectFields.push key  if key isnt "Description" and field.sel isnt false

    that.selectFields = selectFields
    $("#projectsPage").live "pageinit", @configureProjectSearch
    $("#list").live "pageinit", @configureListPage
    @configureProjectSearch()
    @toggleNewOrEdit "new"

  VersionOneAssetEditor::refreshFormModel = ->
    @assetModel = Backbone.Model.extend(schema: @formFields[@fieldSetName])

  VersionOneAssetEditor::configureProjectSearch = ->
    that = this
    searchTerm = undefined
    ajaxRequest = undefined
    projectSearch = $("#projectSearch")
    projectSearch.pressEnter ->
      return  if searchTerm is $(this).val()
      searchTerm = $(this).val()
      return  if searchTerm.length < 4
      $.mobile.showPageLoadingMsg()
      ajaxRequest.abort()  if ajaxRequest
      assetName = "Scope"
      url = that.getAssetUrl(assetName) + "&" + $.param(
        sel: "Name"
        page: "100,0"
        find: "'" + searchTerm + "'"
        findin: "Name"
      )
      request = that.createRequest(url: url)
      projects = $("#projects")
      ajaxRequest = $.ajax(request).done((data) ->
        ajaxRequest = `undefined`
        projects = $("#projects").empty()
        $.each data, (i, val) ->
          that.projectItemAppend val

        projects.listview "refresh"
        $.mobile.hidePageLoadingMsg()
      ).fail(that._ajaxFail)


  VersionOneAssetEditor::configureListPage = ->
    assets = $("#assets")
    assets.empty()
    assets.listview()

  VersionOneAssetEditor::_ajaxFail = (ex) ->
    console.log "Error: "
    console.log ex

  VersionOneAssetEditor::loadRequests = (projectIdref) ->
    @projectIdref = projectIdref
    @refreshFieldSet projectIdref
    url = @getAssetUrl(@assetName) + "&" + $.param(
      where: "Scope='" + projectIdref + "'"
      sel: "Name,RequestedBy"
      page: "75,0" # TODO: temporary... until real paging support
      sort: "-ChangeDate"
    )
    request = @createRequest(url: url)
    that = this
    assets = $("#assets")
    assets.empty()
    $.ajax(request).done((data) ->
      info "Found " + data.length + " requests"
      i = 0

      while i < data.length
        item = data[i]
        that.listAppend item
        i++
      assets.listview "refresh"
    ).fail @_ajaxFail
    @changePage "#list"

  VersionOneAssetEditor::refreshFieldSet = (fieldSetName) ->
    if @formFields[fieldSetName] isnt `undefined`
      @fieldSetName = fieldSetName
    else
      @fieldSetName = "default"
    @refreshFormModel()

  VersionOneAssetEditor::getFormFields = ->
    @formFields[@fieldSetName]

  VersionOneAssetEditor::getFormFieldsForSelectQuery = ->
    fields = []
    @enumFields (key) ->
      fields.push key

    fields = fields.join(",")
    fieldsClause = $.param(sel: fields)
    fieldsClause

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
      that.editAsset $(this).attr("data-href")

    templ

  VersionOneAssetEditor::projectItemAppend = (item) ->
    projects = $("#projects")
    templ = @projectItemFormat(item)
    projects.append templ

  VersionOneAssetEditor::projectItemFormat = (item) ->
    templ = $("<li></li>")
    that = this
    templ.html $("#projectItemTemplate").render(item)
    templ.children(".projectItem").bind "click", ->
      idref = $(this).attr("data-idref")
      that.loadRequests idref

    templ

  VersionOneAssetEditor::projectSelect = (href) ->
    projectSelect

  VersionOneAssetEditor::listItemPrepend = (item) ->
    templ = @listItemFormat(item)
    assets = $("#assets")
    assets.prepend templ
    assets.listview "refresh"

  VersionOneAssetEditor::_normalizeIdWithoutMoment = (item) ->
    id = item._links.self.id
    id = id.split(":")
    id.pop()  if id.length is 3
    id = id.join(":")
    item._links.self.id = id

  VersionOneAssetEditor::_normalizeHrefWithoutMoment = (item) ->
    href = item._links.self.href
    if href.match(/\D\/\d*?\/\d*$/)
      href = href.split("/")
      href.pop()
      href = href.join("/")
      item._links.self.href = href

  VersionOneAssetEditor::listItemReplace = (item) ->
    
    # Thanks to Moments:
    id = item._links.self.id
    templ = @listItemFormat(item)
    assets = $("#assets")
    that = this
    assets.find("a[data-assetid='" + id + "']").each ->
      listItem = $(this)
      
      #var newItem = that.listItemFormat(item);
      listItem.closest("li").replaceWith templ

    assets.listview "refresh"

  VersionOneAssetEditor::newAsset = (callback) ->
    that = this
    asset = new @assetModel()
    @asset = asset
    form = new Backbone.Form(model: asset).render()
    @form = form
    $("#fields").html form.el
    unless callback
      callback = ->
        that.toggleNewOrEdit "new"
        that.changePage "#detail"
        that.resetForm()
    @configSelectLists().done ->
      callback()

    $("#detail").trigger "create"
    
    # Hardcoded:
    unless @requestorName is ""
      $("[name='RequestedBy']").val @requestorName
      $("[name='Name']").focus()
    else
      $("[name='RequestedBy']").focus()

  VersionOneAssetEditor::configSelectLists = ->
    
    # Setup the data within select lists
    # TODO: this should not happen on EVERY new click.
    that = this
    promise = new $.Deferred()
    ajaxRequests = []
    selectLists = $("select[data-class='sel']")
    selectLists.each ->
      item = $(this)
      fieldName = item.attr("name")
      field = that.findField(fieldName)
      assetName = field.editorAttrs["data-assetName"]
      fields = field.formFields
      fields = ["Name"]  if not fields? or fields.length is 0
      url = that.service + assetName + "?" + $.param(that.queryOpts) + "&" + $.param(sel: fields.join(","))
      request = that.createRequest(
        url: url
        type: "GET"
      )
      ajaxRequest = $.ajax(request).done((data) ->
        if data.length > 0
          item.selectmenu()
          $.each data, (i, option) ->
            item.append "<option value='" + option._links.self.id + "'>" + option.Name + "</option>"

          item.selectmenu "refresh"
        else
          that.debug "No results for query: " + url
      ).fail(that._ajaxFail)
      ajaxRequests.push ajaxRequest

    return promise  if @resolveIfEmpty(promise, ajaxRequests)
    @resolveWhenAllDone promise, ajaxRequests
    promise

  VersionOneAssetEditor::resolveIfEmpty = (promise, ajaxRequests) ->
    if ajaxRequests.length < 1
      promise.resolve()
      return true
    false

  VersionOneAssetEditor::resolveWhenAllDone = (promise, ajaxRequests) ->
    $.when.apply($, ajaxRequests).then ->
      promise.resolve()


  VersionOneAssetEditor::editAsset = (href) ->
    url = @host + href + "?" + $.param(@queryOpts)
    fieldsClause = @getFormFieldsForSelectQuery()
    url += "&" + fieldsClause
    request = @createRequest(url: url)
    that = this
    populateForm = ->
      
      # TODO: hack:
      
      # TODO: need better way to do this
      
      # Again: hard-coded select list here:
      
      # Must do this to ensure that the linkId is properly in the closure,
      # not the most-recent value from above...
      $.ajax(request).done((data) ->
        modelData = that.form.getValue()
        links = data._links
        for key of modelData
          value = data[key]
          if value
            if key is "Custom_RequestedETA"
              value = new Date(Date.parse(value))
              value = new Date(2012, 11, 28)
            if data[key] isnt `undefined`
              that.form.setValue key, value
            else
              that.debug "Setting Key: " + key + " is undefined"
          else
            rel = links[key]
            continue  if rel is `undefined`
            val = links[key]
            if val? and val.length > 0
              val = val[0]
              id = val.idref
              assetHref = val.href
              relUrl = that.host + assetHref + "?" + $.param(that.queryOpts) + "&sel=Name"
              relRequest = that.createRequest(url: relUrl)
              getData = (relKey, linkId) ->
                $.ajax(relRequest).done((data) ->
                  if data? and data isnt "undefined" and data isnt ""
                    els = $("[name='" + relKey + "']")
                    if els.length > 0
                      select = $(els[0])
                      select.selectmenu()
                      that._normalizeIdWithoutMoment data
                      select.val linkId
                      select.selectmenu "refresh", true
                ).fail @_ajaxFail

              getData key, id
        that.toggleNewOrEdit "edit", href
        that.changePage "#detail"
        $("#detail").trigger "create"
      ).fail @_ajaxFail

    that.newAsset populateForm # TODO: hacky.

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
          that.newAsset()



  VersionOneAssetEditor::createRequest = (options) ->
    options.headers = @headers  unless @serviceGateway
    options

  VersionOneAssetEditor::createAsset = (assetName, callback) ->
    url = @getAssetUrl(assetName)
    @requestorName = $("#RequestedBy").val()
    @saveAsset url, "assetCreated", callback

  VersionOneAssetEditor::on "assetCreated", (that, asset) ->
    success "New item created"
    that._normalizeIdWithoutMoment asset
    that._normalizeHrefWithoutMoment asset
    that.listItemPrepend asset

  VersionOneAssetEditor::updateAsset = (href, callback) ->
    url = @host + href + "?" + $.param(@queryOpts)
    @saveAsset url, "assetUpdated", callback

  VersionOneAssetEditor::on "assetUpdated", (that, asset) ->
    success "Save successful"
    that._normalizeIdWithoutMoment asset
    that._normalizeHrefWithoutMoment asset
    that.listItemReplace asset

  VersionOneAssetEditor::saveAsset = (url, eventType, callback) ->
    validations = @form.validate()
    if validations?
      error "Please review the form for errors", null,
        positionClass: "toast-bottom-right"

      return
    dto = @createDto()
    debug "Dto:"
    debug dto
    request = @createRequest(
      url: url
      type: "POST"
      data: JSON.stringify(dto)
      contentType: @contentType
    )
    that = this
    $.ajax(request).done((data) ->
      that.trigger eventType, that, data
      callback data  if callback
    ).fail @_ajaxFail

  VersionOneAssetEditor::createDto = ->
    dto = @form.getValue()
    
    # TODO: hard-coded for test
    window.DTO = dto
    dto._links = Scope:
      idref: @projectIdref

    $("#fields select").each ->
      el = $(this)
      id = el.attr("name")
      val = el.val()
      relationAssetName = el.attr("data-rel")
      if relationAssetName
        dto._links[relationAssetName] = idref: val
        delete dto[id]

    dto

  VersionOneAssetEditor::getAssetUrl = (assetName) ->
    url = @service + assetName + "?" + $.param(@queryOpts)
    url

  VersionOneAssetEditor::changePage = (page) ->
    $.mobile.changePage page

  VersionOneAssetEditor::resetForm = ->
    @enumFields (key, field) ->
      $("[name='" + key + "']").each ->
        unless field.type is "select"
          $(this).val ""
          $(this).textinput()


    
    # TODO: this is hard-coded
    sel = $("[name='Priority']")
    sel.selectmenu()
    sel.val "RequestPriority:167"
    sel.selectmenu "refresh"

  VersionOneAssetEditor::enumFields = (callback) ->
    $.each @getFormFields(), (key, field) ->
      callback key, field


  VersionOneAssetEditor::findField = (fieldName) ->
    fields = [null]
    index = 0
    addField = (key, field) ->
      fields[index++] = field  if key is fieldName

    @enumFields addField
    fields[0]

  VersionOneAssetEditor
