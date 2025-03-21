import { Client } from "../types/client.d.ts";
import { Context } from "../types/context.d.ts";
import { IExit, IRoom } from "../types/map.d.ts";
import { Character } from "./database-models.ts";
import { Location } from "./location.ts";
import { Map } from "./map.ts";

export const VOID_ROOM: IRoom = {
  id: 1,
  name: "Пустота",
  description: "Это пустота.",
  locationId: -1,
  exits: [
    {
      id: 1,
      roomId: 1,
      direction: "N",
    },
    {
      id: 2,
      roomId: 1,
      direction: "NE",
    },
    {
      id: 3,
      roomId: 1,
      direction: "E",
    },
    {
      id: 4,
      roomId: 1,
      direction: "SE",
    },
    {
      id: 5,
      roomId: 1,
      direction: "S",
    },
    {
      id: 6,
      roomId: 1,
      direction: "SW",
    },
    {
      id: 7,
      roomId: 1,
      direction: "W",
    },
    {
      id: 8,
      roomId: 1,
      direction: "NW",
    },
  ],
  entities: []
};

export class Room {
  public readonly id: number;
  public readonly name: string;
  public readonly description: string;
  public readonly locationId: number;
  public exits: Array<IExit> = [];

  constructor(
    room: IRoom,
    public location: Location,
    private context: Context,
    private map: Map
  ) {
    this.id = room.id;
    this.name = room.name;
    this.description = room.description;
    this.locationId = room.locationId;
    this.exits = room.exits.map((x) => {
      return {
        ...x,
        locationId: x.locationId ? x.locationId : this.locationId,
      };
    });
  }

  public get charactersInRoom(): Array<Character> {
    return this.clientsInRoom.map((x) => x.character!);
  }

  public get clientsInRoom(): Array<Client> {
    return this.context.clients.filter(
      (client) => Number(client.character?.["location"]) === this.locationId
    );
  }

  public getExit(id: number): IExit {
    const exit = this.exits.find((x) => x.id === Number(id));

    if (!exit) {
      return {
        id,
        roomId: 1,
        direction: "N",
        locationId: -1,
      };
    }

    return exit;
  }
}
