import { GameModule } from "../../utils/classes/module.ts";
import { TransportCode } from "../../utils/classes/transport-codes.ts";
import { sendMessage } from "../../utils/functions/send-message.ts";
import { Client } from "../../utils/types/client.d.ts";
import { Context } from "../../utils/types/context.d.ts";

export class GameStats extends GameModule {
  public commandsToAdd = {
    CHANGESTATS: this.changeStats,
  };

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Stats")) {
      throw new Error("Can't load Stats module twice!");
    }

    super.canLoad();

    return true;
  }

  public onServerIteration = (): void => {
    this.context.clients.forEach((client) => {
      if (client.character) {
        client.character.health =
          (client.character.health! as number) +
          client.character.getHealthRegen();

        if (client.character.health! > client.character.getMaxHealth()) {
          client.character.health = client.character.getMaxHealth();
        }

        client.character.mana =
          (client.character.mana! as number) + client.character.getManaRegen();

        if (client.character.mana! > client.character.getMaxMana()) {
          client.character.mana = client.character.getMaxMana();
        }

        client.character.stamina =
          (client.character.stamina! as number) +
          client.character.getStaminaRegen();

        if (client.character.stamina! > client.character.getMaxStamina()) {
          client.character.stamina = client.character.getMaxStamina();
        }

        sendMessage({
          client,
          code: TransportCode.STATS_CHANGED,
          data: JSON.stringify({
            health: client.character.health,
            mana: client.character.mana,
            stamina: client.character.stamina,
          }),
          initiatorType: "SERVER",
        });
      }
    });
  };

  public changeStats(client: Client, stats: string): void {
    if (!client.auth) {
      sendMessage({
        client,
        code: TransportCode.AUTH_REQUIRED,
      });

      return;
    }

    if (!client.character) {
      sendMessage({
        client,
        code: TransportCode.CHARACTER_REQUIRED,
      });

      return;
    }

    const parsedClientStats = JSON.parse(stats);

    let statsChanged = 0;
    const parsedStats: { [key: string]: number } =
      client.character.getParsedStats();

    for (const x in parsedClientStats) {
      if (parsedClientStats[x] > 0 && parsedStats[x]) {
        parsedStats[x] += parsedClientStats[x];
        statsChanged++;
      }
    }

    if (statsChanged > client.character!.freeStats!) {
      sendMessage({
        client,
        code: TransportCode.NOT_ENOUGH_POINT,
      });

      return;
    }

    client.character!.freeStats! =
      (client.character!.freeStats! as number) - statsChanged;

    client.character!.stats = JSON.stringify(parsedStats);

    sendMessage({
      client,
      code: TransportCode.STATS_CHANGED,
      initiator: client,
      initiatorType: "CLIENT",
    });
  }
}
