import { DefaultSequence, RequestContext } from "@loopback/rest";
import * as ddTraceTags from "dd-trace/ext/tags";

import { tracer } from "./tracer";

export class DatadogSequence extends DefaultSequence {
  async handle(context: RequestContext): Promise<void> {
    /* added */ await tracer.trace("loopback.request.handle", async (span) => {
      try {
        context.bind('__dd_span').to(span);
        const { request, response } = context;
        // Invoke registered Express middleware
        const finished = await this.invokeMiddleware(context);

        /* added */ span?.setTag(ddTraceTags.HTTP_URL, request.url);
        /* added */ span?.setTag(ddTraceTags.HTTP_METHOD, request.method);

        if (finished) {
          // The response been produced by the middleware chain
          return;
        }
        const route = this.findRoute(request);

        const path = route?.path ?? request.path;
        /* added */ span?.setTag(ddTraceTags.HTTP_ROUTE, path);
        /* added */ span?.setTag(ddTraceTags.RESOURCE_NAME, `${request.method} ${path}`);

        const args = await this.parseParams(request, route);
        const result = await this.invoke(route, args);

        /* added */ span?.setTag(ddTraceTags.HTTP_STATUS_CODE, response.statusCode);

        this.send(response, result);
      } catch (error) {
        this.reject(context, error);
      }
    });
  }
}
