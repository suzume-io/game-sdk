export type GeneralGameDesignType = {
  BOT_CHANNEL_URL: string;
  DROPPING_PER_SESSION: number;
  DROPPING_REWARDS: Record<string, number | number[]>;
  REFERRAL_REWARDS: Record<string, number | number[]>;
  MAX_CHEST_SLOTS: number;
  DROPPING_TIME_RANGE: number[];
  NEXT_CHEST_REQUIRED_AMOUNT: number;
  CHEST_OPEN_NOW_COST: Record<string, number | number[]>;
};

export type GameDesignAssetType = {
  id: string;
  type: 'consumable' | 'currency' | 'money';
  max: number;
  iconURL: string;
};

export enum GameDesignQuestTabEnum {
  DAILY = 'daily',
  ACHIVEMENT = 'achievement',
  FEATURING = 'featuring',
  INVITES = 'invites'
}

export type GameDesignQuestType = {
  id: string;
  tab: string;
  order: number;
  enabled: boolean;
  recurring: 'life-once' | 'daily-refill' | 'weekly-refill' | 'monthly-refill' | 'social';  
  initial: number;
  amount: number;
  rewards: Record<string, number | number[]>;  
  scheme: string;
  schemeTarget: string;
  schemeLink: string;
};

export type GameDesignChestType = {
  id: string;
  randomWeight: number;
  openTime: number;
  cost: Record<string, number>;
  rewards: Record<string, number | number[]>;
};

export type GameDesignType = {
  general: GeneralGameDesignType;
  assets: Record<string, GameDesignAssetType>;
  quest: Record<string, GameDesignQuestType[]>;
  chest: Record<string, GameDesignChestType>;
  text: Record<string, Record<string, string>>;
};

export default class GameDesign {
  public data: GameDesignType;

  constructor () {    
    this.data = {
      general: {
        BOT_CHANNEL_URL: '',
        DROPPING_PER_SESSION: 0,
        DROPPING_REWARDS: {},
        DROPPING_TIME_RANGE: [0],
        MAX_CHEST_SLOTS: 0,
        REFERRAL_REWARDS: {},
        NEXT_CHEST_REQUIRED_AMOUNT: 0,
        CHEST_OPEN_NOW_COST: {}
      },
      assets: {},
      quest: {},
      chest: {},
      text: {}
    };
  }

  public merge (data: GameDesignType) {
    if (!data) {
      return;
    }
    
    this.data = data;
  }
}
