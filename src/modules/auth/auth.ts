import { CoreModule } from "../../utils/classes/module.ts";
import { Client } from "../../utils/types/client.d.ts";
import { Context } from "../../utils/types/context.d.ts";
import { verify } from "https://deno.land/x/djwt/mod.ts"
import { JWT_SECRET } from "../../utils/consts/secrets.ts";
import { log } from "../../utils/functions/log.ts";

/**
 * Module for authentication
 */
export class GameAuth extends CoreModule {
  public priority = -1;

  public commandsToAdd = [

  ];

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Auth")) {
      throw new Error("Can't load Auth module twice!");
    }

    super.canLoad();

    return true;
  }

  public onClientMessage = (_: string, client: Client) => {
    if (client.auth) {
      return;
    }

    const token = _.split(" ")[1];

    let auth = false;

    if (!token) {
      return;
    }

    try {
      auth = verify(token, JWT_SECRET, "HS512");
    } catch (e) {
      log("ERROR", `User ${client.id} tried to connect with invalid token!`);
      log("ERROR", e.message);
    }

    if (auth) {
      client.token = token;
      client.character = this.context.gameServer.modules.dataModule;
    }
  };
}
