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
    }, currentAppSettings)
}
