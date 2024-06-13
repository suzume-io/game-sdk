import { LocatorService } from '@services/locator';
import { Config } from '@config/config';
import { ConnectionStatus, RuntimeModeEnum } from '@config/defs';

export type UserInfo = {
  
}

export type ApiResponseType = {
  success: boolean;
  data?: Record<string, any>;
  message?: string;
};

function delay(ms: number) {
  return new Promise(function (resolve) {
    setTimeout(() => resolve(undefined), ms);
  });
}

// The async function that waits for a condition to be met
async function waitForCondition(conditionFn: () => boolean, interval = 1000, timeout = 10000) {
  const startTime = Date.now();

  while (true) {
    // Check the condition
    if (conditionFn()) {
      return true;
    }

    // Check if the timeout has been reached
    if (Date.now() - startTime >= timeout) {
      throw new Error('Timeout reached while waiting for condition');
    }

    // Wait for the specified interval before checking the condition again
    await delay(interval);
  }
}

class ApiService {
  public connectionStatus: ConnectionStatus;
  public sessionAccessToken: string;  

  private _config: Config;
  private _gameID: string;
  private _runtimeMode: RuntimeModeEnum;  
  private _reconnecting: boolean;  
  private _locator: LocatorService;

  constructor(locator: LocatorService, config: Config) {
    this._locator = locator;
    this._config = config;    
    this._gameID = '';
    this._runtimeMode = RuntimeModeEnum.DEVELOPMENT;
    this._reconnecting = false;
    
    this.sessionAccessToken = '';
    this.connectionStatus = ConnectionStatus.IDLE;
  }

  public async init(opts: { gameID: string, runtimeMode: RuntimeModeEnum }) {
    this._gameID = opts.gameID;
    this._runtimeMode = opts.runtimeMode;    
  }

  public async getAccess (userInfo?: UserInfo) {
    this.connectionStatus = ConnectionStatus.CONNECTING;
    this._locator.apiEventBus.emit('status', undefined, this.connectionStatus);

    const response = await this.call('GET', 'access', userInfo);
    this.mergeAllDataModels(response?.data);
    this.sessionAccessToken = response?.data?.token;
    this.connectionStatus = ConnectionStatus.CONNECTED;    
    this._locator.apiEventBus.emit('status', undefined, this.connectionStatus);
    return response?.data;
  }

  private async reconnect() {
    if (this._reconnecting) {
      await waitForCondition(() => !this._reconnecting, 3000);
      return;
    }

    this._reconnecting = true;
    await this._locator.authenticate.relogin();
    await this.getAccess();
    
    // await this._questboardService.reconnect();

    this._reconnecting = false;
  }

  private mergeAllDataModels(responseData: any) {
    if (!responseData) {
      return;
    }

    this._locator.apiEventBus.emit('response', undefined, responseData);
  }

  public async setGameState(states: Record<string, string | number | null>) {
    const response = await this.call('POST', 'game/state', { data: states });
    this.mergeAllDataModels(response?.data);
  }

  public async claimReferral(
    code: string,
    socialId: string,
    userName: string,
    userAvatar: string,
    firstName: string,
    lastName: string
  ) {
    const response = await this.call('POST', 'referral', { code, socialId, userName, userAvatar, firstName, lastName });
    this.mergeAllDataModels(response?.data);
  }

  public async claimDroppingReward(entryID: number, count: number) {
    if (!entryID) {
      throw new Error('No game started yet');
    }

    const response = await this.call('POST', `game/dropping/${entryID}`, { count });
    this.mergeAllDataModels(response?.data);

    return response?.data;
  }

  public async submitGameEnding(entryID: number, historyData: string[]) {
    if (!entryID) {
      throw new Error('No game started yet');
    }

    const response = await this.call('POST', `game/ending/${entryID}`, { historyData });
    this.mergeAllDataModels(response?.data);

    return response?.data;
  }

  public async claimQuestCompletion(questID: string, count: number) {
    const response = await this.call('PUT', `daily-quest/${questID}`, { count });
    this.mergeAllDataModels(response?.data);

    return response?.data;
  }

  public async createGameEntry(vegas: boolean, card3: boolean) {
    const response = await this.call('POST', 'game', { vegas, card3 });
    this.mergeAllDataModels(response?.data);
    return response?.data;
  }

  public async getAllChests() {
    const response = await this.call('GET', 'chest');
    this.mergeAllDataModels(response?.data);
    return response?.data;
  }

