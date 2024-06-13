import { mergeValue } from './utils';

export default class UserProfile {
  public idToken: string;
  public accessToken: string;
  public sessionAccessToken: string;
  public id: string;
  public name: string;
  public email: string;
  public initData: any

  constructor () {
    this.idToken = '';
    this.accessToken = '';
    this.sessionAccessToken = '';
    this.id = '';
    this.name = '';
    this.email = '';
    this.initData = {};
  }

  public merge (data: any) {
    if (!data) {
      return;
    }

    this.idToken = mergeValue(data.idToken, this.idToken);
    this.accessToken = mergeValue(data.accessToken, this.accessToken);
    this.initData = mergeValue(data?.initData || {}, this.initData)
  }
}
