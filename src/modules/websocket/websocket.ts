import { WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

import { TransportModule } from "../../utils/classes/module.ts";
import { log } from "../../utils/functions/log.ts";
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
    try {
      this.wsServer = new WebSocketServer(this.context.params?.port);
    } catch (e) {
      log("ERROR", 'Can\'t start WebSocket server!');
      log("ERROR", e.message);

      throw new Error("Can't start WebSocket server!");
    }

    this.wsServer.on("connection", (socket) => {
      log("DEBUG", `Client ${this.context.clients.length + 1} connected!`);

      this.context.clients.push({
        id: this.context.clients.length + 1,
        websocket: socket,
        auth: false,
        character: null
      });

      const client = this.context.clients[this.context.clients.length - 1];

      socket.on("message", (message) => {
        if (message.startsWith("/")) {
          const command = message.split(" ")[0].slice(1).toUpperCase();
          const args = message.split(" ").slice(1);

          log("DEBUG", `Command from client ${this.context.clients.length}: ${command}`)
          log("DEBUG", `Args from client ${this.context.clients.length}: ${args}`)

          if (this.context.gameServer.modules.moduleCommands) {
            this.context.gameServer.modules.moduleCommands[command](client, ...args);
          } else {
            log("ERROR", `Command ${command} not found`);
            client.websocket.send("COMMAND: NOT_FOUND");
          }
        }
      });

      socket.on("close", () => {
        log("DEBUG", `Client ${client.id} disconnected!`);
      });
    });

    log("INFO", `WebSocket server started on port ${this.context.params?.port}!`);
  }
}
