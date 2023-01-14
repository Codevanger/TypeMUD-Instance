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
    if (!client.auth) {
      sendMessage({
        client,
        code: TransportCode.AUTH_REQUIRED,
      });

      return;
    }

    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_REQUIRED,
      });

      return;
    }

    const friends = await Character.friends();

    sendMessage({
      client,
      code: TransportCode.FRIEND_LIST,
      data: {
        friends: friends.map((x) => {
          return {
            character: x,
            online: this.context.clients.find((y) => y.character?.id === x.id)
              ? true
              : false,
          };
        }),
      },
      initiator: client,
      initiatorType: "CLIENT",
    });
  }

  public async addFriend(client: Client, name: string): Promise<void> {
    if (!client.auth) {
      sendMessage({
        client,
        code: TransportCode.AUTH_REQUIRED,
      });

      return;
    }

    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_REQUIRED,
      });

      return;
    }

    const friend = await Character.where("name", name).first();

    if (!friend) {
      sendMessage({
        client,
        code: TransportCode.FRIEND_NOT_FOUND,
      });

      return;
    }

    console.log({
      friend,
      friends: client.character.friends,
      user: client.user,
    });
  }

  public async removeFriend(client: Client, name: string): Promise<void> {}
}
