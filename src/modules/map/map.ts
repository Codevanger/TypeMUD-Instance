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

      sendMessage({
        client: x,
        code: TransportCode.CHARACTER_ENTERED,
        data: {
          character: client.character,
          location: this.MAP_OBJECT.getLocation(-1),
        },
        initiatorType: "CLIENT",
        initiator: client,
      });
    });
  };

  public onCharacterLogout = (client: Client, character: Character): void => {
    const location = this.MAP_OBJECT.getLocation(character.location as number);

    if (!location) {
      return;
    }

    location.clientsInLocation.forEach((x) => {
      if (client.id === x.id) return;

      sendMessage({
        client: x,
        code: TransportCode.CHARACTER_LEAVED,
        data: {
          character: client.character,
          location: this.MAP_OBJECT.getLocation(-1)
        },
        initiatorType: "CLIENT",
        initiator: client,
      });
    });
  };

  public getCurrentLocation(client: Client): void {
    if (!client.auth) {
      sendMessage({
        client: client,
        code: TransportCode.AUTH_REQUIRED,
      });
    }

    if (!client.character) {
      sendMessage({
        client: client,
        code: TransportCode.CHARACTER_REQUIRED,
      });
    }

    if (!client.character!.location) {
      client.character!.location = this.MAP_OBJECT.bootstrap;
    }

    sendMessage({
      client: client,
      code: TransportCode.MAP_INFO,
      data: {
        location: this.MAP_OBJECT.getLocation(
          client.character!.location as number
        ).websocketFriendly(true),
      },
    });
  }

  public moveCharacter(client: Client, locationId: number): void {
    if (!client.auth) {
      sendMessage({
        client: client,
        code: TransportCode.AUTH_REQUIRED,
      });

      return;
    }

    if (!client.character) {
      sendMessage({
        client: client,
        code: TransportCode.CHARACTER_REQUIRED,
      });
      return;
    }

    const currentLocation = this.MAP_OBJECT.getLocation(
      client.character.location as number
    );

    if (locationId === currentLocation.id) {
      sendMessage({
        client: client,
        code: TransportCode.ALREADY_HERE,
      });

      return;
    }

    if (!currentLocation.canMoveTo(locationId)) {
      sendMessage({
        client: client,
        code: TransportCode.CANT_MOVE_TO_DESTINATION,
      });

      return;
    }

    const location = this.MAP_OBJECT.getLocation(locationId);

    if (!location) {
      sendMessage({
        client: client,
        code: TransportCode.CANT_FIND_LOCATION,
      });

      return;
    }

    client.character.location = locationId;
    client.character.update();

    location.clientsInLocation.forEach((x) => {
      if (x.character!.id === client.character!.id) return;

      sendMessage({
        client: x,
        code: TransportCode.CHARACTER_ENTERED,
        data: {
          character: client.character,
          location: currentLocation,
        },
        initiatorType: "CLIENT",
        initiator: client,
      });
    });

    currentLocation.clientsInLocation.forEach((x) => {
      if (x.character!.id === client.character!.id) return;

      sendMessage({
        client: x,
        code: TransportCode.CHARACTER_LEAVED,
        data: {
          character: client.character,
          newLocation: location,
        },
        initiatorType: "CLIENT",
        initiator: client,
      });
    });

    const locationToSend = location.websocketFriendly(true);
    sendMessage({
      client: client,
      code: TransportCode.MOVED,
      data: {
        location: locationToSend,
      },
      initiatorType: "CLIENT",
      initiator: client,
    });
  }
}
