import { MODULES_TO_LOAD } from "../consts/modules-to-load.ts";
import { log } from "../functions/log.ts";
import { checkPerfomance } from "../functions/perfomance.ts";
import { Context } from "../types/context.d.ts";
import { LoadedModule } from "../types/modules.d.ts";
import {
  CoreModule,
  DataModule,
  GameModule,
  TransportModule,
} from "./module.ts";

export class ServerModules {
  public coreModules: Record<string, CoreModule> = {};
  public transportModules: Record<string, TransportModule> = {};
  public gameModules: Record<string, GameModule> = {};
  public dataModule!: DataModule;

  public get loadedModules(): Record<string, LoadedModule> {
    return {
      database: this.dataModule,
      ...this.coreModules,
      ...this.transportModules,
      ...this.gameModules,
    };
  }

  public moduleCommands: Record<string, Function> = {};

  public get loadedModulesIterable(): Array<LoadedModule> {
    const loadedModules = [
      ...Object.values(this.coreModules),
      ...Object.values(this.transportModules),
      ...Object.values(this.gameModules)
    ];

    if (this.dataModule) {
      loadedModules.push(this.dataModule);
    }

    return loadedModules;
  }

  public get loadedModulesNamesIterable(): Array<string> {
    return this.loadedModulesIterable.map((module) => module.constructor.name);
  }

  constructor(private context: Context) {}

  public loadModules(): void {
    if (this.loadedModulesIterable.length > 0) {
      throw new Error("Modules was already loaded!");
    }

    const modulesStartTime = performance.now();

    log("EMPTY");
    log("INFO", "Starting loading modules...");
    log("EMPTY");

    const modulesToLoad = MODULES_TO_LOAD;

    modulesToLoad.forEach((module) => {
      const moduleStartTime = performance.now();

      try {
        log("EMPTY");
        log("INFO", `Starting loading ${module.name} module...`);
        const loadedModule = new module(this.context);

        switch (loadedModule.type) {
          case "CORE":
            this.coreModules[module.name] = loadedModule;
            break;
          case "TRANSPORT":
            this.transportModules[module.name] = loadedModule;
            break;
          case "GAME":
            this.gameModules[module.name] = loadedModule;
            break;
          case "DATA":
            if (this.dataModule) {
              throw new Error("Only one data module can be loaded!");
            }

            this.dataModule = loadedModule as DataModule;
            break;
          default:
            throw new Error("Unknown module type!");
        }

        if (loadedModule.commandsToAdd) {
          for (const command in loadedModule.commandsToAdd) {
            if (this.moduleCommands[command]) {
              throw new Error(`Command ${command} already exists!`);
            }

            this.moduleCommands[command] = loadedModule.commandsToAdd[command].bind(loadedModule);
          }
        }
      } catch (error) {
        log("ERROR", `Module ${module.name} loading error!`);
        log("ERROR", error);

        return;
      }

      log("SUCCESS", `Module ${module.name} loaded!`);

      checkPerfomance({
        time: moduleStartTime,
        message: `Module ${module.name} loaded in [[time]]`,
      });
    });

    log("EMPTY");
    log("INFO", "All modules loaded!");
    log("DEBUG", `Modules load priority: ${this.loadedModulesNamesIterable}`);
    checkPerfomance({
      time: modulesStartTime,
      message: `All modules loaded in [[time]]`,
    });

    log("EMPTY");
  }
}
