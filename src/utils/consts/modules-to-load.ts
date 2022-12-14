import { Test } from "../../modules/test/test.ts";
import { GameDatabase } from "../../modules/database/database.ts";
import { WebSocketTransport } from "../../modules/websocket/websocket.ts";
import { Module } from "../types/modules.d.ts";
import { GameHttp } from "../../modules/http/http.ts";

export const MODULES_TO_LOAD: Array<Module> = [
  GameHttp,
  WebSocketTransport,
  GameDatabase,
  Test,
];
