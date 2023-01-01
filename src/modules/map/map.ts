import { CoreModule } from "../../utils/classes/module.ts";
import { log } from "../../utils/functions/log.ts";
import { Context } from "../../utils/types/context.d.ts";
import { Map } from "../../utils/classes/map.ts";
import { IMap, ILocation } from "../../utils/types/map.d.ts";

/**
 * Map module
 */
export class GameMap extends CoreModule {
  public priority = 0;
  public MAP_OBJECT!: Map;

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

    console.log({ map: this.MAP_OBJECT, locations });
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
}
