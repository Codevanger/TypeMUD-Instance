import { Character } from "../../utils/classes/database-models.ts";
import { GameModule } from "../../utils/classes/module.ts";
import { Client } from "../../utils/types/client.d.ts";

/**
 * Character management module
 */
export class CharacterModule extends GameModule {
    public priority = 100;

    commandsToAdd = {
        LOGIN: this.login
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
