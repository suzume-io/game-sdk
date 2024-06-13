import { mergeValue } from './utils';

export default class GameAsset {
  public id: string;
  public medal: number;
  public referralCode: string;

  constructor () {    
    this.id = '';
    this.medal = 0;
    this.referralCode = '';
  }

  public merge (data: Record<string, any>) {
    if (!data) {
      return;
    }
    
    this.id = mergeValue(data.id, this.id);
    this.medal = mergeValue(data.medal, this.medal);

    this.referralCode = mergeValue(data.referral_code, this.referralCode);
  }
}
