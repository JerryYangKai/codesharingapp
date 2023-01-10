@secure()
param provisionParameters object
param botEndpoint string

var resourceBaseName = provisionParameters.resourceBaseName
var botAadAppClientId = provisionParameters.botAadAppClientId // Read AAD app client id for Azure Bot Service from parameters
var botServiceName = contains(provisionParameters, 'botServiceName') ? provisionParameters.botServiceName : '${resourceBaseName}' // Try to read name for Azure Bot Service from parameters
var botServiceSku = contains(provisionParameters, 'botServiceSku') ? provisionParameters.botServiceSku : 'F0' // Try to read SKU for Azure Bot Service from parameters
var botDisplayName = contains(provisionParameters, 'botDisplayName') ? provisionParameters.botDisplayName : '${resourceBaseName}' // Try to read display name for Azure Bot Service from parameters
var botConnectionName = contains(provisionParameters, 'botConnectionName') ? provisionParameters.botConnectionName : 'azdo'
var azdoAppClientId = provisionParameters.azdoAppId
var azdoAppClientSecret = provisionParameters.azdoClientSecret

// Register your web service as a bot with the Bot Framework
resource botService 'Microsoft.BotService/botServices@2021-03-01' = {
  kind: 'azurebot'
  location: 'global'
  name: botServiceName
  properties: {
    displayName: botDisplayName
    endpoint: uri(botEndpoint, '/api/messages')
    msaAppId: botAadAppClientId
  }
  sku: {
    name: botServiceSku // You can follow https://aka.ms/teamsfx-bicep-add-param-tutorial to add botServiceSku property to provisionParameters to override the default value "F0".
  }
}

// Connect the bot service to Microsoft Teams
resource botServiceMsTeamsChannel 'Microsoft.BotService/botServices/channels@2021-03-01' = {
  parent: botService
  location: 'global'
  name: 'MsTeamsChannel'
  properties: {
    channelName: 'MsTeamsChannel'
  }
}

resource botServiceOAuthConnection 'Microsoft.BotService/botServices/connections@2021-03-01' = {
  name: botConnectionName
  location: 'global'
  parent: botService
  properties: {
    clientId: azdoAppClientId
    clientSecret: azdoAppClientSecret
    name: botConnectionName
    parameters: [
      {
        key: 'ClientId'
        value: azdoAppClientId
      }
      {
        key: 'ClientSecret'
        value: azdoAppClientSecret
      }
      {
        key: 'ScopeListDelimiter'
        value: '\' \''
      }
      {
        key: 'AuthorizationUrlTemplate'
        value: 'https://app.vssps.visualstudio.com/oauth2/authorize'
      }
      {
        key: 'AuthorizationUrlQueryStringTemplate'
        value: '?client_id={ClientId}&response_type=Assertion&state={State}&scope={Scopes}&redirect_uri={RedirectUrl}'
      }
      {
        key: 'TokenUrlTemplate'
        value: 'https://app.vssps.visualstudio.com/oauth2/token'
      }
      {
        key: 'TokenUrlQueryStringTemplate'
        value: '?Content-Type=application/x-www-form-urlencoded'
      }
      {
        key: 'TokenBodyTemplate'
        value: 'client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion={ClientSecret}&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion={Code}&redirect_uri={RedirectUrl}'
      }
      {
        key: 'RefreshUrlTemplate'
        value: 'https://app.vssps.visualstudio.com/oauth2/token'
      }
      {
        key: 'RefreshUrlQueryStringTemplate'
        value: '?Content-Type=application/x-www-form-urlencoded'
      }
      {
        key: 'RefreshBodyTemplate'
        value: 'client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion={ClientSecret}&grant_type=refresh_token&assertion={RefreshToken}&redirect_uri={RedirectUrl}'
      }
    ]
    scopes: 'vso.build'
    serviceProviderDisplayName: 'Oauth 2 Generic Provider'
    serviceProviderId: '8379c6d2-b262-4d4f-b89b-68dc5b5f5482'
  }
}

output botConnectionName string = botServiceOAuthConnection.name
