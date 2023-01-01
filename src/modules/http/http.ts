import { serve } from "https://deno.land/std@0.165.0/http/server.ts";
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

  private initHttpServer(): void {
    if (!this.context.params?.port) return;

    try {
      serve(this.handler.bind(this), { 
        port: this.context.params.port + 1, 
        onListen: () => log("INFO", `HTTP server started on port ${this.context.params!.port + 1}!`) 
      });

      log("DEBUG", `HTTP server started`);
    } catch (error) {
      log("ERROR", `Failed to start HTTP server!`);
      log("ERROR", error);
    }
  }

  private handler(_: Request): Response {
    const response = {
      online: this.context.clients.length,
      version: this.context.version,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
