export declare interface IMap {
  name: string;
  description: string;
  bootstrap: number;
}

export declare interface ILocation {
  id: number;
  name: string;
  description: string;
  bootstrap: number;
  rooms: Array<IRoom>;
}

export declare interface IRoom {
  id: number;
  name: string;
  description: string;
  locationId: number;
  exits: IExit[];
}

export declare interface IExit {
  roomId: number;
  locationId?: number;
  direction: "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW" | "U" | "D";
}
