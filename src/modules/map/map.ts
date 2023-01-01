import { CoreModule } from "../../utils/classes/module.ts";
import { log } from "../../utils/functions/log.ts";
import { Context } from "../../utils/types/context.d.ts";
import { Map, Location } from "../../utils/types/map.d.ts";

/**
 * Map module
 */
export class GameMap extends CoreModule {
  public priority = 0;
  private _map!: Map;

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
    let map: Map;

    try {
        map = JSON.parse(await Deno.readTextFile('./map/map.json'));
    } catch (_) {
        log("ERROR", "Map file not found");
        log("INFO", "Creating map file");

        map = await this.createMap();
    }

    log("INFO", "Map file loaded");
    this._map = map;
  }

  public async createMap(): Promise<Map> {
    const map: Map = {
        name: "Default map",
        description: "Default map description",
        bootstrap: {
            id: 0,
            name: "Void",
            description: "It's the void",
            exits: []
        }
    };

    await Deno.mkdir('./map');
    await Deno.writeTextFile('./map/map.json', JSON.stringify(map));
    return map;
  }
}
