import { mergeValue } from './utils';

export default class UserAsset {
  public id: string;
  public pSZM: number;
  public gem: number;

  constructor () {
    this.id = '';
    this.pSZM = 0;
    this.gem = 0;
  }

  public merge (data: Record<string, any>) {
    if (!data) {
      return;
    }
    
    this.id = mergeValue(data.id, this.id);
    this.pSZM = mergeValue(data.pSZM, this.pSZM);
    this.gem = mergeValue(data.gem, this.gem);
  }
}
