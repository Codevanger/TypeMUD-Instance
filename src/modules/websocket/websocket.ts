import {
  WebSocketClient,
  WebSocketServer,
} from "https://deno.land/x/websocket@v0.1.4/mod.ts";
import { generate } from "https://deno.land/std@0.149.0/uuid/v1.ts";

import { CoreModule } from "../../utils/classes/module.ts";
import { Client } from "../../utils/types/client.d.ts";
import { Context } from "../../utils/types/context.d.ts";
import { Priority } from "../../utils/types/priority.d.ts";

export class WebSocketTransport extends CoreModule {
  private wsServer!: WebSocketServer;
  public priority: Priority = 0;

  constructor(protected context: Context) {
    super(context);

    this.canLoad();

    this.initWebSocketServer();
    this.initListeners();
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

  private initListeners(): void {
    this.initOnConnectedListener();
  }

  private initOnConnectedListener(): void {
    // this.wsServer.on("connection", async (connection) => {
    //   const client = await this.generateClient(connection);

    //   log("INFO", `New client connected via WebSocket! UUID - ${client.uuid}`);

    //   this.context.clients.push(client);

    //   const listeners: Listeners = this.loadedModules
    //     .filter(
    //       (module) => module.onClientConnected
    //     )
    //     .map((module) => this.context.loadedModules[module].onClientConnected!);

    //   if (listeners && listeners.length > 0) {
    //     listeners[0](listeners, {
    //       client,
    //     });
    //   }

    //   this.initOnDisconnectedListener(client);
    // });
  }

  private initOnDisconnectedListener(client: Client): void {
    // client.websocket.on("disconnection", () => {
    //   log("INFO", `Client ${client.uuid} disconnected!`);

    //   const listeners: Listeners = this.context.loadedModulesArray
    //     .filter(
    //       (module) => this.context.loadedModules[module].onClientDisconnected
    //     )
    //     .map(
    //       (module) => this.context.loadedModules[module].onClientDisconnected!
    //     );

    //   if (listeners && listeners.length > 0) {
    //     listeners[0](listeners, { client });
    //   }

    //   this.context.clients = this.context.clients.filter(
    //     (x) => x.uuid !== client.uuid
    //   );
    // });
  }

  private async generateClient(connection: WebSocketClient): Promise<Client> {
    const client: Client = {
      uuid: (await generate()) as string,
      websocket: connection,
    };

    return client;
  }
}
