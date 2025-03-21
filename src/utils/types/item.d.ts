export interface IItem {
  id: number;
  name: string;
  description: string;
  type: ItemType;
  weight: number;
  value: number;
  properties?: Record<string, any>;
}

export enum ItemType {
  WEAPON = "weapon",
  ARMOR = "armor",
  CONSUMABLE = "consumable",
  MATERIAL = "material",
  QUEST = "quest",
  MISC = "misc"
} 