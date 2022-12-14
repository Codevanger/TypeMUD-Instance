import { CoreModule } from "../../utils/classes/module.ts";
import { Context } from "../../utils/types/context.d.ts";

/**
 * Module for authentication
 */
export class GameAuth extends CoreModule {
  public priority = -1;

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Auth")) {
      throw new Error("Can't load Auth module twice!");
    }

    super.canLoad();

    return true;
  }
}
