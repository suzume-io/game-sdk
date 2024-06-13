import { mergeValue } from './utils';

export enum ConnectionStatus {
    CONNECTING,
    CONNECTED,
    DISCONNECTED
}

export default class GameState {
  public connectionStatus: ConnectionStatus;

  constructor() {
    this.connectionStatus = ConnectionStatus.CONNECTING;
  }

  public update(other: Partial<GameState>) {
    if (!other) {
      return;
    }
    
    this.connectionStatus = mergeValue(other.connectionStatus, this.connectionStatus);
  }
}
