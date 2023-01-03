// Auto generated content, please customize files under provision folder

@secure()
param provisionParameters object
param provisionOutputs object
@secure()
param currentAppSettings object

var botWebAppName = provisionOutputs.webAppOutput.value.siteName
var botAadAppClientId = provisionParameters['botAadAppClientId']
var botAadAppClientSecret = provisionParameters['botAadAppClientSecret']
var azdoAppId = provisionParameters['azdoAppId']
var azdoClientSecret = provisionParameters['azdoClientSecret']

resource botWebAppSettings 'Microsoft.Web/sites/config@2021-02-01' = {
  name: '${botWebAppName}/appsettings'
  properties: union({
      BOT_ID: botAadAppClientId // ID of your bot
      BOT_PASSWORD: botAadAppClientSecret // Secret of your bot
      IDENTITY_ID: provisionOutputs.identityOutput.value.identityClientId // User assigned identity id, the identity is used to access other Azure resources
      APP_ID: azdoAppId
      CLIENT_ID: azdoClientSecret
      BOT_ENDPOINT: provisionOutputs.webAppOutput.value.siteEndpoint
    }, currentAppSettings)
}
