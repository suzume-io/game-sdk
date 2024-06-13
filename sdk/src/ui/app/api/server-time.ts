export default class ServerTime {
  private _serverEpoch: number;
  private _clientEpoch: number;

  constructor() {
    this._serverEpoch = this._clientEpoch = Date.now();
  }

  setTime(serverTime: number) {
    if (serverTime) {
      this._serverEpoch = serverTime;
      this._clientEpoch = Date.now();
    }
  }

  getTime(): number {
    return this._serverEpoch + (Date.now() - this._clientEpoch);
  }
}
