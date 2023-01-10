import { Client } from "../types/client.d.ts";
import { Context } from "../types/context.d.ts";
import { ILocation, IRoom } from "../types/map.d.ts";
import { Character } from "./database-models.ts";
import { Map } from "./map.ts";
import { Room, VOID_ROOM } from "./room.ts";

export const VOID_LOCATION: ILocation = {
  id: -1,
  name: "Пустота",
  description: "Это пустота.",
  bootstrap: -100,
  rooms: [VOID_ROOM],
};

export class Location {
  public readonly id: number;
  public readonly name: string;
  public readonly description: string;
  public readonly bootstrap: number;
  private readonly _rooms: Array<IRoom> = [];

  constructor(location: ILocation, private map: Map, private context: Context) {
    this.id = location.id;
    this.name = location.name;
    this.description = location.description;
    this.bootstrap = location.bootstrap;
    this._rooms = location.rooms;
  }

  public get charactersInLocation(): Array<Character> {
    return this.clientsInLocation.map((x) => x.character!);
  }

  public get clientsInLocation(): Array<Client> {
    return this.context.clients.filter(
      (client) => Number(client.character?.location) === this.id
    );
  }

  public getRoom(id: number): Room {
    const room = this._rooms.find((x) => x.id === id);

    return new Room(room ? room : VOID_ROOM, this, this.context);
  }
}
