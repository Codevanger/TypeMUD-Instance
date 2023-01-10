import { Context } from "../types/context.d.ts";
import { ILocation, IMap } from "../types/map.d.ts";
import { Location, VOID_LOCATION } from "./location.ts";

export class Map {
  constructor(map: IMap, locations: ILocation[], private context: Context) {
    this.name = map.name;
    this.description = map.description;
    this._locations = locations;
    this._bootstrap = map.bootstrap;
  }

  public name: string;
  public description: string;
  private _bootstrap: number;
  private _locations: ILocation[];

  public get bootstrap(): number {
    return this._bootstrap;
  }

  public getLocation(locationId: number): Location {
    const location = this._locations.find((x) => +x.id === +locationId);

    return new Location(
      location ? location : VOID_LOCATION,
      this,
      this.context
    );
  }
}
