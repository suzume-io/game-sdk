import { LocatorService } from '@services/locator';
import WebApp from '@twa-dev/sdk';
import { WebAppInitData } from '@twa-dev/types';

const SHARE_URI = 'https://t.me/share/url';

function objectToQueryString(obj: any): string {
  const keyValuePairs = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value == 'object') {
        keyValuePairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`);
      } else {
        keyValuePairs.push(`${encodeURIComponent(key)}=${value}`);
      }
    }
  }
  return keyValuePairs.join('&');
}

class Telegram {
  private _locator: LocatorService;

  constructor(locator: LocatorService) {
    this._locator = locator;
  }

  public getInitDataUnsafe() {
    try {
      let initData: WebAppInitData | undefined = WebApp.initDataUnsafe;
      if (!initData.user) {
        initData = undefined;
      }

      if (!initData) {
        const savedInitData = localStorage.getItem('dev:init_data');
        if (savedInitData) {
          try {
            initData = JSON.parse(savedInitData);
          } catch (ex) {
            console.error(ex);
          }
        }

        if (!initData) {
          initData = {
            user: {
              id: Date.now(),
              username: 'dev',
              first_name: 'Dev'
            },
            auth_date: Date.now(),
            hash: ''
          };
          localStorage.setItem('dev:init_data', JSON.stringify(initData));
        }
      }

      return initData;
    } catch (ex) {
      console.error(ex);
    }

    return undefined;
  }

  public getUserID (): number {
    const initData = this._locator.telegram.getInitDataUnsafe();
    return initData?.user?.id || 0;
  }

  public getUsername (): string {
    const initData = this._locator.telegram.getInitDataUnsafe();
    return initData?.user?.username || '';
  }

  public getInitDataQueryString (): string {
    const initData = this.getInitDataUnsafe();
    if (initData) {
      return objectToQueryString(initData);
    }
    return '';
  }

  public openTelegramLink(link: string) {
    try {
      return WebApp.openTelegramLink(link);
    } catch (ex) {
      console.error(ex);
    }

    return undefined;
  }

  public openShareDialog(appURI: string, code: string, text: string) {
    console.log('OPEN SHARE DIALOG: ', appURI, code, text);
    const referralURI = code ? `${appURI}?startapp=${code}` : appURI;
    WebApp.openTelegramLink(`${SHARE_URI}?url=${referralURI}&text=${text}`);
  }

  public expand() {
    WebApp.expand();
  }

  public enableClosingConfirmation() {
    WebApp.enableClosingConfirmation();
  }

  public ready() {
    WebApp.ready();
  }

  public getWebApp() {
    return WebApp;
  }
}

export default Telegram;
