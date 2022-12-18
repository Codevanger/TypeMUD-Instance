import { checkPerfomance } from "../functions/perfomance.ts";
import { Context } from "../types/context.d.ts";
import { ServerModules } from "./server-modules.ts";

export class GameServer {
  public modules!: ServerModules;

  private context!: Context;

  public initGameServer(context: Context): void {
    this.context = context;

    this.modules = new ServerModules(this.context);
    this.modules.loadModules();

    this.syncDB();

    this.initServerRefresh();
  }

  private initServerRefresh(): void {
    setInterval(() => {
      const startTime = performance.now();

      this.modules.loadedModulesIterable
        .filter((module) => module.onServerIteration)
        .forEach((module) => {
          module.onServerIteration!();
        });

      checkPerfomance({
        time: startTime,
        message: "Server iteration done in [[time]]",
        overtimeMessage:
          "Server iteration overtime! Mind change your tickrate?",
        overtime: this.context.params!.refreshRate,
      });
    }, this.context.params!.refreshRate);
  }

  private syncDB(): void {
    for (const module in this.modules.dataModules) {
      const dataModule = this.modules.dataModules[module];

      dataModule.sync();
    }
  }
}
