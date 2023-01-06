import { Character } from "../../utils/classes/database-models.ts";
import { GameModule } from "../../utils/classes/module.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
import { sendMessage } from "../../utils/functions/send-message.ts";
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
      sendMessage(client, TransportCode.ERROR, "You are already logged in!", null)
      return;
    }

    if (!client.auth) {
      sendMessage(client, TransportCode.AUTH_REQUIRED, "You are not authenticated!", null)
      return;
    }

    if (characterId < 0) {
      sendMessage(client, TransportCode.ERROR, "Invalid character ID!", null)
      return;
    }

    const character = await Character.where("id", characterId).first();

    if (!character) {
      sendMessage(client, TransportCode.ERROR, "Character not found!", null)
      return;
    }

    if (character.userId !== client.id) {
      sendMessage(client, TransportCode.ERROR, "Invalid user!", null)
      return;
    }

    this.context.gameServer.modules.loadedModulesIterable
      .filter((module) => module.onCharacterLogin)
      .forEach((module) => {
        module.onCharacterLogin!(client, character);
      });

    client.character = character;
    sendMessage(client, TransportCode.SELECTED_CHARACTER, "Characted selected!", null)
  }
}
