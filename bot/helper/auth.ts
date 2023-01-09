import { CloudAdapter, TurnContext } from "botbuilder";

export async function getTokenFromAzureOauthConnection(context: TurnContext, query: any) {
  const adapter = context.adapter as CloudAdapter;
  const userTokenClient = context.turnState.get(adapter.UserTokenClientKey);

  const magicCode =
    query.state && Number.isInteger(Number(query.state)) ? query.state : "";

  const tokenResponse = await userTokenClient.getUserToken(
    context.activity.from.id,
    process.env.ConnectionName,
    context.activity.channelId,
    magicCode
  );
  console.log(JSON.stringify(tokenResponse));
  return tokenResponse;
}
