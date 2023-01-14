import { DataBase } from "../../modules/database/database.ts";
import { WebSocketTransport } from "../../modules/websocket/websocket.ts";
import { Module } from "../types/modules.d.ts";
import { CoreHttp } from "../../modules/http/http.ts";
import { CoreAuth } from "../../modules/auth/auth.ts";
import { GameCharacter } from "../../modules/character/character.ts";
import { GameMap } from "../../modules/map/map.ts";
import { GameChat } from "../../modules/chat/chat.ts";
import { GameFriends } from "../../modules/friends/friends.ts";
import { GameStats } from "../../modules/stats/stats.ts";

export const MODULES_TO_LOAD: Array<Module> = [
  DataBase,
  CoreHttp,
  CoreAuth,
  WebSocketTransport,
  GameCharacter,
  GameMap,
  GameChat,
  GameFriends,
  GameStats,
];
