import { Client } from "../types/client.d.ts";
import { Context } from "../types/context.d.ts";
import { ILocation, ILocationWebsocketFriendly, IMap } from "../types/map.d.ts";
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
  public readonly _description: string;
  private readonly _exits: Array<number>;

  constructor(location: ILocation, private map: Map, private context: Context) {
    this.id = location.id;
    this.name = location.name;
    this._description = location.description;
    this._exits = location.exits;
  }

  public get exits(): Array<Location> {
    return this._exits.map((x) => this.map.getLocation(x));
  }

  public get description(): string {
    const clientsInLocation = this.clientsInLocation;

    if (clientsInLocation.length === 0) {
      return this._description;
    }

    const clientsNames = clientsInLocation.map((x) => x.character?.name);

    return `${this._description}\n\n\nВ комнате: ${clientsNames.join(", ")}`;
  }

  public charactersInLocation(): Array<Character> {
    return this.clientsInLocation.map((x) => x.character!);
  }

  public get clientsInLocation(): Array<Client> {
    return this.context.clients.filter(
      (client) => Number(client.character?.location) === this.id
    );
  }

  public canMoveTo(locationId: number): boolean {
    return this._exits.includes(+locationId);
  }

  public websocketFriendly(expandedExits = false): ILocationWebsocketFriendly {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      exits: this._exits,
      expandedExits: expandedExits ? this.exits.map((x) => x.websocketFriendly()) : [],
    };
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
    const location = this._locations.find((x) => +x.id === +locationId);

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
