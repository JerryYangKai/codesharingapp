# Description
This Teams App is used to display formatted code in Teams with Adaptive Card.

# How to Run

1. From Visual Studio Code: Start debugging the project by hitting the `F5` key in Visual Studio Code. Need Teams Toolkit extension installed.

# Note
- GITHUB_TOKEN: add `GITHUB_TOKEN=${SOME_TOKEN}` in `.env.teamsfx.local`, using another Github Access Token before running. See [Create a Github Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
- API for code rendering: see in function `renderCodeWithAPI` in `reqHelper.ts`, modify to another API if needed.
- Link unfurling: see in `templates/appPackage/manifest.template.json`, modify `myexample.yty.com` to other domains if needed.

# Features
## Link Unfurling
- Github related URLs: Code Sharing Extension generated URLs, be like `https://github.com/chikaishiro/SJTU-project/blob/master/test.py#L1-L9&comment=a%20message%22`.
- (Archived) Self-built endpoint related URLs: be like `https://myexample.yty.com/share/BVirGY7V`
- (Archived) PR related URLs: be like `https://github.com/chikaishiro/SJTU-project/pull/1`.

## Create Card
Find button `Create Card` in Message Extension App and click to enter the same URLs as above.
Then adaptive cards will be created the same as Link Unfurling.
