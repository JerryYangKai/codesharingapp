import { setup, TelemetryClient, defaultClient } from "applicationinsights";
import { Activity, MiddlewareHandler } from "botbuilder";
import { ActivityName, CommandId, Domains } from "./constant";
import * as TelemetryConstants from "./telemetryConstants";

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
  const eventName = TelemetryConstants.EventNames.usage;
  TelemetryReporter.trackEvent({
    name: eventName,
    properties: {
      id: context.activity.from.id,
      source: resolveSource(context.activity),
      urlType: resolveUrlType(context.activity),
    },
  });
};

function resolveSource(activity: Activity): TelemetryConstants.Source {
  if (activity.name === ActivityName.queryLink) {
    return TelemetryConstants.Source.linkUnfurling;
  }
  if (
    activity.name === ActivityName.submitAction &&
    activity.value?.commandId === CommandId.createCard
  ) {
    return TelemetryConstants.Source.createCard;
  }
  return TelemetryConstants.Source.unsupported;
}

function resolveUrlType(activity: Activity): TelemetryConstants.UrlType {
  const url = activity.value.url || activity.value.data.URL;
  if (url?.includes(Domains.github)) {
    return TelemetryConstants.UrlType.github;
  }
  if (url?.includes(Domains.azdo)) {
    return TelemetryConstants.UrlType.azdo;
  }
  return TelemetryConstants.UrlType.unsupported;
}
