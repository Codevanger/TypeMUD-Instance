import { CoreModule } from "../../utils/classes/module.ts";
import { log } from "../../utils/functions/log.ts";
import { Context } from "../../utils/types/context.d.ts";
import { Map } from "../../utils/classes/map.ts";
import { IMap, ILocation, IRoom } from "../../utils/types/map.d.ts";
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
    CURRENTROOM: this.getCurrentRoom,
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
    let rooms: IRoom[];

    try {
      map = JSON.parse(await Deno.readTextFile("./map/map.json"));
      locations = JSON.parse(await Deno.readTextFile("./map/locations.json"));
      rooms = JSON.parse(await Deno.readTextFile("./map/rooms.json"));
    } catch (_) {
      log("ERROR", "Map file not found");
      throw new Error(
        "Map file not found. Please create map.json and locations.json in map folder"
      );
    }

    log("INFO", "Map file loaded");

    this.MAP_OBJECT = new Map(map, locations, rooms, this.context);
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
          character,
          location: this.MAP_OBJECT.getLocation(-1),
        },
        initiatorType: "CLIENT",
        initiator: client,
      });
    });
  };

  public onCharacterLogout = (client: Client, character: Character): void => {
    const location = this.MAP_OBJECT.getLocation(
      character.location as number
    ).getRoom(character.room as number);

    if (!location) {
      return;
    }
  };

  public getCurrentRoom(client: Client): void {
    if (!client.auth) {
      sendMessage({
        client,
        code: TransportCode.AUTH_REQUIRED,
        initiator: client,
        initiatorType: "CLIENT",
      });
    }

    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_REQUIRED,
        initiator: client,
        initiatorType: "CLIENT",
      });
    }

    const room = this.MAP_OBJECT.getLocation(
      client.character!.getLocationId()
    ).getRoom(client.character!.getRoomId());

    sendMessage({
      client,
      code: TransportCode.ROOM_INFO,
      data: {
        room,
      },
      initiator: client,
      initiatorType: "CLIENT",
    });
  }

  public getCurrentLocation(client: Client): void {
    if (!client.auth) {
      sendMessage({
        client,
        code: TransportCode.AUTH_REQUIRED,
        initiator: client,
        initiatorType: "CLIENT",
      });
    }

    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_REQUIRED,
        initiator: client,
        initiatorType: "CLIENT",
      });
    }

    const location = this.MAP_OBJECT.getLocation(
      client.character!.getLocationId()
    );

    sendMessage({
      client,
      code: TransportCode.LOCATION_INFO,
      data: {
        location,
      },
      initiator: client,
      initiatorType: "CLIENT",
    });
  }

  public moveCharacter(client: Client, locationId: number): void {}
}
