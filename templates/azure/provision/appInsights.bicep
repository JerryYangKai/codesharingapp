@secure()
param provisionParameters object

var resourceBaseName = provisionParameters.resourceBaseName
var appInsightsName = resourceBaseName
var logAnalyticsName = resourceBaseName

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: resourceGroup().location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: resourceGroup().location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

output appId string = appInsights.properties.AppId
output connectionString string = appInsights.properties.ConnectionString
