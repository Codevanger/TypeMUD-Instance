import { LoadedModule } from "../types/modules.d.ts";

export function sortModules(array: Array<LoadedModule>): void {
  array.sort((a, b) => a.priority - b.priority);
}