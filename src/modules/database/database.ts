import { CoreModule } from "../../utils/classes/module.ts";
import { Context } from "../../utils/types/context.d.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { log } from "../../utils/functions/log.ts";

/**
 * Module for database connection
 */
export class GameDatabase extends CoreModule {
  public priority = -1;

  private DB!: DB;

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
    this.initDB();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Database")) {
      throw new Error("Can't load Database module twice!");
    }

    super.canLoad();

    return true;
  }

  private initDB(): void {
    try {
      this.DB = new DB("db/server.db");

      log("SUCCESS", "Database connected!");
    }
    catch (e) {
      log("ERROR", "Can't connect to database!");
      log("DEBUG", e.message);
    }
  }
}
