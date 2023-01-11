import { CoreModule } from "../../utils/classes/module.ts";
import { Client } from "../../utils/types/client.d.ts";
import { Context } from "../../utils/types/context.d.ts";
import { decode, verify } from "https://deno.land/x/djwt@v2.2/mod.ts";
import { log } from "../../utils/functions/log.ts";
import { JWT_SECRET } from "../../utils/consts/secrets.ts";
import { ITokenPayload } from "../../utils/types/token.d.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
import { User } from "../../utils/classes/database-models.ts";
import { sendMessage } from "../../utils/functions/send-message.ts";

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
      sendMessage({
        client: client,
        code: TransportCode.ALREADY_AUTHENTICATED,
      });

      return;
    }

    let auth = false;

    try {
      auth = !!(await verify(token, JWT_SECRET, "HS256"));
    } catch (e) {
      log("DEBUG", `Failed to verify token!`);
      log("DEBUG", e);
    }

    if (auth) {
      const [, payload] = decode(token) as [unknown, ITokenPayload, unknown];

      const user = await User.where("userId", payload.userId).first();

      if (!user || user.username !== payload.username) {
        sendMessage({
          client: client,
          code: TransportCode.INVALID_TOKEN,
        });

        client.websocket.close(1000, "Auth failed");

        return;
      }

      const interfaringClient = this.context.clients.find(
        (x) => x.userId === payload.userId
      );
      if (interfaringClient) {
        sendMessage({
          client: interfaringClient,
          code: TransportCode.INTERFERED,
          initiator: client,
          initiatorType: "CLIENT",
        });

        interfaringClient.websocket.close(1000, "Connection interfered");
      }

      client.auth = true;
      client.id = payload.userId;
      client.user = user;

      sendMessage({
        client: client,
        code: TransportCode.AUTHENTICATED,
        data: {
          userId: client.id,
          user: client.user,
        },
      });
    }
  }
}
