import { ApiData } from '@app/api/models/utils';
import ServerTime from '@app/api/server-time';

import GameDesign from './game-design';
import { mergeValue } from './utils';

export enum ChestStatusEnum {
  EMPTY = 0,
  AVAILABLE = 1,
  OPENING = 2,
}

export enum ChestStatusForViewEnum {
  EMPTY = 0,
  AVAILABLE_COUNTDOWN = 1,
  COUNTDOWN = 2,
  AVAILABLE_UNLOCK = 3,
  NEXT_CHEST = 4,
}

export type GameChestModelType = {
  chestId: number;
  chestType: string;
  status: number;
  openedAt: number;
  design?: any;
  openElapsed?: number;
};

export type GameChestDataViewType = {
  chestId?: number;
  chestType: string;
  status: number;
  remainingTime: number;
  userMedal?: number;
  nextChestMedal?: number;
  openElapsed: number;
};

export default class GameChestCollection {
  private _maxChestSlot: number;

  public data: Record<string, GameChestModelType>;
  public slots: GameChestDataViewType[];

  constructor() {
    this._maxChestSlot = 0;
    this.data = {};
    this.slots = [];
  }

  public update(data: {ref: ApiData}, serverTime: ServerTime) {
    const { gameDesign, gameAsset } = data.ref;
    // In: data, _maxChestSlot
    // Out: slots: Mang = _maxChestSlot, cac item nam trong cac loai Opening, Unlock, Next chest
    this._maxChestSlot = gameDesign.data.general.MAX_CHEST_SLOTS;

    for (let i = 0; i < this._maxChestSlot; i++) {
      // Init slot
      if (!this.slots[i] || this.slots[i].status == ChestStatusForViewEnum.NEXT_CHEST) {
        this.slots[i] = { remainingTime: 0, status: ChestStatusForViewEnum.EMPTY, chestType: "", openElapsed: 0 };
      }
    }

    let openningCount = Object.values(this.data).reduce((a, b) => {
      if (b.status === ChestStatusEnum.OPENING) {
        const openElapsed = serverTime.getTime() - b.openedAt;
        const chestDesign = gameDesign.data.chest[b.chestType];
        if (chestDesign && openElapsed < chestDesign.openTime * 1000) {
          return a + 1;
        }

        return a;
      }

      return 0;
    }, 0);

    Object.values(this.data).forEach((item, idx) => {
      const chestDesign = gameDesign.data.chest[item.chestType];
      let openElapsed = 0;
      let openRemainTime = 0;

      if (!item.chestType) {
        this.slots[idx] = { remainingTime: 0, status: ChestStatusForViewEnum.EMPTY, chestType: "", openElapsed: 0 };
        return;
      }
      
      if (chestDesign) {
        openElapsed = serverTime.getTime() - item.openedAt;
        // openRemainTime = 600 * 1000 - openElapsed;
        openRemainTime = chestDesign.openTime * 1000 - openElapsed;
      }

      if (item.status === ChestStatusEnum.AVAILABLE) {
        // Available Open Chest
        this.slots[idx] = {
          openElapsed,
          chestId: item.chestId,
          chestType: item.chestType,
          remainingTime: openRemainTime,          
          status: ChestStatusForViewEnum.AVAILABLE_COUNTDOWN,
        };
      } else if (item.status === ChestStatusEnum.OPENING && openRemainTime > 0) {
        // Countdown chest
        this.slots[idx] = {
          openElapsed,
          chestId: item.chestId,
          chestType: item.chestType,
          remainingTime: openRemainTime,
          status: ChestStatusForViewEnum.COUNTDOWN,
        };
      } else if (item.status === ChestStatusEnum.OPENING && openRemainTime <= 0) {
        // Unlock-avaiable chest
        this.slots[idx] = {
          openElapsed,
          chestId: item.chestId,
          chestType: item.chestType,
          remainingTime: openRemainTime,
          status: ChestStatusForViewEnum.AVAILABLE_UNLOCK          
        };
      }
    });

    this.slots = this.slots.filter((item) => !!item.chestType)

    if (this.slots.length < 4) {
      // Next chest
      this.slots[Object.values(this.data).length] = {
        openElapsed: 0,
        remainingTime: 0,
        chestType: "",
        status: ChestStatusForViewEnum.NEXT_CHEST,
        userMedal: gameAsset.medal || 0,
        nextChestMedal: gameDesign.data.general.NEXT_CHEST_REQUIRED_AMOUNT || 0
      };
    }

    return this.slots;
  }

  public mergeMany(chests: Record<string, any>[]) {
    if (!Array.isArray(chests)) {
      return;
    }

    chests.forEach((chest) => this.mergeOne(chest));
  }

  public mergeOne(chestData: Record<string, any>) {
    if (!chestData || !chestData.chest_id) {
      return;
    }

    const chestId = chestData.chest_id;
    if (!this.data[chestId]) {
      this.data[chestId] = {
        chestId,
        chestType: chestData.chest_type,
        status: chestData.status,
        openedAt: chestData.opened_at,
        design: chestData.design,
        openElapsed: chestData.open_elapsed,
      };
    } else {
      const chest = this.data[chestId];
      chest.chestType = mergeValue(chestData.chest_type, chest.chestType);
      chest.status = mergeValue(chestData.status, chest.status);
      chest.openedAt = mergeValue(chestData.opened_at, chest.openedAt);
      chest.design = mergeValue(chestData.design, chest.design);
      chest.openElapsed = mergeValue(chestData.open_elapsed, chest.openElapsed);
    }
  }
}
