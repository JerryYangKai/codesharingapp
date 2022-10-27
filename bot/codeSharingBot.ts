import {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
  Attachment,
} from "botbuilder";
import { CodeCard } from "./helper/codeCard";
import { reqCodeDataFromGitHubAPI } from "./helper/reqHelper";

export class CodeSharingBot extends TeamsActivityHandler {
  // Message extension Code
  // Action.
  public async handleTeamsMessagingExtensionSubmitAction(
    context: TurnContext,
    action: any
  ): Promise<any> {
    switch (action.commandId) {
      case "createCard":
        return createCardCommand(context, action);
      default:
        throw new Error("NotImplemented");
    }
  }

  // Link Unfurling.
  public async handleTeamsAppBasedLinkQuery(context: TurnContext, query: any): Promise<any> {
    // Link obtained has `amp;` in the url if the url contains `&`, simply replace it.
    const url = query.url.replace("amp;","");
    // If URL contains `github`, use GitHub API route. Else sending request to self-built endpoint for data.
    if (url.includes('github.com')){
      return await handleGitHubUrl(url);
    }
  }
}

async function createCardCommand(context: TurnContext, action: any): Promise<any> {
  // The user has chosen to create a card by choosing the 'Create Card' context menu command.
  const data = action.data;
  const url: string = data.URL;
  // If URL contains `github`, use GitHub API route.
  if (url.includes('github.com')){
    return await handleGitHubUrl(url);
  }
}

/**
 * Function to get attachment for link unfurling displaying.
 * @param url url from VSCode Extension which contains `github`
 * @returns composeExtension for link unfurling displaying.
 */
async function handleGitHubUrl(url: string){
  var card: Attachment;
  // Option to choose whether to use GitHub self-rendered HTML or not.
  var useGitHubRenderedHtml = false;

  // Dealing with GitHub code contents.
    const codeCard: CodeCard =  await reqCodeDataFromGitHubAPI(url, useGitHubRenderedHtml);
    if (codeCard == undefined){
      return;
    }
    // Only display `View in Github` if data is from GitHub.
    card = CardFactory.heroCard(
      '',
      undefined,
      [
        {
          title: 'View in Github',
          type: 'openurl',
          value: codeCard.uri
        }
      ]);
    card.content.text = codeCard.text;
    card.content.title = codeCard.title;
    const attachment = { contentType: card.contentType, content: card.content, preview: card };
    
    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: [attachment],
      },
    };
}
