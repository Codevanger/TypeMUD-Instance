import { WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";
import { Character } from "../../utils/classes/database-models.ts";

import { TransportModule } from "../../utils/classes/module.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
import { log } from "../../utils/functions/log.ts";
import { sendMessage } from "../../utils/functions/send-message.ts";
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
      log("ERROR", "Can't start WebSocket server!");
      log("ERROR", e.message);

      throw new Error("Can't start WebSocket server!");
    }

    let connectionId = 1;

    this.wsServer.on("connection", (socket) => {
      connectionId++;

      log("DEBUG", `Client ${connectionId} connected!`);
      this.context.gameServer.modules.dataModule.sync();

      this.context.clients.push({
        id: 0,
        connectionId: connectionId,
        websocket: socket,
        user: null,
        auth: false,
        character: null,
      });

      const client = this.context.clients[this.context.clients.length - 1];

      sendMessage(client, TransportCode.CONNECTED);

      socket.on("message", (message) => {
        log("DEBUG", `Message from client ${client.connectionId}: ${message}`);

        if (message.startsWith('"') || message.startsWith("'")) {
          try {
            message = JSON.parse(message);
          } catch (e) {
            log("ERROR", "Can't parse message!");
            log("ERROR", e.message);

            sendMessage(client, TransportCode.ERROR, "Can't parse message!");

            return;
          }
        }

        if (message.startsWith("/")) {
          const command = message.split(" ")[0].slice(1).toUpperCase();
          const args = message.split(" ").slice(1);

          log(
            "DEBUG",
            `Command from client ${this.context.clients.length}: ${command}`
          );
          log(
            "DEBUG",
            `Args from client ${this.context.clients.length}: ${args}`
          );

          if (this.context.gameServer.modules.moduleCommands[command]) {
            this.context.gameServer.modules.moduleCommands[command](
              client,
              ...args
            );
          } else {
            log("ERROR", `Command ${command} not found`);
            sendMessage(client, TransportCode.COMMAND_NOT_FOUND);

            return;
          }
        }
      });

      socket.on("close", async () => {
        log(
          "DEBUG",
          `Client disconnected! ClientID: ${client.id}, ConnectionID: ${client.connectionId}`
        );
        if (client.character) {
          try {
            await client.character.update();
          } catch (e) {
            log("ERROR", e.message);
            log("ERROR", "Error while saving character data!");
          }

          this.context.gameServer.modules.loadedModulesIterable
            .filter((module) => module.onCharacterLogout)
            .forEach((module) => {
              module.onCharacterLogout!(client, client.character!);
            });
        }

        if (client.user) {
          try {
            await client.user.update();
          } catch (e) {
            log("ERROR", e.message);
            log("ERROR", "Error while saving user data!");
          }
        }

        this.context.clients = this.context.clients.filter(
          (x) => x.connectionId !== client.connectionId
        );
      });
    });

    log(
      "INFO",
      `WebSocket server started on port ${this.context.params?.port}!`
    );
  }
}
