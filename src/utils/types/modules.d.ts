import { BaseModule } from "../classes/module.ts";
import { Context } from "./context.d.ts";
import { Priority } from "./priority.d.ts";

export declare type ModuleType = "CORE" | "TRANSPORT" | "GAME" | "DATA";

export declare type Module = new (args: Context) => LoadedModule;
export declare type LoadedModule = InstanceType<typeof BaseModule>;

export interface IModule {
  /**
   * In what priority this module should execute his functions
   */
  priority: Priority;

  /**
   * What modules should be loaded before this module
   */
  dependencies?: Array<IModule>;

  /**
   * Can this module be loaded?
   * @param {Context} context Context of server
   * @param {Array<Module>} dependencies Module dependencies
   * @returns {boolean} Can module be booted up
   */
  canLoad: (dependencies?: Array<Module>) => boolean;
}
