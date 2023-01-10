import { CloudAdapter, TurnContext } from "botbuilder";
import { UserTokenClient } from "botframework-connector";
import { Activity, TokenResponse } from "botframework-schema";

export class Credentials {
  private client: UserTokenClient;
  private activity: Activity;
  private connectionName = process.env.ConnectionName;

  constructor(context: TurnContext) {
    const adapter = context.adapter as CloudAdapter;
    this.client = context.turnState.get(
      adapter.UserTokenClientKey
    ) as UserTokenClient;
    this.activity = context.activity;
  }

  async getUserToken(query: any): Promise<TokenResponse> {
    const magicCode =
      query?.state && Number.isInteger(Number(query.state)) ? query.state : "";
    const tokenResponse = await this.client.getUserToken(
      this.activity.from.id,
      this.connectionName,
      this.activity.channelId,
      magicCode
    );
    return tokenResponse;
  }

  async getSignInComposeExtension(): Promise<any> {
    // Retrieve the OAuth Sign in Link to use in the MessagingExtensionResult Suggested Actions
    const signInLink = await this.getSignInLink();
    return {
      composeExtension: {
        type: "auth",
        suggestedActions: {
          actions: [
            {
              type: "openUrl",
              value: signInLink,
              title: "Bot Service OAuth",
            },
          ],
        },
      },
    };
  }

  async getSignInLink(): Promise<string> {
    const { signInLink } = await this.client.getSignInResource(
      this.connectionName,
      this.activity,
      ""
    );
    return signInLink;
  }
}
