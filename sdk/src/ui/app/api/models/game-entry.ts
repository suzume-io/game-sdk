import { mergeValue } from './utils';

export default class GameEntry {
  public boardId: number;
  public randomSeed: number;
  public droppingCount: number;
  public initialData: string;
  public isVegas: boolean;
  public isCard3: boolean;
  public version: number;
  public status: number;

  constructor() {
    this.boardId = 0;
    this.randomSeed = 0;
    this.droppingCount = 0;
    this.initialData = '';
    this.isVegas = false;
    this.isCard3 = false;
    this.version = 0;
    this.status = 0;
  }

  public merge(data: Record<string, any>) {
    if (!data) {
      return;
    }
    
    this.boardId = mergeValue(data.board_id, this.boardId);
    this.randomSeed = mergeValue(data.random_seed, this.randomSeed);
    this.droppingCount = mergeValue(data.dropping_count, this.droppingCount);
    this.initialData = mergeValue(data.initial_data, this.initialData);
    this.isVegas = mergeValue(data.is_vegas, this.isVegas);
    this.isCard3 = mergeValue(data.is_card3, this.isCard3);
    this.version = mergeValue(data.version, this.version);
    this.status = mergeValue(data.status, this.status);
  }
}
