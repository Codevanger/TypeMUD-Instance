import { GameDatabase } from "../../modules/database/database.ts";
import { WebSocketTransport } from "../../modules/websocket/websocket.ts";
import { Module } from "../types/modules.d.ts";
import { GameHttp } from "../../modules/http/http.ts";
import { AuthModule } from "../../modules/auth/auth.ts";
import { CharacterModule } from "../../modules/character/character.ts";
import { GameMap } from "../../modules/map/map.ts";

export const MODULES_TO_LOAD: Array<Module> = [
  GameHttp,
  WebSocketTransport,
  GameDatabase,
  AuthModule,
  CharacterModule,
  GameMap,
];
