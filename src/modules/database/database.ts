// import { Database } from 'https://deno.land/x/denodb/mod.ts';

import { CoreModule } from "../../utils/classes/module.ts";

// import { Context } from "../../utils/types/program.ts";

export class DatabaseModule extends CoreModule {
  public priority = -1;



  //   public priority = 0;
  //   public db!: Database;
  //   constructor(protected context: Context) {
  //     super(context);
  //     this.canLoad(context);
  //   }
  //   public canLoad: (context: Context) => boolean = (
  //     context: Context
  //   ): boolean => {
  //     if (context.loadedModules["Database"]) {
  //       throw new Error("Can't load Database module twice!");
  //     }
  //     super.canLoad(context, this.dependencies);
  //     return true;
  //   };
  //   private initDatabase(): void {
  //     const connector = SqliteConnector({
  //     });
  //     this.db = new Database(connector)
  //   }
}
