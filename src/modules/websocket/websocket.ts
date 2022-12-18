import { WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

import { TransportModule } from "../../utils/classes/module.ts";
import { Context } from "../../utils/types/context.d.ts";
import { Priority } from "../../utils/types/priority.d.ts";

export class WebSocketTransport extends TransportModule {
  private wsServer!: WebSocketServer;
  public priority: Priority = 0;

  constructor(protected context: Context) {
    super(context);

    this.canLoad();

    this.initWebSocketServer();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "WebSocketTransport")) {
      throw new Error("Can't load WebSocketTransport module twice!");
    }

    super.canLoad();

    return true;
  }

  private initWebSocketServer(): void {
    this.wsServer = new WebSocketServer(this.context.params?.port);
  }
}
