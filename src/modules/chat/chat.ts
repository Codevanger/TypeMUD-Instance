import { GameModule } from "../../utils/classes/module.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
import { sendMessage } from "../../utils/functions/send-message.ts";
import { Client } from "../../utils/types/client.d.ts";
import { Context } from "../../utils/types/context.d.ts";
import { GameMap } from "../map/map.ts";

export class GameChat extends GameModule {
  public priority = 0;
  public commandsToAdd = {
    SAY: this.say,
    SHOUT: this.shout,
    WHISPER: this.whisper,
    ME: this.me
  };

  public dependencies = [GameMap];

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Chat")) {
      throw new Error("Can't load Chat module twice!");
    }

    super.canLoad();

    return true;
  }

  public shout(client: Client, ...messageChunks: string[]): void {
    const message = messageChunks.join(" ");

    if (!client.auth) {
      sendMessage({
        client,
        code: TransportCode.AUTH_REQUIRED,
      });

      return;
    }

    if (message.length <= 0) {
      sendMessage({
        client,
        code: TransportCode.INCORRECT_MESSAGE,
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

    const readyMessage = `[${client.character.name}] кричит: ${message}`;

    const mapModule = this.loadedModules["GameMap"] as GameMap;

    const playerLocation = mapModule.MAP_OBJECT.getLocation(
      client.character!.location as number
    );
    const locations = [...playerLocation.exits];
    locations.push(playerLocation);
    locations.forEach((location) => {
      location.clientsInLocation.forEach((x) => {
        if (x.id === client.id) return;

        sendMessage({
          client: x,
          code: TransportCode.MESSAGE_RECEIVED,
          data: {
            message: readyMessage,
            character: client.character,
            type: "shout",
          },
          initiator: client,
          initiatorType: "CLIENT",
        });
      });
    });

    sendMessage({
      client,
      code: TransportCode.MESSAGE_SENT,
      data: {
        message: readyMessage,
        character: client.character,
        type: "shout",
      },
      initiator: client,
      initiatorType: "CLIENT",
    });
  }

  public say(client: Client, ...messageChunks: string[]): void {
    const message = messageChunks.join(" ");

    if (!client.auth) {
      sendMessage({
        client,
        code: TransportCode.AUTH_REQUIRED,
      });

      return;
    }

    if (message.length <= 0) {
      sendMessage({ client, code: TransportCode.INCORRECT_MESSAGE });
      return;
    }

    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_REQUIRED,
      });

      return;
    }

    const readyMessage = `${client.character.name} говорит: ${message}`;

    const mapModule = this.loadedModules["GameMap"] as GameMap;

    mapModule.MAP_OBJECT.getLocation(
      client.character!.location as number
    ).clientsInLocation.forEach((x) => {
      if (x.id === client.id) return;

      sendMessage({
        client: x,
        code: TransportCode.MESSAGE_RECEIVED,
        data: {
          message: readyMessage,
          character: client.character,
          type: "say",
        },
        initiator: client,
        initiatorType: "CLIENT",
      });
    });

    sendMessage({
      client,
      code: TransportCode.MESSAGE_SENT,
      data: {
        message: readyMessage,
        character: client.character,
        type: "say",
      },
      initiator: client,
      initiatorType: "CLIENT",
    });
  }

  public whisper(
    client: Client,
    characterName: string,
    ...messageChunks: string[]
  ): void {
    const message = messageChunks.join(" ");

    if (!client.auth) {
      sendMessage({
        client,
        code: TransportCode.AUTH_REQUIRED,
      });

      return;
    }

    if (message.length <= 0) {
      sendMessage({ client, code: TransportCode.INCORRECT_MESSAGE });
      return;
    }

    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_REQUIRED,
      });

      return;
    }

    if (characterName === client.character.name || characterName.length <= 1) {
      sendMessage({ client, code: TransportCode.WRONG_RECIEVER });
      return;
    }

    const readyMessage = `${client.character.name} шепчет вам: ${message}`;
    const readyMessageForSender = `Вы шепчете ${characterName}: ${message}`;

    const reciever = this.context.clients.find(
      (x) => x.character?.name === characterName
    );

    if (!reciever) {
      sendMessage({ client, code: TransportCode.WRONG_RECIEVER });
      return;
    }

    sendMessage({
      client: reciever,
      code: TransportCode.MESSAGE_RECEIVED,
      data: {
        message: readyMessage,
      },
      initiator: client,
      initiatorType: "CLIENT",
    });

    sendMessage({
      client,
      code: TransportCode.MESSAGE_SENT,
      data: {
        message: readyMessageForSender,
      },
      initiator: client,
      initiatorType: "CLIENT",
    });
  }

  public me(client: Client, ...messageChunks: string[]): void {
    const message = messageChunks.join(" ");

    if (!client.auth) {
      sendMessage({
        client,
        code: TransportCode.AUTH_REQUIRED,
      });

      return;
    }

    if (message.length <= 0) {
      sendMessage({ client, code: TransportCode.INCORRECT_MESSAGE });
      return;
    }

    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_REQUIRED,
      });

      return;
    }

    const readyMessage = `${client.character.name} ${message}`;

    const mapModule = this.loadedModules["GameMap"] as GameMap;

    mapModule.MAP_OBJECT.getLocation(
      client.character!.location as number
    ).clientsInLocation.forEach((x) => {
      if (x.id === client.id) return;

      sendMessage({
        client: x,
        code: TransportCode.MESSAGE_RECEIVED,
        data: {
          message: readyMessage,
          character: client.character,
          type: "me",
        },
        initiator: client,
        initiatorType: "CLIENT",
      });
    });

    sendMessage({
      client,
      code: TransportCode.MESSAGE_SENT,
      data: {
        message: readyMessage,
        character: client.character,
        type: "me",
      },
      initiator: client,
      initiatorType: "CLIENT",
    });
  }
}
