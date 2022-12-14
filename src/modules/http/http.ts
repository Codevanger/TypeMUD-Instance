import { CoreModule } from "../../utils/classes/module.ts";
import { log } from "../../utils/functions/log.ts";
import { Context } from "../../utils/types/context.d.ts";

/**
 * Web server module.
 */
export class GameHttp extends CoreModule {
  public priority = 100;

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
    this.initHttpServer();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Web")) {
      throw new Error("Can't load Web module twice!");
    }

    super.canLoad();

    return true;
  }

  private async initHttpServer(): Promise<void> {
    const server = Deno.listen({ port: 8080 });
    log("DEBUG", "HTTP server started on port 8080");

    for await (const conn of server) {
      const httpConn = Deno.serveHttp(conn);

      for await (const requestEvent of httpConn) {
        const response = {
          online: this.context.clients.length,
          version: this.context.version,
        };

        requestEvent.respondWith(
          new Response(JSON.stringify(response), { status: 200 })
        );
      }
    }
  }
}
