import { CoreModule } from "../../utils/classes/module.ts";
import { Client } from "../../utils/types/client.d.ts";
import { Context } from "../../utils/types/context.d.ts";
import { decode, verify } from "https://deno.land/x/djwt@v2.2/mod.ts"
import { log } from "../../utils/functions/log.ts";
import { JWT_SECRET } from "../../utils/consts/secrets.ts";
import { ITokenPayload } from "../../utils/types/token.d.ts";

/**
 * Module for authentication
 */
export class AuthModule extends CoreModule {
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

  public async auth(client: Client, token: string): Promise<void> {
    if (client.auth) {
      client.websocket.send("AUTH: ALREADY_AUTHENTICATED");

      return;
    }

    let auth = false;
    log("DEBUG", `Authenticating client ${client.id}...`);
    log("DEBUG", `Token: ${token}`);

    try {
      auth = !!await verify(token, JWT_SECRET, "HS256");
    } catch (e) {
      log("ERROR", `Failed to verify token!`);
      log("ERROR", e);
    }

    if (auth) {
      const [, payload] = decode(token) as [unknown, ITokenPayload, unknown];

      const interfaringClient = this.context.clients.find((x) => x.id === payload.id);
      if (interfaringClient) {
        interfaringClient.websocket.send("AUTH: SOMEONE_ELSE_LOGGED_IN");
        interfaringClient.websocket.close(1000, "AUTH: SOMEONE_ELSE_LOGGED_IN");
      }

      client.auth = true;
      client.id = payload.id;
      client.websocket.send("AUTH: OK");
      client.websocket.send(`CLIENT_ID: ${client.id}!`);
    }
  }
}
