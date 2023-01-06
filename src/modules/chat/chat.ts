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
  };

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
      sendMessage(
        client,
        TransportCode.AUTH_REQUIRED,
        "You are not authenticated!"
      );
      return;
    }

    if (message.length <= 0) {
      sendMessage(client, TransportCode.ERROR, "Empty message!");
      return;
    }

    if (!client.character) {
      sendMessage(
        client,
        TransportCode.CHARACTER_REQUIRED,
        "You need to select character!"
      );
      return;
    }

    const readyMessage = `${client.character.name} кричит: ${message}`;

    const mapModule = this.loadedModules["GameMap"] as GameMap;

    const playerLocation = mapModule.MAP_OBJECT.getLocation(
      client.character!.location as number
    );
    const locations = [...playerLocation.exits];
    locations.push(playerLocation);
    locations.forEach((location) => {
      location.clientsInLocation.forEach((x) => {
        if (x.id === client.id) return;

        sendMessage(
          x,
          TransportCode.MESSAGE_RECEIVED,
          readyMessage,
          { message: readyMessage },
          "CLIENT",
          client
        );
      });
    });

    sendMessage(
      client,
      TransportCode.MESSAGE_SENT,
      readyMessage,
      {
        readyMessage,
      },
      "CLIENT",
      client
    );
  }

  public say(client: Client, ...messageChunks: string[]): void {
    const message = messageChunks.join(" ");

    if (!client.auth) {
      sendMessage(
        client,
        TransportCode.AUTH_REQUIRED,
        "You are not authenticated!"
      );
      return;
    }

    if (message.length <= 0) {
      sendMessage(client, TransportCode.ERROR, "Empty message!");
      return;
    }

    if (!client.character) {
      sendMessage(
        client,
        TransportCode.CHARACTER_REQUIRED,
        "You need to select character!"
      );
      return;
    }

    const readyMessage = `${client.character.name} говорит: ${message}`;

    const mapModule = this.loadedModules["GameMap"] as GameMap;

    mapModule.MAP_OBJECT.getLocation(
      client.character!.location as number
    ).clientsInLocation.forEach((x) => {
      if (x.id === client.id) return;

      sendMessage(
        x,
        TransportCode.MESSAGE_RECEIVED,
        readyMessage,
        { message: readyMessage },
        "CLIENT",
        client
      );
    });

    sendMessage(
      client,
      TransportCode.MESSAGE_SENT,
      readyMessage,
      {
        message: readyMessage,
      },
      "CLIENT",
      client
    );
  }

  public whisper(
    client: Client,
    characterName: string,
    ...messageChunks: string[]
  ): void {
    const message = messageChunks.join(" ");

    if (!client.auth) {
      sendMessage(
        client,
        TransportCode.AUTH_REQUIRED,
        "You are not authenticated!"
      );
      return;
    }

    if (message.length <= 0) {
      sendMessage(client, TransportCode.ERROR, "Empty message!");
      return;
    }

    if (!client.character) {
      sendMessage(
        client,
        TransportCode.CHARACTER_REQUIRED,
        "You need to select character!"
      );
      return;
    }

    if (characterName === client.character.name || characterName.length <= 1) {
      sendMessage(client, TransportCode.NOT_FOUND, "No such character!");
      return;
    }

    const readyMessage = `${client.character.name} шепчет вам: ${message}`;
    const readyMessageForSender = `Вы шепчете ${characterName}: ${message}`;

    const character = this.context.clients.find(
      (x) => x.character?.name === characterName
    );

    if (!character) {
      sendMessage(client, TransportCode.NOT_FOUND, "No such character!");
      return;
    }

    sendMessage(character, TransportCode.MESSAGE_RECEIVED, readyMessage, {
      message: readyMessage,
    });

    sendMessage(client, TransportCode.MESSAGE_SENT, readyMessageForSender, {
      message: readyMessageForSender,
    });
  }
}
