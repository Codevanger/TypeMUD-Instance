import { CoreModule } from "../../utils/classes/module.ts";
import { log } from "../../utils/functions/log.ts";
import { Context } from "../../utils/types/context.d.ts";
import { Listeners } from "../../utils/types/listener.d.ts";
import { QueuedCommand, QueuedCommands } from "./queued-command.d.ts";

/**
 * Queue sended commands to it module and exec them in another threads
 */
export class Queue extends CoreModule {
  public priority = -1;

  public commandsQueue: QueuedCommands = new Array<QueuedCommand>();

  constructor(_: Context) {
    super(_);
  }

  public onServerIteration = (listeners: Listeners): void => {
    if (this.commandsQueue) {
      this.commandsQueue.forEach((command, index) => {
        command();

        this.commandsQueue.splice(index, 1);
      });

      log('INFO', 'Completed command queue');
    }

    listeners.splice(0);

    if (listeners && listeners.length > 0) 
      listeners[0](listeners, null);
  };


  public addCommandToQueue(command: QueuedCommand): void {
    this.commandsQueue.push(command);

    log('INFO', `Added ${command.name} to queue`)
  }
}
