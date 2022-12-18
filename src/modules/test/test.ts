import { CoreModule } from "../../utils/classes/module.ts";
import { log } from "../../utils/functions/log.ts";
import { Context } from "../../utils/types/context.d.ts";

/**
 * Module for perfomance testing
 */
export class Test extends CoreModule {
  public priority = 0;

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Test")) {
      throw new Error("Can't load Test module twice!");
    }

    super.canLoad();

    return true;
  }

  public onServerIteration: () => void = () => {
    log("INFO", "Test module iteration");
  };
}
