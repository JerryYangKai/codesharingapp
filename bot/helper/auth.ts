import axios from "axios";
import { MessagingExtensionResponse } from "botbuilder";

const authConfig = {
  appId: process.env.APP_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: `${process.env.BOT_ENDPOINT}/auth-end.html`,
  initiateLoginEndpoint: `${process.env.BOT_ENDPOINT}/auth-start.html`,
};

export const scopes = ["vso.build"];

export interface TokenRes {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token: string;
}

export async function getAccessToken(code: string): Promise<TokenRes> {
  function formatData(
    clientSecret: string,
    code: string,
    redirectUri: string
  ): string {
    return `client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion=${clientSecret}&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${code}&redirect_uri=${redirectUri}`;
  }
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  return (await axios.post(
    "https://app.vssps.visualstudio.com/oauth2/token",
    formatData(authConfig.clientSecret, code, authConfig.redirectUri),
    { headers: headers }
  )).data;
}

export function getSignInResponseForMessageExtension(
  scopes: string[]
): MessagingExtensionResponse {
  const queryParam = {
    clientId: authConfig.appId,
    scope: [...scopes].join(" "),
  };
  const signInLink = `${authConfig.initiateLoginEndpoint}?${new URLSearchParams(
    queryParam
  ).toString()}`;
  return {
    composeExtension: {
      type: "auth",
      suggestedActions: {
        actions: [
          {
            type: "openUrl",
            value: signInLink,
            title: "Message Extension OAuth",
          },
        ],
      },
    },
  };
}
