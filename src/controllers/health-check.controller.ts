import { inject } from "@loopback/context";
import { oas } from "@loopback/openapi-v3";
import { Response, RestBindings } from "@loopback/rest";

export class HealthCheckController {
  constructor(@inject(RestBindings.Http.RESPONSE) protected res: Response) {}

  @oas.get("/health-check")
  @oas.response(200, {
    content: {
      "application/text": {
        schema: { type: "string" },
      },
    },
  })
  public async healthCheck(): Promise<void> {
    this.res.sendStatus(200);
  }
}
