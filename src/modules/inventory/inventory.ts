import { GameModule } from "../../utils/classes/module.ts";
import { Context } from "../../utils/types/context.d.ts";
import { IItem, ItemType } from "../../utils/types/item.d.ts";
import type { Client } from "../../utils/types/client.d.ts";
import { GameMap } from "../../modules/map/map.ts";

import { log } from "../../utils/functions/log.ts";

export class GameInventory extends GameModule {
  private items: Map<number, IItem[]> = new Map();
  private maxWeight: number = 50; // Максимальный вес инвентаря по умолчанию
  private droppedItems: Map<number, { item: IItem, expireTime: number }[]> = new Map(); // roomId -> dropped items

  public override commandsToAdd = {
    INVENTORY: this.getInventory,
    ADDITEM: this.addItem,
    DROPITEM: this.dropItem,
    GIVEITEM: this.giveItem,
  };

  constructor(protected override context: Context) {
    super(context);

    this.canLoad();
    this.initItems();
  }

  public override canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "GameInventory")) {
      throw new Error("Can't load GameInventory module twice!");
    }

    super.canLoad();

    return true;
  }

  private initItems() {
    // Инициализация базовых предметов
    const basicItems: IItem[] = [
      {
        id: 1,
        name: "Золотая монета",
        description: "Блестящая золотая монета",
        type: ItemType.MISC,
        weight: 0.1,
        value: 1
      },
      {
        id: 2,
        name: "Меч",
        description: "Острый стальной меч",
        type: ItemType.WEAPON,
        weight: 2,
        value: 10,
        properties: {
          damage: 5,
          durability: 100
        }
      }
    ];

    // Добавляем базовые предметы в инвентарь
    this.items.set(1, basicItems);
  }

  public getInventory(client: Client): void {
    const items = this.items.get(client.id) || [];
    log("INFO", `Инвентарь клиента ${client.id}: ${JSON.stringify(items)}`);
  }

  public addItem(client: Client, itemId: string): void {
    const itemIdNum = parseInt(itemId);
    if (isNaN(itemIdNum)) {
      log("WARNING", `Неверный формат ID предмета: ${itemId}`);
      return;
    }

    const currentItems = this.items.get(client.id) || [];
    const itemToAdd = currentItems.find(item => item.id === itemIdNum);
    
    if (!itemToAdd) {
      log("WARNING", `Предмет с ID ${itemId} не найден`);
      return;
    }

    const currentWeight = this.calculateTotalWeight(currentItems);

    if (currentWeight + itemToAdd.weight > this.maxWeight) {
      log("WARNING", `Превышен максимальный вес инвентаря для клиента ${client.id}`);
      return;
    }

    currentItems.push(itemToAdd);
    this.items.set(client.id, currentItems);
    log("SUCCESS", `Предмет ${itemToAdd.name} добавлен в инвентарь клиента ${client.id}`);
  }

  public dropItem(client: Client, itemId: string): void {
    const itemIdNum = parseInt(itemId);
    if (isNaN(itemIdNum)) {
      log("WARNING", `Неверный формат ID предмета: ${itemId}`);
      return;
    }

    if (!client.character) {
      log("WARNING", "Персонаж не найден");
      return;
    }

    const currentItems = this.items.get(client.id) || [];
    const itemIndex = currentItems.findIndex(item => item.id === itemIdNum);

    if (itemIndex === -1) {
      log("WARNING", `Предмет с ID ${itemId} не найден в инвентаре клиента ${client.id}`);
      return;
    }

    // Получаем текущую локацию и комнату персонажа
    const gameMap = this.loadedModules["GameMap"] as GameMap;
    const location = gameMap.MAP_OBJECT.getLocation(client.character.getLocationId());
    const room = location.getRoom(client.character.getRoomId());

    const droppedItem = currentItems[itemIndex];
    currentItems.splice(itemIndex, 1);
    this.items.set(client.id, currentItems);

    // Добавляем предмет в список выброшенных предметов в комнате
    const roomDroppedItems = this.droppedItems.get(room.id) || [];
    roomDroppedItems.push({
      item: droppedItem,
      expireTime: Date.now() + 5 * 60 * 1000 // 5 минут
    });
    this.droppedItems.set(room.id, roomDroppedItems);

    // Оповещаем всех в комнате о выброшенном предмете
    room.clientsInRoom.forEach((clientInRoom) => {
      if (clientInRoom.id === client.id) return;
      
      log("INFO", `Клиент ${client.id} выбросил предмет ${droppedItem.name} в комнате ${room.id}`);
    });

    log("SUCCESS", `Предмет ${droppedItem.name} выброшен на землю в комнате ${room.id}`);

    // Запускаем таймер на удаление предмета
    setTimeout(() => {
      const items = this.droppedItems.get(room.id) || [];
      const index = items.findIndex(i => i.item.id === droppedItem.id);
      if (index !== -1) {
        items.splice(index, 1);
        this.droppedItems.set(room.id, items);
        log("INFO", `Предмет ${droppedItem.name} исчез из комнаты ${room.id}`);
      }
    }, 5 * 60 * 1000); // 5 минут
  }

  public giveItem(client: Client, targetId: string, itemId: string): void {
    const itemIdNum = parseInt(itemId);
    const targetIdNum = parseInt(targetId);
    
    if (isNaN(itemIdNum) || isNaN(targetIdNum)) {
      log("WARNING", `Неверный формат ID: itemId=${itemId}, targetId=${targetId}`);
      return;
    }

    const currentItems = this.items.get(client.id) || [];
    const itemIndex = currentItems.findIndex(item => item.id === itemIdNum);

    if (itemIndex === -1) {
      log("WARNING", `Предмет с ID ${itemId} не найден в инвентаре клиента ${client.id}`);
      return;
    }

    const item = currentItems[itemIndex];
    const targetItems = this.items.get(targetIdNum) || [];
    const targetWeight = this.calculateTotalWeight(targetItems);

    if (targetWeight + item.weight > this.maxWeight) {
      log("WARNING", `Превышен максимальный вес инвентаря для клиента ${targetIdNum}`);
      return;
    }

    currentItems.splice(itemIndex, 1);
    targetItems.push(item);
    this.items.set(client.id, currentItems);
    this.items.set(targetIdNum, targetItems);
    log("SUCCESS", `Предмет ${item.name} передан от клиента ${client.id} клиенту ${targetIdNum}`);
  }

  private calculateTotalWeight(items: IItem[]): number {
    return items.reduce((total, item) => total + item.weight, 0);
  }
}
