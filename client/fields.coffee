define ->
  fieldsConfig =
    default :
      RequestedBy:
        title: 'Requested By'
        autofocus: true

      Name:
        title: 'Request Title'

      Description:
        title: 'Request Description (Project & Why needed)'
        type: 'TextArea'
        optional: true

      Priority:
        title: 'Priority'
        type: 'Select'
        assetName: 'RequestPriority'