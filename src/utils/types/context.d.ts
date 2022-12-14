import { GameServer } from "../classes/game-server.ts";
import { ServerParameters } from "../classes/server-parameters.ts";
import { Arguments } from "./arguments.d.ts";
import { Client } from "./client.d.ts";

export declare interface Context {
  gameServer: GameServer;
  args: Arguments;
  params: ServerParameters | null;
  clients: Array<Client>;
  version: string;
}
