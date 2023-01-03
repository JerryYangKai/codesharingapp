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
    Application website: https://{uuid}.ngrok.io
    Authorization callback URL: https://{uuid}.ngrok.io/auth-end.html
    Authorized scopes: Code(read)
    ```

1. Configure bot endpoint and bot domain in `.env.teamsfx.local` file.

    ```
    APP_ID=
    CLIENT_SECRET=
    BOT_ENDPOINT=
    BOT_DOMAIN=
    ```

1. Start debugging the project by hitting the `F5` key in Visual Studio Code. Need Teams Toolkit extension installed.

# Note
- API for code rendering: see in function `renderCodeWithAPI` in `reqHelper.ts`, modify to another API if needed.
- Link unfurling: see in `templates/appPackage/manifest.template.json`, modify `github.com` to other domains if needed.

# Features
## Link Unfurling
- GitHub permalink: It is like `https://github.com/OfficeDev/TeamsFx-Samples/blob/master/test.py#L1-L6?x=a&y=b`.

## Create Card
Find button `Create Card` in Message Extension App and click to enter the same URLs as above.
Then adaptive cards will be created the same as Link Unfurling.
