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
  public override priority = 0;
  public MAP_OBJECT!: Map;

  public override commandsToAdd = {
    CURRENTLOCATION: this.getCurrentLocation,
    MOVE: this.moveCharacter,
  };

  constructor(protected override context: Context) {
    super(context);

    this.canLoad();
    this.initMap();
  }

  public override canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "GameMap")) {
      throw new Error("Can't load GameMap module twice!");
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
      map = JSON.parse(await Deno.readTextFile("./json/map.json"));
      locations = JSON.parse(await Deno.readTextFile("./json/locations.json"));
      rooms = JSON.parse(await Deno.readTextFile("./json/rooms.json"));
    } catch (_) {
      log("ERROR", "Map file not found");
      throw new Error(
        "Map file not found. Please create map.json and locations.json in map folder"
      );
    }

    log("INFO", "Map file loaded");

    this.MAP_OBJECT = new Map(map, locations, rooms, this.context);
  }

  public override onCharacterLogin = (client: Client, character: Character): void => {
    if (!character["location"] || character["location"] === 0) {
      character["location"] = this.MAP_OBJECT.bootstrap;
    }

    const location = this.MAP_OBJECT.getLocation(character.getLocationId());

    if (!character["room"] || character["room"] === 0) {
      character["room"] = location.bootstrap;
    }

    const room = location.getRoom(character.getRoomId());

    if (!location) {
      return;
    }

    room.clientsInRoom.forEach((x) => {
      if (client.id === x.id) return;

      const voidLocation = this.MAP_OBJECT.getLocation(-1);

      sendMessage({
        client: x,
        code: TransportCode.CHARACTER_ENTERED,
        data: {
          character,
          location: voidLocation,
          room: voidLocation.getRoom(1),
        },
        initiatorType: "CLIENT",
        initiator: client,
      });
    });
  };

  public override onCharacterLogout = (client: Client, character: Character): void => {
    const room = this.MAP_OBJECT.getLocation(
      character["location"] as number
    ).getRoom(character["room"] as number);

    if (!location) {
      return;
    }

    room.clientsInRoom.forEach((x) => {
      if (client.id === x.id) return;

      const voidLocation = this.MAP_OBJECT.getLocation(-1);

      sendMessage({
        client: x,
        code: TransportCode.CHARACTER_LEAVED,
        data: {
          character,
          location: voidLocation,
          room: voidLocation.getRoom(1),
        },
        initiatorType: "CLIENT",
        initiator: client,
      });
    });
  };

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

    const room = location.getRoom(client.character!.getRoomId());

    sendMessage({
      client,
      code: TransportCode.LOCATION_INFO,
      data: {
        location,
        room,
      },
      initiator: client,
      initiatorType: "CLIENT",
    });
  }

  public moveCharacter(client: Client, exitId: number): void {
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

    const character = client.character;

    const oldRoom = this.MAP_OBJECT.getLocation(
      character!.getLocationId()
    ).getRoom(character!.getRoomId());

    const exit = oldRoom.getExit(exitId);

    if (!exit.locationId) {
      exit.locationId = character!.getLocationId();
    }

    const newRoom = this.MAP_OBJECT.getLocation(exit.locationId).getRoom(
      exit.roomId
    );

    if (!newRoom) {
      sendMessage({
        client,
        code: TransportCode.CANT_FIND_LOCATION,
        initiator: client,
        initiatorType: "CLIENT",
      });

      return;
    }

    character!["room"] = exit.roomId;
    character!["location"] = exit.locationId;

    character!.update();

    sendMessage({
      client,
      code: TransportCode.MOVED,
      data: {
        room: newRoom,
        location: newRoom.location,
      },
      initiator: client,
      initiatorType: "CLIENT",
    });

    oldRoom.clientsInRoom.forEach((x) => {
      if (client.id === x.id) return;

      sendMessage({
        client: x,
        code: TransportCode.CHARACTER_LEAVED,
        data: {
          character,
          newRoom: newRoom,
          oldLocation: newRoom.location,
        },
        initiatorType: "CLIENT",
        initiator: client,
      });
    });

    newRoom.clientsInRoom.forEach((x) => {
      if (client.id === x.id) return;

      sendMessage({
        client: x,
        code: TransportCode.CHARACTER_ENTERED,
        data: {
          character,
          oldRoom: oldRoom,
          oldLocation: oldRoom.location,
        },
        initiatorType: "CLIENT",
        initiator: client,
      });
    });
  }
}
