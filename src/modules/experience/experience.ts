import { GameModule } from "../../utils/classes/module.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
import { sendMessage } from "../../utils/functions/send-message.ts";
import { Client } from "../../utils/types/client.d.ts";
import { Context } from "../../utils/types/context.d.ts";

export class GameExperience extends GameModule {
  constructor(protected context: Context) {
    super(context);

    this.canLoad();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "GameExperience")) {
      throw new Error("Can't load GameExperience module twice!");
    }

    super.canLoad();

    return true;
  }

  public onServerIteration = (): void => {
    if (this.context.clients.length <= 0) {
      return;
    }

    this.context.clients.forEach((client) => {
      if (!client.character) {
        return;
      }

      if (
        +client.character.experience! >=
        this.getExperienceForLevel(+client.character.level!)
      ) {
        client.character.level = +client.character.level! + 1;
        client.character.experience = 0;
        client.character.freePoints = +client.character.freePoints! + 3;

        sendMessage({
          client,
          code: TransportCode.LEVEL_UP,
          initiatorType: "SERVER",
        });
      }
    });
  };

  private getExperienceForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level));
  }
}
