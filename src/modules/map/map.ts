import { CoreModule } from "../../utils/classes/module.ts";
import { log } from "../../utils/functions/log.ts";
import { Context } from "../../utils/types/context.d.ts";
import { Map } from "../../utils/classes/map.ts";
import { IMap, ILocation } from "../../utils/types/map.d.ts";
import { Client } from "../../utils/types/client.d.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
import { Character } from "../../utils/classes/database-models.ts";

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

  public onCharacterLogin = (_: Client, character: Character): void => {
    if (!character.location || character.location === 0) {
      character.location = this.MAP_OBJECT.bootstrap;
    }
  };

  public getCurrentLocation(client: Client): void {
    if (!client.auth) {
      client.websocket.send(TransportCode.NOT_AUTHENTICATED.toString());
      client.websocket.send(JSON.stringify(this.MAP_OBJECT.getLocation(-1)));
    }

    if (!client.character) {
      client.websocket.send(TransportCode.NO_CHARACTER.toString());
      client.websocket.send(JSON.stringify(this.MAP_OBJECT.getLocation(-1)));
    }

    if (!client.character!.location) {
      client.character!.location = this.MAP_OBJECT.bootstrap;
    }

    client.websocket.send(
      JSON.stringify(
        this.MAP_OBJECT.getLocation(
          client.character!.location as number
        ).websocketFriendly()
      )
    );
  }

  public moveCharacter(client: Client, locationId: number): void {
    if (!client.auth) {
      client.websocket.send(TransportCode.NOT_AUTHENTICATED.toString());
      return;
    }

    if (!client.character) {
      client.websocket.send(TransportCode.NO_CHARACTER.toString());
      return;
    }

    const currentLocation = this.MAP_OBJECT.getLocation(
      client.character.location as number
    );

    if (locationId === currentLocation.id) {
      client.websocket.send(TransportCode.ALREADY_HERE.toString());
      return;
    }

    if (!currentLocation.canMoveTo(locationId)) {
      client.websocket.send(TransportCode.CANT_MOVE_TO.toString());
      return;
    }

    const location = this.MAP_OBJECT.getLocation(locationId);

    if (!location) {
      client.websocket.send(TransportCode.LOCATION_NOT_FOUND.toString());
      return;
    }

    client.character.location = locationId;
    client.character.update();

    client.websocket.send(TransportCode.MOVED.toString());
  }
}
