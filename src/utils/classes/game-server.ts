import { checkPerfomance } from "../functions/perfomance.ts";
import { Context } from "../types/context.d.ts";
import { ServerModules } from "./server-modules.ts";

export class GameServer {
  public modules!: ServerModules;

  private context: Context | null = null;

  public initGameServer(context: Context): void {
    this.context = context;

    this.modules = new ServerModules(this.context);
    this.modules.loadModules()

    this.initServerRefresh();
  }

  private initServerRefresh(): void {
    setInterval(() => {
      const startTime = performance.now();

      // const listeners: Listeners = this.context.loadedModulesArray
      //   .filter(
      //     (module) => this.context.loadedModules[module].onServerIteration
      //   )
      //   .map((module) => this.context.loadedModules[module].onServerIteration!);

      // if (listeners && listeners.length > 0) {
      //   listeners[0](listeners, null);
      // }

      // if (this.context.loadedModules['Queue']) {
      //   const queue = <Queue>this.context.loadedModules['Queue'];

      //   queue.addCommandToQueue(() => {
      //     console.log('hi ;)');
      //   });

      //   log('DEBUG', 'Added command to queue', true);
      // }

      checkPerfomance({
        time: startTime,
        message: "Server iteration done in [[time]]",
        overtimeMessage:
          "Server iteration overtime! Mind change your tickrate?",
        overtime: this.context.params!.refreshRate,
      });
    }, this.context.params!.refreshRate);
  }
}
