# Description

This Teams App is used to display formatted code in Teams with Adaptive Card.

# How to Run

## Visual Studio Code

1. Start ngrok.

   ```
   ngrok http 3978
   ```

1. Register Azure DevOps application for OAuth. https://app.vsaex.visualstudio.com/app/register.

   ```
   Application website: https://token.botframework.com/
   Authorization callback URL: https://token.botframework.com/.auth/web/redirect
   Authorized scopes: Build(read)
   ```

1. Register Azure AD app and Create Azure Bot Service.
   The message endpoint should be your ngrok endpoint.
   https://\*.ngrok.io/api/messages

1. Open Azure portal and navigate to the Azure Bot Service.

1. Select Configuration and add OAuth Connection Settings.

   ```
   Name: azdo
   Service Provider: Oauth 2 Generic Provider
   Client Id: /* The client id of AzDo app */
   Client Secret: /* The client secret of AzDo app */
   Scope List Delimiter: ' ' //
   Authorization URL Template: https://app.vssps.visualstudio.com/oauth2/authorize
   Authorization URL Query String Template: ?client_id={ClientId}&response_type=Assertion&state={State}&scope={Scopes}&redirect_uri={RedirectUrl}
   Token URL Template: https://app.vssps.visualstudio.com/oauth2/token
   Token URL Query String Template: ?Content-Type=application/x-www-form-urlencoded
   Token Body Template: client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion={ClientSecret}&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion={Code}&redirect_uri={RedirectUrl}
   Refresh URL Template: https://app.vssps.visualstudio.com/oauth2/token
   Refresh URL Query String Template: ?Content-Type=application/x-www-form-urlencoded
   Refresh Body Template: client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion={ClientSecret}&grant_type=refresh_token&assertion={RefreshToken}&redirect_uri={RedirectUrl}
   Scopes: vso.build
   ```

1. Configure bot endpoint and bot domain in `.env.teamsfx.local` file.

   ```
    MicrosoftAppId= /* bot id */
    MicrosoftAppPassword= /* bot secret */
    MicrosoftAppType=MultiTenant
    ConnectionName=azdo
   ```

1. Start debugging the project by hitting the `F5` key in Visual Studio Code. Need Teams Toolkit extension installed.

# Note

- API for code rendering: see in function `renderCodeWithAPI` in `reqHelper.ts`, modify to another API if needed.
- Link unfurling: see in `templates/appPackage/manifest.template.json`, modify `github.com` to other domains if needed.

# Features

## Link Unfurling

- GitHub permalink: It is like `https://github.com/OfficeDev/TeamsFx-Samples/blob/master/test.py#L1-L6?x=a&y=b`.
- Azure DevOps permalink: It is like `https://<org>.visualstudio.com/<org>/_git/<repo>?path=<path-to-code>&version=GBmain&line=1&lineEnd=10&lineStartColumn=1&lineEndColumn=2&lineStyle=plain&_a=contents`.

## Create Card

Find button `Create Card` in Message Extension App and click to enter the same URLs as above.
Then adaptive cards will be created the same as Link Unfurling.
