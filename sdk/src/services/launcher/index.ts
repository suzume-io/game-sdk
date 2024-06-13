import { LocatorService } from '@services/locator';

const BOT_API_ENDPOINT = 'https://bot.suzume-api.xyz';

class Launcher {
  private _locator: LocatorService;

  constructor(locator: LocatorService) {
    this._locator = locator;
  }

  public init() {
    this._locator.mainEventBus.detachAll('window');
    this._locator.mainEventBus.on('window', (message: string) => {
      try {
        const data = JSON.parse(message);
        switch (data.cmd) {
          case 'close':
            this.hideQuestBoard();
            break;
          case 'share':
            const { url, text, code } = data.data;
            this._locator.telegram.openShareDialog(url, code, text);

            this._locator.apiEventBus.emit('launcher', undefined, {
              event: 'share',
              params: {
                feature: 'szm_referral',
              },
            });
            break;
          case 'tracking':
            this._locator.apiEventBus.emit('launcher', undefined, data.data);
            break;
          case 'profile':
            this._locator.apiEventBus.emit('launcher', undefined, data);
            break;
          case 'reddot':
            this._locator.apiEventBus.emit('launcher', undefined, data);
            break;
        }
      } catch (ex) {}
    });
  }

  public async connect () {
    this._locator.uiEventBus.emit(
      'quest-board',
      undefined,
      JSON.stringify({
        cmd: 'init',
        data: {},
      })
    );

    await this.subscribeToBot();
  }

  public async subscribeToBot() {
    const gameID = this._locator.gameID;
    const accessToken = this._locator.api.sessionAccessToken;
    const userID = this._locator.telegram.getUserID();
    const userName = this._locator.telegram.getUsername();

    try {
      await fetch(`${BOT_API_ENDPOINT}/${gameID}`, {
        method: 'POST',
        body: JSON.stringify({
          id: userID,
          name: userName,
        }),
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Access-Token': accessToken,
        },
      });

      console.log('Subscribed to bot.');
    } catch (ex) {
      console.error(ex);
    }
  }

  public async showQuestBoard () {
    this.show('/quest-board');
  }

  public async showVault () {
    this.show('/vault');
  }

  public async show(path: string) {    
    const root = document.getElementById('root');
    if (root) {
      root.style.display = 'block';
    }

    this._locator.uiEventBus.emit(
      'quest-board',
      undefined,
      JSON.stringify({
        cmd: 'show',
        data: {
          path
        },
      })
    );

    this._locator.apiEventBus.emit('launcher', undefined, {
      event: 'szm_open_questboard',
      params: undefined,
    });
  }

  public hideQuestBoard() {
    const root = document.getElementById('root');
    if (root) {
      root.style.display = 'none';
    }
  }
}

export default Launcher;
