import {
  getMiddlewareContext,
  ResolvedRoute,
  RestBindings,
} from "@loopback/rest";
import ddTrace from "dd-trace";
import * as ddTraceTags from "dd-trace/ext/tags";

function ddHook(span: any, req: any, res: any) {
  if (span && req) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const ctx = getMiddlewareContext(req as any);
    if (ctx) {
      const route = ctx.getSync<ResolvedRoute>(RestBindings.Operation.ROUTE, {
        optional: true,
      });
      const path = route?.path ?? ctx.request.path;
      span.setTag(ddTraceTags.HTTP_URL, ctx.request.url);
      span.setTag(ddTraceTags.HTTP_METHOD, ctx.request.method);
      span.setTag(ddTraceTags.HTTP_ROUTE, path);
      span.setTag(ddTraceTags.RESOURCE_NAME, `${ctx.request.method} ${path}`);
      span.setTag(ddTraceTags.HTTP_STATUS_CODE, ctx.response.statusCode);
    }
  }
}

ddTrace.init({
  logInjection: true,
  debug: true,
  logger: console,
});
ddTrace.use("express", {
  enabled: true,
  hooks: {
    request: ddHook,
  },
});