  public async startOpenChest(chestId: number) {
    const response = await this.call('PUT', 'chest', { chestId });
    this.mergeAllDataModels(response?.data);
    return response?.data;
  }

  public async unlockOpenChest(chestId: number) {
    const response = await this.call('PATCH', 'chest', { chestId });
    this.mergeAllDataModels(response?.data);
    return response?.data;
  }

  public sendStackTrace(stackInfo: any) {
    return new Promise((resolve) => {
      console.warn('*** SEND STRACK TRACE ***');
      const apiURL = this._config.getData(this._runtimeMode).userAPIUrl;
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status >= 200 && xhr.status < 400) {
            let data = undefined;
            try {
              data = JSON.parse(xhr.responseText);
            } catch (ex) {
              console.error(ex);
              data = xhr.responseText;
            }
            resolve(data);
          } else {
            resolve(new Error(xhr.responseText));
          }
        }
      };

      xhr.onerror = function (error) {
        console.error(error);
        resolve(error);
      };

      const url = `${apiURL}api/log`;
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

      if (this._locator.authenticate.idToken) {
        xhr.setRequestHeader('Authorization', this._locator.authenticate.idToken);
      }
      xhr.setRequestHeader('X-Game-Id', this._gameID);

      if (Array.isArray(stackInfo.stack)) {
        if (stackInfo.stack.length > 100) {
          stackInfo.stack = stackInfo.stack.slice(0, 100);
        }
        stackInfo.stack.forEach((stack: Record<string, any>) => {
          for (const key in stack) {
            const line = JSON.stringify(stack[key]);
            if (line.length > 1024) {
              stack[key] = undefined;
            }
          }
        });      
      }

      let textLog = JSON.stringify(stackInfo);
      if (textLog.length > 102400) {
        textLog = textLog.substring(0, 102400);
      }

      xhr.send(
        JSON.stringify({
          userID: this._locator.authenticate.id,
          data: textLog,
        })
      );
    });
  }

  private async call(method: string, path: string, data?: any): Promise<ApiResponseType> {
    const result = this.tryCallAPI(method, path, data);
    return result!;
  }

  private async tryCallAPI(method: string, path: string, data?: any, attempts?: number): Promise<ApiResponseType> {
    attempts = attempts || 5;

    let result: ApiResponseType | undefined = {
      success: false
    };

    let attempt = 0;
    while (attempt < attempts) {
      try {
        result = await this.callAPI(method, path, data);
        if (!result.success) {
          console.error(result.message);          
        }
        return result;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        attempt++;
        if (attempt < attempts) {
          await this.reconnect();
        } else {
          this.connectionStatus = ConnectionStatus.DISCONNECTED;
          this._locator.apiEventBus.emit('status', undefined, this.connectionStatus);
        }
      }
    }

    return result;
  }

  public isReady (): boolean {
    return !!this.sessionAccessToken;
  }

  public callAPI(method: string, path: string, data?: Record<string, string>): Promise<ApiResponseType> {
    return new Promise((resolve, reject) => {
      const apiURL = this._config.getData(this._runtimeMode).userAPIUrl;

      let xhr = new XMLHttpRequest();
      xhr.timeout = 30000;

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status >= 200 && xhr.status < 400) {
            let data = undefined;
            try {
              data = JSON.parse(xhr.responseText);
            } catch (ex) {
              console.error(ex);
              data = xhr.responseText;
            }
            resolve(data);
          } else {
            reject(new Error(xhr.responseText));
          }
        }
      };

      xhr.onerror = function (error) {
        console.error(error);
        reject(error);
      };

      let url = `${apiURL}api/${path}`;
      if (data && method === 'GET') {
        url += '?' + Object.entries(data).filter(([_, value]) => (value != null)).map(([key, value]) => (`${key}=${value}`)).join('&');
      }
      xhr.open(method, url, true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

      if (this._locator.authenticate.idToken) {
        xhr.setRequestHeader('Authorization', this._locator.authenticate.idToken);
      }
      if (this.sessionAccessToken) {
        xhr.setRequestHeader('X-Access-Token', this.sessionAccessToken);
      }
      xhr.setRequestHeader('X-Game-Id', this._gameID);
      
      if (method === 'GET') {
        xhr.send();
      } else {
        if (data) {
          xhr.send(JSON.stringify(data));
        } else {
          xhr.send();
        }
      }
    });
  }
}

export default ApiService;
