import { log } from "../functions/log.ts";
import { Context } from "../types/context.d.ts";
import { ModuleType, Module, IModule, LoadedModule } from "../types/modules.d.ts";

export abstract class BaseModule implements IModule {
  public abstract type: ModuleType;

  public priority = 0;

  protected get loadedModules(): Array<LoadedModule> {
    return this.context.gameServer.modules.loadedModulesIterable;
  }

  protected get loadedModulesNames(): Array<string> {
    console.log(this.context);
    return this.context.gameServer.modules.loadedModulesNamesIterable;
  }

  constructor(protected context: Context) {
    this.canLoad();
  }

  public canLoad(dependencies?: Array<Module>): boolean {
    if (dependencies && dependencies.length > 0) {
      const notLoadedDependencies = dependencies?.filter(
        (dependency) =>
          !this.loadedModules.find(
            (module) => module.constructor.name == dependency.constructor.name
          )
      );

      if (notLoadedDependencies && notLoadedDependencies.length > 0) {
        log("ERROR", `Module ${this.constructor.name} failed to load!`);
        log("ERROR", `This module requires other modules to load before it!`);
        log(
          "ERROR",
          `Dependencies - ${notLoadedDependencies.map(
            (x) => x.constructor.name
          )} - is not loaded!`
        );

        throw new Error(`Failed to load module ${this.constructor.name}`);
      }
    }

    return true;
  }
}
export abstract class CoreModule extends BaseModule {
  public type: ModuleType = "CORE";
}
export abstract class TransportModule extends BaseModule {
  public type: ModuleType = "TRANSPORT";
}
export abstract class GameModule extends BaseModule {
  public type: ModuleType = "GAME";
}
