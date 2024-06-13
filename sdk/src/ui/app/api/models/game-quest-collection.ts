import { mergeValue } from './utils';

export enum QuestStatusEnum {
  GOING = 0,
  DONE = 100,
  CLAIMED = 101
}

export enum QuestRecurringEnum {
  SOCIAL = 'social',
  DAILY_REFILL = 'daily-refill',
  WEEKLY_REFILL = 'weekly-refill',
  LIFE_ONCE = 'life-once',
}

export type QuestDesignType = {
  id: string;
  recurring: QuestRecurringEnum;
  amount: number;
  rewards: Record<string, number>;
};

export type GameQuestModelType = {  
  questId: string;
  count: number;
  layer: number;
  status: number;
  updatedAt: number;
};

export default class GameQuestCollection {
  public data: Record<string, GameQuestModelType>;
  
  constructor () {
    this.data = {};
  }

  public find (id: string): GameQuestModelType {
    return this.data[id];
  }

  public mergeMany (quests: Record<string, any>[]) {
    if (!Array.isArray(quests)) {
      return;
    }

    quests.forEach((quest) => this.mergeOne(quest));
  }

  public mergeOne (questData: Record<string, any>) {
    if (!questData || !questData.quest_id) {
      return;
    }

    const questId = questData.quest_id;
    if (!this.data[questId]) {
      this.data[questId] = {
        questId,        
        count: questData.count,
        layer: questData.layer,
        status: questData.status,
        updatedAt: questData.updated_at || 0
      };
    } else {
      const quest = this.data[questId];
      quest.count = mergeValue(questData.count, quest.count);
      quest.status = mergeValue(questData.status, quest.status);
      quest.layer = mergeValue(questData.layer, quest.layer);
      quest.updatedAt = mergeValue(questData.updated_at, quest.updatedAt);
    }
  }
}
