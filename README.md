# Description
This Teams App is used to display formatted code in Teams with Adaptive Card.

# How to Run

1. From Visual Studio Code: Start debugging the project by hitting the `F5` key in Visual Studio Code. Need Teams Toolkit extension installed.

# Note
- API for code rendering: see in function `renderCodeWithAPI` in `reqHelper.ts`, modify to another API if needed.
- Link unfurling: see in `templates/appPackage/manifest.template.json`, modify `github.com` to other domains if needed.

# Features
## Link Unfurling
- Github related URLs: Code Sharing Extension generated URLs, it is like `https://github.com/OfficeDev/TeamsFx-Samples/blob/master/test.py#L1-L6?x=a&y=b`.

## Create Card
Find button `Create Card` in Message Extension App and click to enter the same URLs as above.
Then adaptive cards will be created the same as Link Unfurling.
