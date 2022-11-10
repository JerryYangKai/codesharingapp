import {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
  Attachment,
} from "botbuilder";
import { CodeCard } from "./helper/codeCard";
import { reqCodeDataFromGitHubAPI } from "./helper/reqHelper";

export class CodeSharingBot extends TeamsActivityHandler {

  public async handleTeamsAppBasedLinkQuery(context: TurnContext, query: any): Promise<any> {
    // Link obtained has `amp;` in the url if the url contains `&`, simply replace it.
    const url = query.url.replace("amp;","");
    // Unfurling link contains `github`. 
    if (url.includes('github.com')){
      return await handleGitHubUrl(url);
    }
  }

  // Using Action as a backup.
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
 * @param url
 * @returns composeExtension for link unfurling displaying.
 */
async function handleGitHubUrl(url: string){
  var card: Attachment;
  // Option to choose whether to use GitHub self-rendered HTML or not.
  const codeCard: CodeCard =  await reqCodeDataFromGitHubAPI(url, false);
  if (!codeCard){
    return;
  }
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