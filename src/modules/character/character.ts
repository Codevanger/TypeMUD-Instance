import { Character } from "../../utils/classes/database-models.ts";
import { GameModule } from "../../utils/classes/module.ts";
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
      client.websocket.send("CHARACTER: ALREADY_LOGGED_IN");
      return;
    }

    if (!client.auth) {
      client.websocket.send("AUTH: REQUIRED");
      return;
    }

    if (characterId < 0) {
      client.websocket.send("CHARACTER: INVALID_ID");
      return;
    }

    const character = await Character.where("id", characterId).first();

    if (!character) {
      client.websocket.send("CHARACTER: NOT_FOUND");
      return;
    }

    if (character.userId !== client.id) {
      client.websocket.send("CHARACTER: INVALID_USER");
      return;
    }

    client.character = character;
    client.websocket.send("CHARACTER: OK");
  }
}
