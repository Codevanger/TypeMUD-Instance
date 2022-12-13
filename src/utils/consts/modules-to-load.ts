import { Test } from "../../modules/test/test.ts";
import { GameDatabase } from "../../modules/database/database.ts";
import { WebSocketTransport } from "../../modules/websocket/websocket.ts";
import { Queue } from "../../modules/queue/queue.ts";
import { Module } from "../types/modules.d.ts";

export const MODULES_TO_LOAD: Array<Module> = [
  Queue,
  WebSocketTransport,
  GameDatabase,
  Test,
];
