define ->
  return  {
    RequestedBy:
      title: 'Requested By'
      autofocus: true     
      
    Name:
      title: 'Request Title'

    Custom_RequestedETA:
      title: 'Requested by (ETA)'
      type: 'Date'

    Description:
      title: 'Request Description (Project & Why needed)'
      type: 'TextArea'

    Custom_ProductService:
      title: 'Product/Service'
      type: 'Select'
      assetName: 'Custom_Product'

    Custom_Team2:
      title: 'Team'
      type: 'Select'
      assetName: 'Custom_Team'

    Custom_HWRequestedlistandcostperunit:
      title: 'Capacity or HW Requested'
      type: 'TextArea'

    Custom_RequestImpact:
      title: 'Request Impact'
      type: 'Select'
      assetName: 'Custom_Severity'

    Priority:
      title: 'Priority'
      type: 'Select'
      assetName: 'RequestPriority'
  }