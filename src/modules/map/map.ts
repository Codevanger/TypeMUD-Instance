import { CoreModule } from "../../utils/classes/module.ts";
import { log } from "../../utils/functions/log.ts";
import { Context } from "../../utils/types/context.d.ts";
import { Map } from "../../utils/classes/map.ts";
import { IMap, ILocation } from "../../utils/types/map.d.ts";
import { Client } from "../../utils/types/client.d.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
import { Character } from "../../utils/classes/database-models.ts";
import { sendMessage } from "../../utils/functions/send-message.ts";

/**
 * Map module
 */
export class GameMap extends CoreModule {
  public priority = 0;
  public MAP_OBJECT!: Map;

  public commandsToAdd = {
    CURRENTLOCATION: this.getCurrentLocation,
    MOVE: this.moveCharacter,
  };

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
    this.initMap();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Map")) {
      throw new Error("Can't load Map module twice!");
    }

    super.canLoad();

    return true;
  }

  // Create folder map in root
  // Create file map.ts in map folder
  public async initMap(): Promise<void> {
    let map: IMap;
    let locations: ILocation[];

    try {
      map = JSON.parse(await Deno.readTextFile("./map/map.json"));
      locations = JSON.parse(await Deno.readTextFile("./map/locations.json"));
    } catch (_) {
      log("ERROR", "Map file not found");
      log("INFO", "Creating map file");

      map = await this.createMap();
      locations = [];
    }

    log("INFO", "Map file loaded");

    this.MAP_OBJECT = new Map(map, locations, this.context);
  }

  public async createMap(): Promise<IMap> {
    const map: IMap = {
      name: "Тестовая карта",
      description: "Тестовая карта",
      bootstrap: -1,
    };

    await Deno.mkdir("./map");
    await Deno.writeTextFile("./map/map.json", JSON.stringify(map));
    await Deno.writeTextFile("./map/locations.json", JSON.stringify([]));

    return map;
  }

  public onCharacterLogin = (client: Client, character: Character): void => {
    if (!character.location || character.location === 0) {
      character.location = this.MAP_OBJECT.bootstrap;
    }

    const location = this.MAP_OBJECT.getLocation(character.location as number);

    if (!location) {
      return;
    }

    location.clientsInLocation.forEach((x) => {
      if (client.id === x.id) return;

      sendMessage(
        x,
        TransportCode.CHANGED,
        "Other character come here",
        client,
        "CLIENT"
      );
    });
  };

  public onCharacterLogout = (client: Client, character: Character): void => {
    const location = this.MAP_OBJECT.getLocation(character.location as number);

    if (!location) {
      return;
    }

    location.clientsInLocation.forEach((x) => {
      if (client.id === x.id) return;

      sendMessage(
        client,
        TransportCode.CHANGED,
        "Other character left from here",
        client,
        "CLIENT"
      );
    });
  };

  public getCurrentLocation(client: Client): void {
    if (!client.auth) {
      sendMessage(client, TransportCode.AUTH_REQUIRED, "Not authenticated");
    }

    if (!client.character) {
      sendMessage(client, TransportCode.CHARACTER_REQUIRED, "No character");
    }

    if (!client.character!.location) {
      client.character!.location = this.MAP_OBJECT.bootstrap;
    }

    sendMessage(
      client,
      TransportCode.MAP_INFO,
      "Map info",
      this.MAP_OBJECT.getLocation(
        client.character!.location as number
      ).websocketFriendly(true)
    );
  }

  public moveCharacter(client: Client, locationId: number): void {
    if (!client.auth) {
      sendMessage(client, TransportCode.AUTH_REQUIRED, "Not authenticated");
      return;
    }

    if (!client.character) {
      sendMessage(client, TransportCode.CHARACTER_REQUIRED, "No character");
      return;
    }

    const currentLocation = this.MAP_OBJECT.getLocation(
      client.character.location as number
    );

    if (locationId === currentLocation.id) {
      sendMessage(client, TransportCode.ERROR, "You are already here");
      return;
    }

    if (!currentLocation.canMoveTo(locationId)) {
      sendMessage(client, TransportCode.ERROR, "Can't move to this location");
      return;
    }

    const location = this.MAP_OBJECT.getLocation(locationId);

    if (!location) {
      sendMessage(client, TransportCode.ERROR, "Location not found");
      return;
    }

    location.clientsInLocation.forEach((x) => {
      if (x.character!.id === client.character!.id) return;

      sendMessage(x, TransportCode.CHANGED, "Other character come here", {
        character: client.character,
      });
    });

    currentLocation.clientsInLocation.forEach((x) => {
      if (x.character!.id === client.character!.id) return;

      sendMessage(x, TransportCode.CHANGED, "Other character leave from here", {
        character: client.character,
      });
    });

    client.character.location = locationId;
    client.character.update();

    const locationToSend = location.websocketFriendly(true);
    sendMessage(
      client,
      TransportCode.CHANGED,
      "You moved to the new location",
      locationToSend
    );
  }
}
