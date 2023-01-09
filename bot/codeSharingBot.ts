import {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
  Attachment,
  CloudAdapter,
} from "botbuilder";
import { Credentials } from "./helper/auth";
import { CodeCard } from "./helper/codeCard";
import {
  reqCodeDataFromGitHubAPI,
  reqCodeDataFromAzDOAPI,
} from "./helper/reqHelper";

export class CodeSharingBot extends TeamsActivityHandler {
  public async handleTeamsAppBasedLinkQuery(
    context: TurnContext,
    query: any
  ): Promise<any> {
    // Link obtained has `amp;` in the url if the url contains `&`, simply replace it.
    const url = query.url.replace(/&amp;/g, "&");
    // Unfurling link contains `github`.
    if (url.includes("github.com")) {
      return await handleGitHubUrl(url);
    } else if (url.includes(".visualstudio.com")) {
      const credentials = new Credentials(context);
      const tokenResponse = await credentials.getUserToken();
      if (!tokenResponse || !tokenResponse.token) {
        // There is no token, so the user has not signed in yet.
        return credentials.getSignInComposeExtension();
      }
      return await handleAzDOUrl(url, tokenResponse.token);
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

async function createCardCommand(
  context: TurnContext,
  action: any
): Promise<any> {
  // The user has chosen to create a card by choosing the 'Create Card' context menu command.
  const data = action.data;
  const url: string = data.URL;
  // If URL contains `github`, use GitHub API route.
  if (url.includes("github.com")) {
    return await handleGitHubUrl(url);
  } else if (url.includes(".visualstudio.com")) {
    const credentials = new Credentials(context);
    const tokenResponse = await credentials.getUserToken();
    if (!tokenResponse || !tokenResponse.token) {
      // There is no token, so the user has not signed in yet.
      return credentials.getSignInComposeExtension();
    }
    return await handleAzDOUrl(url, tokenResponse.token);
  }
}

/**
 * Function to get attachment for link unfurling displaying.
 * @param url
 * @returns composeExtension for link unfurling displaying.
 */
async function handleGitHubUrl(url: string) {
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

/**
 * Function to get attachment for link unfurling displaying.
 * @param url
 * @returns composeExtension for link unfurling displaying.
 */
async function handleAzDOUrl(url: string, token?: string) {
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
