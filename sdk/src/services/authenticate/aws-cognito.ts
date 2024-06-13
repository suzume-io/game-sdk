import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool, CognitoUserSession, ICognitoUserAttributeData } from "amazon-cognito-identity-js";

export type FinishLoginFunction = (cognitoUser: CognitoUser, session: CognitoUserSession) => Promise<any>;
export type SolveLoginChallengeFunction = (cognitoUser: CognitoUser, initData: string, cb: (error: any, result: any) => any) => void;

const getRandomString = (bytes: number) => {
  const randomValues = new Uint8Array(bytes);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map(intToHex).join('');
};

const intToHex = (nr: number) => {
  return nr.toString(16).padStart(2, '0');
};

export const login = (telegramID: string, initData: string, userPoolId: string, userPoolClientId: string, finishLogin: FinishLoginFunction, solveLoginChallenge: SolveLoginChallengeFunction): Promise<any> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: telegramID,
    });

    const userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: userPoolClientId,
    });

    const cognitoUser = new CognitoUser({
      Username: telegramID,
      Pool: userPool,
    });

    cognitoUser.initiateAuth(authenticationDetails, {
      onSuccess: (session) => finishLogin(cognitoUser, session).then(resolve).catch(reject),
      onFailure: (err) => reject(err),
      customChallenge: (challenge) => {
        return solveLoginChallenge(cognitoUser, initData, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
      },
    });
  });
};

export const signup = (telegramID: string, initData: string, userPoolId: string, userPoolClientId: string, finishLogin: FinishLoginFunction, solveLoginChallenge: SolveLoginChallengeFunction): Promise<any> => {
  console.log('signup: ', initData)

  return new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: userPoolClientId,
    });

    const username = telegramID;
    const password = getRandomString(30);

    userPool.signUp(username, password, [], [new CognitoUserAttribute({ Name: "initData", Value: initData })], (error, result) => {
      if (error) {
        reject(error);
      } else {
        console.log('signup - login: ', initData)

        login(telegramID, initData, userPoolId, userPoolClientId, finishLogin, solveLoginChallenge).then(resolve).catch(reject);
      }
    });
  });
};

export const relogin = (userPoolId: string, userPoolClientId: string, finishLogin: FinishLoginFunction): Promise<any> => {
  return new Promise(function (resolve, reject) {
    const userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: userPoolClientId,
    });

    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((error: Error, session: CognitoUserSession | null) => {
        if (error) {
          reject(error);
        } else if (!session) {
          resolve(undefined);
        } else {
          finishLogin(cognitoUser, session).then(resolve).catch(reject);
        }
      });
    } else {
      resolve(undefined);
    }
  });
};

export const updateAttributes = (cognitoUser: CognitoUser, attributes: ICognitoUserAttributeData[]): Promise<any> => {  
  return new Promise((resolve, reject) => {
    var attributeList = attributes.map((attribute) => (new CognitoUserAttribute(attribute)));  
    cognitoUser.updateAttributes(attributeList, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
