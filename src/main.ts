import { GameServer } from "./utils/classes/game-server.ts";
import { ServerParameters } from "./utils/classes/server-parameters.ts";
import clear from "./utils/functions/clear.ts";
import { log } from "./utils/functions/log.ts";
import { parseArgs } from "./utils/functions/parse-args.ts";
import { checkPerfomance } from "./utils/functions/perfomance.ts";
import { Arguments } from "./utils/types/arguments.d.ts";
import { Context } from "./utils/types/context.d.ts";
import { Client } from "./utils/types/client.d.ts";

class TypeMUD {
  private server = new GameServer();
  private params!: ServerParameters;
  private args!: Arguments;
  private clients = new Array<Client>();

  public get context(): Context {
    return {
      args: this.args,
      params: this.params,
      clients: this.clients,
      gameServer: this.server,
      version: "0.0.1",
    };
  }

  constructor(args: string[]) {
    this.main(parseArgs(args));
  }

  private async main(args: Arguments): Promise<void> {
    await clear(true);

    log("INFO", "Starting server...");
    log("EMPTY");

    this.params = new ServerParameters(args);

    this.args = args;

    this.handleServer();

    checkPerfomance({
      message: "Server inited in [[time]]",
      overtimeMessage: "Overtime when loading server!",
      overtime: 1000,
    });

    log("EMPTY");
  }

  private handleServer(): void {
    this.server.initGameServer(this.context);
  }
}

const _server = new TypeMUD(Deno.args);
