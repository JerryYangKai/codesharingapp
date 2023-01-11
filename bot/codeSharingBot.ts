import {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
  Attachment,
} from "botbuilder";
import {
  AppBasedLinkQuery,
  MessagingExtensionAction,
  MessagingExtensionActionResponse,
  MessagingExtensionResponse,
} from "botframework-schema";
import { Credentials } from "./helper/auth";
import { CodeCard } from "./helper/codeCard";
import {
  reqCodeDataFromGitHubAPI,
  reqCodeDataFromAzDOAPI,
} from "./helper/reqHelper";

export class CodeSharingBot extends TeamsActivityHandler {
  public async handleTeamsAppBasedLinkQuery(
    context: TurnContext,
    query: AppBasedLinkQuery
  ): Promise<any> {
    // Link obtained has `amp;` in the url if the url contains `&`, simply replace it.
    const url = query.url.replace(/&amp;/g, "&");
    return unfurlingUrl(url, context, query);
  }

  // Using Action as a backup.
  public async handleTeamsMessagingExtensionSubmitAction(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<any> {
    switch (action.commandId) {
      case "createCard":
        return createCardCommand(context, action);
      default:
        throw new Error("NotImplemented");
    }
  }
}

async function createCardCommand(
  context: TurnContext,
  action: MessagingExtensionAction
): Promise<MessagingExtensionActionResponse> {
  // The user has chosen to create a card by choosing the 'Create Card' context menu command.
  const data = action.data;
  const url: string = data.URL;
  return unfurlingUrl(url, context, action);
}

/**
 * Function to get attachment for link unfurling displaying.
 * @param url
 * @param context
 * @param query object that contains the magic code for OAuth flow
 * @returns composeExtension for link unfurling displaying.
 */
async function unfurlingUrl(
  url: string,
  context: TurnContext,
  query: any
): Promise<MessagingExtensionResponse> {
  // If URL contains `github`, use GitHub API route.
  if (url.includes("github.com")) {
    return await handleGitHubUrl(url);
  } else if (url.includes(".visualstudio.com")) {
    const credentials = new Credentials(context);
    const tokenResponse = await credentials.getUserToken(query);
    if (!tokenResponse || !tokenResponse.token) {
      // There is no token, so the user has not signed in yet.
      return credentials.getSignInComposeExtension();
    }
    return await handleAzDOUrl(url, tokenResponse.token);
  }
}

async function handleGitHubUrl(
  url: string
): Promise<MessagingExtensionResponse> {
  var card: Attachment;
  // Option to choose whether to use GitHub self-rendered HTML or not.
  const codeCard: CodeCard = await reqCodeDataFromGitHubAPI(url);
  if (!codeCard) {
    return;
  }
  card = CardFactory.heroCard("", undefined, [
    {
      title: "View in GitHub",
      type: "openUrl",
      value: codeCard.originUrl,
    },
    {
      title: "Open in vscode.dev",
      type: "openUrl",
      value: codeCard.webEditorUrl,
    },
  ]);
  card.content.title = codeCard.title;
  card.content.subtitle = codeCard.subtitle;
  card.content.text = codeCard.text;
  const attachment = {
    contentType: card.contentType,
    content: card.content,
    preview: card,
  };

  return {
    composeExtension: {
      type: "result",
      attachmentLayout: "list",
      attachments: [attachment],
    },
  };
}

async function handleAzDOUrl(
  url: string,
  token?: string
): Promise<MessagingExtensionResponse> {
  var card: Attachment;
  const codeCard: CodeCard = await reqCodeDataFromAzDOAPI(url, token);
  if (!codeCard) {
    return;
  }
  card = CardFactory.heroCard("", undefined, [
    {
      title: "View in Azure DevOps",
      type: "openUrl",
      value: codeCard.originUrl,
    },
    {
      title: "Open in vscode.dev",
      type: "openUrl",
      value: codeCard.webEditorUrl,
    },
  ]);
  card.content.title = codeCard.title;
  card.content.subtitle = codeCard.subtitle;
  card.content.text = codeCard.text;
  const attachment = {
    contentType: card.contentType,
    content: card.content,
    preview: card,
  };

  return {
    composeExtension: {
      type: "result",
      attachmentLayout: "list",
      attachments: [attachment],
    },
  };
}
