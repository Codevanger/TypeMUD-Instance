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
    SELECT: this.select,
    MYCHARACTER: this.myCharacter,
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

  public async select(client: Client, characterId: number): Promise<void> {
    if (client.character) {
      sendMessage({
        client,
        code: TransportCode.ALREADY_LOGGED_IN,
      });

      return;
    }

    if (!client.auth) {
      sendMessage({
        client,
        code: TransportCode.AUTH_REQUIRED,
      })

      return;
    }

    if (characterId < 0) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_NOT_FOUND,
      })

      return;
    }

    const character = await Character.where("id", characterId).first();

    if (!character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_NOT_FOUND,
      });

      return;
    }

    if (character.userId !== client.id) {
      sendMessage({
        client,
        code: TransportCode.INVALID_USER,
      });

      return;
    }

    this.context.gameServer.modules.loadedModulesIterable
      .filter((module) => module.onCharacterLogin)
      .forEach((module) => {
        module.onCharacterLogin!(client, character);
      });

    client.character = character;

    sendMessage({
      client,
      code: TransportCode.SELECTED_CHARACTER,
      data: {
        character,
      },
    });
  }

  public myCharacter(client: Client): void {
    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_REQUIRED,
      });

      return;
    }

    sendMessage({
      client,
      code: TransportCode.CHARACTER_INFO,
      data: {
        character: client.character,
      },
      initiator: client,
      initiatorType: "CLIENT",
    });
  }
}
