import { TelemetryClient } from "applicationinsights";
import {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
  Attachment,
} from "botbuilder";
import { CodeCard } from "./helper/codeCard";
import { 
  reqCodeDataFromGitHubAPI
 } from "./helper/reqHelper";

export class CodeSharingBot extends TeamsActivityHandler {

  private telemetryClient: TelemetryClient;
  /**
   * @param {TelemetryClient} telemetryClient
   */
  constructor(telemetryClient: TelemetryClient) {
      super();
      this.telemetryClient = telemetryClient;
  }

  public async handleTeamsAppBasedLinkQuery(context: TurnContext, query: any): Promise<any> {
    // Link obtained has `amp;` in the url if the url contains `&`, simply replace it.
    const url = query.url.replace(/&amp;/g,'&');
    // Unfurling link contains `github`. 
    if (url.includes('github.com')){
      this.telemetryClient.trackEvent({name: "UsageLinkUnfurling", properties: {id: context.activity.from.id}});
      return await handleGitHubUrl(url, context, this.telemetryClient);
    } 
  }

  // Using Action as a backup.
  public async handleTeamsMessagingExtensionSubmitAction(
    context: TurnContext,
    action: any
  ): Promise<any> {
    switch (action.commandId) {
      case "createCard":
        return createCardCommand(context, action, this.telemetryClient);
      default:
        throw new Error("NotImplemented");
    }
  }
}

async function createCardCommand(context: TurnContext, action: any, telemetryClient: TelemetryClient): Promise<any> {
  // The user has chosen to create a card by choosing the 'Create Card' context menu command.
  const data = action.data;
  const url: string = data.URL;
  // If URL contains `github`, use GitHub API route.
  if (url.includes('github.com')){
    telemetryClient.trackEvent({name: "UsageCreateCard", properties: {id: context.activity.from.id}});
    return await handleGitHubUrl(url, context, telemetryClient);
  }
}

/**
 * Function to get attachment for link unfurling displaying.
 * @param url
 * @returns composeExtension for link unfurling displaying.
 */
async function handleGitHubUrl(url: string, context: TurnContext, telemetryClient: TelemetryClient){
  var card: Attachment;
  // Option to choose whether to use GitHub self-rendered HTML or not.
  const codeCard: CodeCard =  await reqCodeDataFromGitHubAPI(url);
  if (!codeCard){
    return;
  }
  telemetryClient.trackEvent({name: "UsageSucceed", properties: {id: context.activity.from.id}});
  card = CardFactory.heroCard(
    '',
    undefined,
    [
      {
        title: 'View in GitHub',
        type: 'openUrl',
        value: codeCard.originUrl
      },
      {
        title: 'Open in vscode.dev',
        type: 'openUrl',
        value: codeCard.webEditorUrl
      }
    ]);
  card.content.title = codeCard.title;
  card.content.subtitle = codeCard.subtitle;
  card.content.text = codeCard.text;
  const attachment = { contentType: card.contentType, content: card.content, preview: card };
  
  return {
    composeExtension: {
      type: "result",
      attachmentLayout: "list",
      attachments: [attachment],
    },
  };
}