import { Context } from "../types/context.d.ts";
import { ILocation, IMap, IRoom } from "../types/map.d.ts";
import { Location, VOID_LOCATION } from "./location.ts";
import { Room } from "./room.ts";

export class Map {
  constructor(
    map: IMap,
    locations: ILocation[],
    rooms: IRoom[],
    private context: Context
  ) {
    this.name = map.name;
    this.description = map.description;
    this._locations = locations;
    this._bootstrap = map.bootstrap;
    this._rooms = rooms;
  }

  public name: string;
  public description: string;
  private _bootstrap: number;
  private _locations: ILocation[];
  private _rooms: IRoom[];

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

  public get rooms(): Room[] {
    return this._rooms.map(
      (x) => new Room(x, this.getLocation(x.locationId), this.context)
    );
  }

  public get locations(): Location[] {
    return this._locations.map((x) => new Location(x, this, this.context));
  }
}
