import { Character } from "../../utils/classes/database-models.ts";
import { GameModule } from "../../utils/classes/module.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
import { sendMessage } from "../../utils/functions/send-message.ts";
import { Client } from "../../utils/types/client.d.ts";
import { Context } from "../../utils/types/context.d.ts";

export class GameFriends extends GameModule {
  public commandsToAdd = {
    FRIENDLIST: this.friends,
    FRIENDADD: this.addFriend,
    FRIENDREMOVE: this.removeFriend,
  };

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Friends")) {
      throw new Error("Can't load Friends module twice!");
    }

    super.canLoad();

    return true;
  }

  public async friends(client: Client): Promise<void> {
    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_NOT_FOUND,
      });
    }

    const friendsIdArray = client.character!.getFriends();
    const friends = await Promise.all(
      friendsIdArray.map(async (id) => {
        const friend = await Character.where({ characterId: id }).first();

        return friend;
      })
    );

    sendMessage({
      client,
      code: TransportCode.FRIEND_LIST,
      data: {
        friends: friends.map((friend) => ({
          character: friend!.name,
          online: this.context.clients.find(
            (x) => x.character?.name === friend!.name
          )
            ? true
            : false,
        })),
      },
    });
  }

  public async addFriend(client: Client, name: string): Promise<void> {
    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_NOT_FOUND,
      });

      return;
    }

    if (client.character.name === name) {
      sendMessage({
        client,
        code: TransportCode.FRIEND_NOT_FOUND,
      });

      return;
    }

    const friend = await Character.where({ name }).first();

    if (!friend) {
      sendMessage({
        client,
        code: TransportCode.FRIEND_NOT_FOUND,
      });

      return;
    }

    if (client.character.getFriends().includes(friend!.characterId as number)) {
      sendMessage({
        client,
        code: TransportCode.FRIEND_ALREADY_ADDED,
      });

      return;
    }

    client.character.friends = JSON.stringify([
      ...client.character.getFriends(),
      friend!.characterId as number,
    ]);

    sendMessage({
      client,
      code: TransportCode.FRIEND_ADDED,
      data: {
        name: friend.name,
        characterId: friend.characterId,
      },
      initiator: client,
      initiatorType: "CLIENT",
    });
  }

  public async removeFriend(client: Client, name: string): Promise<void> {
    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_NOT_FOUND,
      });

      return;
    }

    const friend = await Character.where({ name }).first();

    if (!friend) {
      sendMessage({
        client,
        code: TransportCode.FRIEND_NOT_FOUND,
      });

      return;
    }

    if (
      !client.character.getFriends().includes(friend!.characterId as number)
    ) {
      sendMessage({
        client,
        code: TransportCode.FRIEND_NOT_FOUND,
      });

      return;
    }

    client.character.friends = JSON.stringify(
      client.character.getFriends().filter((x) => x !== friend!.characterId)
    );

    sendMessage({
      client,
      code: TransportCode.FRIEND_REMOVED,
      initiator: client,
      initiatorType: "CLIENT",
    });
  }
}
