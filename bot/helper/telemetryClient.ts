import { setup, TelemetryClient, defaultClient } from "applicationinsights";
import { MiddlewareHandler } from "botbuilder";

export let TelemetryReporter: TelemetryClient;

export function setupApplicationInsights(): void {
  try {
    setup().start();
  } catch (e) {
    console.warn(JSON.stringify(e));
  }
  TelemetryReporter = defaultClient;
}

export const TelemetryMiddleware: MiddlewareHandler = async (context, next) => {
  await next();
  const eventName = "Usage";
  const source =
    context.activity.name === "composeExtension/queryLink"
      ? "linkUnfurling"
      : context.activity.name === "composeExtension/submitAction" &&
        context.activity.value.commandId === "createCard"
      ? "createCard"
      : "Unsupported";
  const url = context.activity.value.url || context.activity.value.data.URL;
  const urlType = url.includes("github.com")
    ? "GitHub"
    : url.includes(".visualstudio.com")
    ? "AzDo"
    : "Unsupported";
  TelemetryReporter.trackEvent({
    name: eventName,
    properties: {
      id: context.activity.from.id,
      source: source,
      urlType: urlType,
    },
  });
};
