// Auto generated content, please customize files under provision folder

@secure()
param provisionParameters object
param provisionOutputs object
@secure()
param currentAppSettings object

var botWebAppName = split(provisionOutputs.webAppOutput.value.resourceId, '/')[8]
var botAadAppClientId = provisionParameters['botAadAppClientId']
var botAadAppClientSecret = provisionParameters['botAadAppClientSecret']

resource botWebAppSettings 'Microsoft.Web/sites/config@2021-02-01' = {
  name: '${botWebAppName}/appsettings'
  properties: union({
      MicrosoftAppId: botAadAppClientId // ID of your bot
      MicrosoftAppPassword: botAadAppClientSecret // Secret of your bot
      MicrosoftAppType: 'MultiTenant'
      ConnectionName: provisionOutputs.botOutput.value.connectionName
      IDENTITY_ID: provisionOutputs.identityOutput.value.identityClientId // User assigned identity id, the identity is used to access other Azure resources
      APPINSIGHTS_INSTRUMENTATIONKEY: provisionOutputs.appInsightsOutput.value.appId
      APPINSIGHTS_PROFILERFEATURE_VERSION: '1.0.0'
      APPINSIGHTS_SNAPSHOTFEATURE_VERSION: '1.0.0'
      APPLICATIONINSIGHTS_CONNECTION_STRING: provisionOutputs.appInsightsOutput.value.connectionString
      ApplicationInsightsAgent_EXTENSION_VERSION: '~2'
      DiagnosticServices_EXTENSION_VERSION: '~3'
      InstrumentationEngine_EXTENSION_VERSION: 'disable'
      SnapshotDebugger_EXTENSION_VERSION: 'disable'
      XDT_MicrosoftApplicationInsights_BaseExtensions: 'disable'
      XDT_MicrosoftApplicationInsights_Java: '1'
      XDT_MicrosoftApplicationInsights_Mode: 'recommend'
      XDT_MicrosoftApplicationInsights_NodeJS: '1'
      XDT_MicrosoftApplicationInsights_PreemptSdk: 'disable'
    }, currentAppSettings)
}
