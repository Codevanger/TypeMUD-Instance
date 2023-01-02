import { GameModule } from "../../utils/classes/module.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
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
      client.websocket.send(TransportCode.NOT_AUTHENTICATED.toString());
      return;
    }

    if (message.length <= 0) {
      client.websocket.send(TransportCode.EMPTY_MESSAGE.toString());
      return;
    }

    if (!client.character) {
      client.websocket.send(TransportCode.NO_CHARACTER.toString());
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
        x.websocket.send(TransportCode.MESSAGE_RECEIVED.toString());
        x.websocket.send(readyMessage);
      });
    });

    client.websocket.send(TransportCode.MESSAGE_SENT.toString());
  }

  public say(client: Client, ...messageChunks: string[]): void {
    const message = messageChunks.join(" ");

    if (!client.auth) {
      client.websocket.send(TransportCode.NOT_AUTHENTICATED.toString());
      return;
    }

    if (message.length <= 0) {
      client.websocket.send(TransportCode.EMPTY_MESSAGE.toString());
      return;
    }

    if (!client.character) {
      client.websocket.send(TransportCode.NO_CHARACTER.toString());
      return;
    }

    const readyMessage = `${client.character.name} говорит: ${message}`;

    const mapModule = this.loadedModules["GameMap"] as GameMap;
    mapModule.MAP_OBJECT.getLocation(
      client.character!.location as number
    ).clientsInLocation.forEach((x) => {
      x.websocket.send(TransportCode.MESSAGE_RECEIVED.toString());
      x.websocket.send(readyMessage);
    });

    client.websocket.send(TransportCode.MESSAGE_SENT.toString());
  }

  public whisper(client: Client, characterName: string, ...messageChunks: string[]): void {
    const message = messageChunks.join(" ");

    if (!client.auth) {
      client.websocket.send(TransportCode.NOT_AUTHENTICATED.toString());
      return;
    }

    if (message.length <= 0) {
      client.websocket.send(TransportCode.EMPTY_MESSAGE.toString());
      return;
    }

    if (!client.character) {
      client.websocket.send(TransportCode.NO_CHARACTER.toString());
      return;
    }

    if (characterName === client.character.name || characterName.length <= 1) {
      client.websocket.send(TransportCode.INCORRECT_MESSAGE.toString());
      return;
    }

    const readyMessage = `${client.character.name} шепчет вам: ${message}`;
    const readyMessageForSender = `Вы шепчете ${characterName}: ${message}`;

    const character = this.context.clients.find((x) => x.character?.name === characterName);

    if (!character) {
        client.websocket.send(TransportCode.INCORRECT_MESSAGE.toString());
        return;
    }

    character.websocket.send(TransportCode.MESSAGE_RECEIVED.toString());
    character.websocket.send(readyMessage);

    client.websocket.send(TransportCode.MESSAGE_SENT.toString());
    client.websocket.send(readyMessageForSender);
  }
}
