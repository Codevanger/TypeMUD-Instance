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

  public commandsToAdd = {
    AUTH: this.auth,
  };

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

  public async auth(client: Client, token: string) {
    let auth = false;
    console.log('here');

    try {
      auth = await !!verify(token, null);
    } catch (e) {
      log("ERROR", `Failed to verify token!`);
      log("ERROR", e);
    }
  }
}
