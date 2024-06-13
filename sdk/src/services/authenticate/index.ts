import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { login, signup, updateAttributes } from './aws-cognito';

import { RuntimeModeEnum } from '@config/defs';
import { Config } from '@config/config';
import { LocatorService } from '@services/locator';

class Authenticate {
  public id: string;
  public idToken: string;
  public accessToken: string;
  public name: string;
  public email: string;

  private _telegramID: string;
  private _initData: string;

  private _gameID: string;
  private _runtimeMode: RuntimeModeEnum;
  private _cognitoUser: CognitoUser | undefined;
  private _config: Config;
  private _locator: LocatorService;

  constructor(locator: LocatorService, config: Config) {
    this._config = config;
    this._locator = locator;
    
    this._runtimeMode = RuntimeModeEnum.DEVELOPMENT;
    this._gameID = '';
    this._telegramID = '';
    this._initData = '';
    this._cognitoUser = undefined;

    this.id = '';
    this.idToken = '';
    this.accessToken = '';
    this.name = '';
    this.email = '';
  }

  public init (opts: { gameID: string, runtimeMode: RuntimeModeEnum }) {
    this._gameID = opts.gameID;
    this._runtimeMode = opts.runtimeMode;      

    this._telegramID = String(this._locator.telegram.getUserID());
    this._initData = this._locator.telegram.getInitDataQueryString();
    if (this._runtimeMode === RuntimeModeEnum.DEVELOPMENT || this._runtimeMode === RuntimeModeEnum.LOCAL) {
      this._initData = 'Gg930HtEt0cD';
    }
  }

  public async relogin(): Promise<Authenticate | undefined> {
    await this.login(this._telegramID, this._initData);
    console.info('Signed in user:', this.id);
    return this;
  }

  public async loginOrSignUp(): Promise<Authenticate | undefined> {    
    try {
      await this.login(this._telegramID, this._initData);
    } catch (ex: any) {
      if (ex.code === 'UserLambdaValidationException') {
        console.info('User ID was not found. Try signing-up...');
        await this.signup(this._telegramID, this._initData);
      } else {
        throw ex;
      }
    }

    console.info('Signed in user:', this.id);
    return this;
  }

  public async logout(): Promise<void> {
    this.id = '';
    this.idToken = '';
    this.accessToken = '';
    return Promise.resolve();
  }

  public login(telegramID: string, initData: string): Promise<Authenticate> {
    const userPoolID = this._config.getData(this._runtimeMode).userPoolId;
    const userPoolClientID = this._config.getData(this._runtimeMode).userPoolClientId;

    this._cognitoUser = undefined;
    return login(
      telegramID,
      this.makeCognitoAuthData(initData),
      userPoolID,
      userPoolClientID,
      this.finishLogin.bind(this),
      this.solveLoginChallenge.bind(this)
    );
  }

  private solveLoginChallenge(cognitoUser: CognitoUser, initData: string, cb: Function) {
    console.info('Send login challenge', initData);

    const onSuccess = (session: CognitoUserSession) => {
      this
        .finishLogin(cognitoUser, session)
        .then((result) => cb(undefined, result))
        .catch((error) => cb(error));
    }

    const customChallenge = (challenge: any) => this.solveLoginChallenge(cognitoUser, initData, cb);

    cognitoUser.sendCustomChallengeAnswer(initData, {
      onSuccess,
      customChallenge,
      onFailure: (err: any) => cb(err),      
    });
  }

  private finishLogin(cognitoUser: CognitoUser, session: any): Promise<Authenticate> {
    this._cognitoUser = cognitoUser;

    return new Promise((resolve, reject) => {
      cognitoUser.getUserAttributes((error, userAttributes) => {
        if (error) {
          reject(error);
        } else {
          let attributesMap = new Map();
          if (userAttributes) {
            attributesMap = new Map(
              userAttributes.map((obj) => {
                return [obj.Name, obj.Value];
              })
            );
          }

          const id = attributesMap.get('sub') || '';
          const email = attributesMap.get('email') || '';
          const name = attributesMap.get('name') || email.split('@')[0] || id;

          this.idToken = session.getIdToken().getJwtToken();
          this.accessToken = session.getAccessToken().getJwtToken();
          this.id = id;
          this.name = name;
          this.email = email;

          resolve(this);
        }
      });
    });
  }

  public signup(telegramID: string, initData: string): Promise<Authenticate> {
    const userPoolID = this._config.getData(this._runtimeMode).userPoolId;
    const userPoolClientID = this._config.getData(this._runtimeMode).userPoolClientId;

    this._cognitoUser = undefined;
    return signup(
      telegramID,
      this.makeCognitoAuthData(initData),
      userPoolID,
      userPoolClientID,
      this.finishLogin.bind(this),
      this.solveLoginChallenge.bind(this)
    );
  }

  public makeCognitoAuthData(initData: string) {
    const transformedInitData = `${this._gameID}:${
      this._runtimeMode === RuntimeModeEnum.PRODUCTION ? 'pro' : 'dev'
    }:${initData}`;
    return transformedInitData;
  }

  public async updateUserAttributes(info: Record<string, string>) {
    if (!this._cognitoUser) {
      return undefined;
    }
    const attributeList = Object.entries(info).map(([key, value]) => ({ Name: key, Value: value }));
    return updateAttributes(this._cognitoUser, attributeList);
  }
}

export default Authenticate;
