import { Context } from "../types/context.d.ts";
import { ILocation, IMap } from "../types/map.d.ts";
import { Character } from "./database-models.ts";

export const VOID_LOCATION: ILocation = {
  id: -1,
  name: "Бездна",
  description: "Это бездна. Здесь нет ничего. Нет никаких выходов.",
  exits: [],
};
export class Location {
  public readonly id: number;
  public readonly name: string;
  public readonly description: string;
  private readonly _exits: Array<number>;

  constructor(location: ILocation, private map: Map, private context: Context) {
    this.id = location.id;
    this.name = location.name;
    this.description = location.description;
    this._exits = location.exits;
  }

  public get exits(): Array<Location> {
    return this._exits.map((x) => this.map.getLocation(x));
  }

  public get charactersInLocation(): Array<Character> {
    return this.context.clients
      .filter((client) => client.character?.location === this.id)
      .map((client) => client.character!);
  }

  public canMoveTo(locationId: number): boolean {
    return this._exits.includes(locationId);
  }
}

export class Map {
  public name: string;
  public description: string;
  private _bootstrap: number;
  private _locations: ILocation[];

  public get bootstrap(): number {
    return this._bootstrap;
  }

  public getLocation(locationId: number): Location {
    const location = this._locations.find((x) => x.id === locationId);

    return new Location(
      location ? location : VOID_LOCATION,
      this,
      this.context
    );
  }

  constructor(map: IMap, locations: ILocation[], private context: Context) {
    this.name = map.name;
    this.description = map.description;
    this._bootstrap = map.bootstrap;
    this._locations = locations;
  }
}
