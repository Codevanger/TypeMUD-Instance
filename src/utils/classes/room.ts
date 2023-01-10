import { Client } from "../types/client.d.ts";
import { Context } from "../types/context.d.ts";
import { IRoom } from "../types/map.d.ts";
import { Character } from "./database-models.ts";
import { Location } from "./location.ts";

export const VOID_ROOM: IRoom = {
  id: 1,
  name: "Пустота",
  description: "Это пустота.",
  locationId: -1,
  exits: [
    {
      roomId: 1,
      direction: "N",
    },
    {
      roomId: 1,
      direction: "NE",
    },
    {
      roomId: 1,
      direction: "E",
    },
    {
      roomId: 1,
      direction: "SE",
    },
    {
      roomId: 1,
      direction: "S",
    },
    {
      roomId: 1,
      direction: "SW",
    },
    {
      roomId: 1,
      direction: "W",
    },
    {
      roomId: 1,
      direction: "NW",
    },
  ],
};

export class Room {
  public readonly id: number;
  public readonly name: string;
  public readonly description: string;
  public readonly locationId: number;
  private _exits: Array<number> = [];

  constructor(
    room: IRoom,
    private location: Location,
    private context: Context
  ) {
    this.id = room.id;
    this.name = room.name;
    this.description = room.description;
    this.locationId = room.locationId;
  }

  public get charactersInRoom(): Array<Character> {
    return this.clientsInRoom.map((x) => x.character!);
  }

  public get clientsInRoom(): Array<Client> {
    return this.context.clients.filter(
      (client) => Number(client.character?.location) === this.locationId
    );
  }

  public canMoveTo(room: Room): boolean {
    return this._exits.includes(room.id);
  }
}
