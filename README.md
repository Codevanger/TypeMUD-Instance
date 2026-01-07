# TypeMUD Instance

Game server for TypeMUD — a multiplayer roguelike platform built on Deno.

![Status](https://img.shields.io/badge/status-development%20paused-yellow)
![Deno](https://img.shields.io/badge/Deno-runtime-black)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)

## Overview

TypeMUD Instance is a modular game server that handles real-time multiplayer gameplay via WebSocket. It features a plugin-like architecture where game systems (combat, inventory, NPCs) are loaded as independent modules with dependency management and lifecycle hooks.

> ⚠️ **Status:** Development paused. Core systems work: authentication, character management, map navigation, chat. Combat and NPC AI are incomplete.

## Architecture

The server is built around a modular system inspired by game engine patterns.

### Module System

Modules are self-contained units that:
- Declare dependencies on other modules
- Register commands automatically via `commandsToAdd`
- Hook into lifecycle events (`onServerIteration`, `onCharacterLogin`, `onCharacterLogout`)
- Load in priority order with dependency validation

```typescript
export class GameCharacter extends GameModule {
  public override priority = 100;
  
  override commandsToAdd = {
    SELECT: this.select,
    MYCHARACTER: this.myCharacter,
  };
  
  public onCharacterLogin(client: Client, character: Character) {
    // Called when any character logs in
  }
}
```

### Module Types

| Type | Purpose | Examples |
|------|---------|----------|
| `CORE` | Essential server infrastructure | — |
| `DATA` | Database and persistence | Database (denodb) |
| `TRANSPORT` | Client communication | WebSocket |
| `GAME` | Game logic and features | Character, Map, Chat, NPC, Inventory |

## Tech Stack

- **Runtime:** Deno
- **Language:** TypeScript (strict)
- **Database:** SQLite via denodb
- **Transport:** WebSocket
- **Architecture:** Event-driven, modular

## Project Structure

```
src/
├── main.ts                 # Entry point
├── modules/
│   ├── auth/              # Authentication
│   ├── character/         # Character management
│   ├── chat/              # Messaging system
│   ├── database/          # Data persistence
│   ├── experience/        # XP and leveling
│   ├── http/              # HTTP endpoints
│   ├── inventory/         # Item management
│   ├── map/               # World navigation
│   ├── npc/               # Non-player characters
│   ├── stats/             # Character statistics
│   └── websocket/         # WebSocket transport
└── utils/
    ├── classes/
    │   ├── game-server.ts      # Main server class
    │   ├── module.ts           # Base module classes
    │   ├── server-modules.ts   # Module loader
    │   └── room.ts, map.ts     # World structures
    ├── functions/              # Utility functions
    └── types/                  # TypeScript definitions

json/                      # Game data (rooms, items, NPCs)
```

## Getting Started

### Prerequisites

- [Deno](https://deno.land/) 1.30+

### Running the Server

```bash
# Development
deno task dev

# Or directly
deno run --allow-net --allow-read --allow-write src/main.ts

# With options
deno run --allow-all src/main.ts --port 8080 --refresh-rate 100
```

### Command Line Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--port` | WebSocket server port | 8080 |
| `--refresh-rate` | Server tick interval (ms) | 100 |

## Protocol

Communication uses JSON messages over WebSocket:

```typescript
// Client -> Server (commands)
"/LOGIN username password"
"/SELECT 1"              // Select character by ID
"/MOVE north"
"/SAY Hello world"

// Server -> Client (responses)
{
  "code": "SELECTED_CHARACTER",
  "data": { "character": {...} }
}
```

## Related Projects

- [TypeMUD-Client](https://github.com/Codevanger/TypeMUD-Client) — Desktop client (Angular + Electron)
- [TypeMUD-WebAPI](https://github.com/Codevanger/TypeMUD-WebAPI) — REST API for registration/auth (NestJS)

## What Works

- ✅ WebSocket server with client management
- ✅ User authentication and sessions
- ✅ Character creation and selection
- ✅ Map system with rooms and exits
- ✅ Basic movement between rooms
- ✅ Chat messaging
- ✅ Module hot-loading with dependencies

## What's Incomplete

- ⏸️ Combat system
- ⏸️ NPC AI and interactions
- ⏸️ Item usage and equipment
- ⏸️ Skills and abilities

## License

MIT
