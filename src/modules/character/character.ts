import { Character } from "../../utils/classes/database-models.ts";
import { GameModule } from "../../utils/classes/module.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
import { Client } from "../../utils/types/client.d.ts";
import { Context } from "../../utils/types/context.d.ts";

/**
 * Character management module
 */
export class CharacterModule extends GameModule {
  public priority = 100;

  commandsToAdd = {
    LOGIN: this.login,
  };

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Map")) {
      throw new Error("Can't load Character module twice!");
    }

    super.canLoad();

    return true;
  }

  public async login(client: Client, characterId: number): Promise<void> {
    if (client.character) {
      client.websocket.send(TransportCode.ALREADY_LOGGED_IN.toString());
      return;
    }

    if (!client.auth) {
      client.websocket.send(TransportCode.AUTH_REQUIRED.toString());
      return;
    }

    if (characterId < 0) {
      client.websocket.send(TransportCode.INVALID_ID.toString());
      return;
    }

    const character = await Character.where("id", characterId).first();

    if (!character) {
      client.websocket.send(TransportCode.NOT_FOUND.toString());
      return;
    }

    if (character.userId !== client.id) {
      client.websocket.send(TransportCode.INVALID_USER.toString());
      return;
    }

    this.context.gameServer.modules.loadedModulesIterable
      .filter((module) => module.onCharacterLogin)
      .forEach((module) => {
        module.onCharacterLogin!(client, character);
      });

    client.character = character;
    client.websocket.send(TransportCode.CHARACTER_OK.toString());
  }
}
