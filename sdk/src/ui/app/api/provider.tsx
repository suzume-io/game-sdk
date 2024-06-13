import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';

import GameAsset from './models/game-asset';
import GameChestCollection, { ChestStatusForViewEnum, GameChestDataViewType } from './models/game-chest-collection';
import GameDesign from './models/game-design';
import GameQuestCollection from './models/game-quest-collection';
import GameState, { ConnectionStatus } from './models/game-state';
import ReferralConnectionCollection from './models/referral-connection-collection';
import UserAsset from './models/user-asset';
import UserProfile from './models/user-profile';
import ServerTime from './server-time';

import { ApiData, shouldShowRedDot } from './models/utils';
import NftCollection from './models/nft-collection';
import NftOwnership from './models/nft-ownership';
import Locator from '@services/locator';
import { ApiResponseType } from '@services/api';

const DEBUG = true;

export type ApiContextValues = {
  serverTime: ServerTime;
  isLoading: boolean;
  data: { ref: ApiData };
  refresh: () => void;
  chestSlots: GameChestDataViewType[];
  getApi: (path: string) => void;
  postApi: (path: string, method: string, bodyData: any) => Record<string, any> | undefined;
  closeNotificationModal: () => void;
  openConnectionErrorModal: () => void;
  closeConnectionErrorModal: () => void;
  mergeBodyData: (bodyData: any) => void;
  processMessage: (msg: any) => void;
};

export enum ReplyMessageEnum {
  EMPTY = 'EMPTY',
  FULL_CHEST = 'FULL_CHEST',
  OPEN_NOW = 'OPEN_NOW',
  TELEGRAM_NOT_FOUND = 'TELEGRAM_NOT_FOUND',
  TELEGRAM_NOT_FOUND_API_FAIL = 'TELEGRAM_NOT_FOUND_API_FAIL',
  USER_NOT_ENOUGH_MONEY = 'UserNotEnoughMoney',
}

const ApiContext = createContext<ApiContextValues | undefined>(undefined);

export const ApiProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [data, setData] = useState<{ ref: ApiData }>({
    ref: {
      // NOTE: In development process, change isShow = true to show UI
      // isShow: false,
      isShow: true,
      gameDesign: new GameDesign(),
      userProfile: new UserProfile(),
      userAsset: new UserAsset(),
      gameAsset: new GameAsset(),
      gameQuests: new GameQuestCollection(),
      gameChests: new GameChestCollection(),
      gameState: new GameState(),

      nftCollections: new NftCollection(),
      nftOwnerships: new NftOwnership(),
      selectedNftCollection: undefined,

      referralConnections: new ReferralConnectionCollection(),
      rewards: {},
      message: ReplyMessageEnum.EMPTY,
    },
  });
  const [chestSlots, setChestSlots] = useState<GameChestDataViewType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const serverTime = useRef<ServerTime>(new ServerTime());

  const processMessage = async (msg: any) => {
    switch (msg.cmd) {
      case 'init':
        {
          const profileData = await getApi('qb/profile');
          mergeBodyData(profileData);

          Locator.mainEventBus.emit(
            'window',
            undefined,
            JSON.stringify({
              cmd: 'profile',
              data: profileData,
            })
          );

          setData({ ref: data.ref });
          setRefreshCount(refreshCount + 1);
        }
        break;
      case 'show':
        data.ref.isShow = true;
        setData({ ref: data.ref });

        const profileData = await getApi('qb/profile');
        if (profileData) {
          Locator.mainEventBus.emit(
            'window',
            undefined,
            JSON.stringify({
              cmd: 'profile',
              data: profileData,
            })
          );
        }

        setData({ ref: data.ref });
        setRefreshCount(refreshCount + 1);
        break;
      case 'close':
        data.ref.isShow = false;
        setData({ ref: data.ref });
        break;
    }
  };

  if (DEBUG) {
    (window as any).qbDebug = function (msg: any) {
      processMessage(msg);
    };
  }

  const mergeBodyData = (bodyData: any) => {
    serverTime.current.setTime(bodyData.now);

    data.ref.gameDesign.merge(bodyData.gameDesign);
    data.ref.userProfile.merge(bodyData.userProfile);
    data.ref.userAsset.merge(bodyData.userAsset);
    data.ref.gameAsset.merge(bodyData.gameAsset);
    data.ref.gameQuests.mergeMany(bodyData.gameQuests);
    data.ref.gameQuests.mergeOne(bodyData.gameQuest);
    data.ref.gameChests.mergeMany(bodyData.gameChests);
    data.ref.gameState.update(bodyData.gameState);
    data.ref.referralConnections.mergeMany(bodyData.referralConnections);
    data.ref.nftCollections.mergeMany(bodyData.nftCollections);
    data.ref.nftOwnerships.mergeMany(bodyData.nftOwnerships);

    bodyData.selectedNftCollection && (data.ref.selectedNftCollection = bodyData.selectedNftCollection);

    bodyData.message && (data.ref.message = bodyData.message || ReplyMessageEnum.EMPTY);
    bodyData.rewards &&
      (data.ref.rewards = bodyData.rewards
        ? Object.assign({}, bodyData.rewards?.user || {}, bodyData.rewards?.game || {})
        : {});

    bodyData.message && handleApiMessage(bodyData.message);

    setData({ ref: data.ref });
    setChestSlots(data.ref.gameChests.slots);

    Locator.mainEventBus.emit(
      'window',
      undefined,
      JSON.stringify({
        cmd: 'reddot',
        data: {
          visible: shouldShowRedDot(data.ref),
        },
      })
    );
  };

  const mergeResponse = async (body: ApiResponseType) => {
    try {
      console.log(body);

      if (body.data) {
        mergeBodyData(body.data);
        return body.data;
      } else if (body.message) {
        handleApiMessage(body.message);
      }
    } catch (ex: any) {
      ex?.message && handleApiMessage(ex?.message);
      console.error(ex);
    }

    return undefined;
  };

  const getApi = async (path: string) => {
    let response: any;
    if (!Locator.api.isReady()) {
      return;
    }
    setIsLoading(true);

    try {
      response = await Locator.api.callAPI('GET', path);
    } catch (error: any) {
      // console.log("Get Error: ", error, JSON.stringify(error))
      // console.log("Get Attr Error: ", error.errorCode, error.message, error.statusCode)
      // // @ts-ignore
      // window.xxxGet = error

      mergeBodyData({ gameState: { connectionStatus: ConnectionStatus.DISCONNECTED } });
      setIsLoading(false);
      throw error;
    }

    console.log('--- Get Res: ', response);

    setIsLoading(false);

    const result = await mergeResponse(response);
    return result;
  };

  const postApi = async (path: string, method: string, bodyData: any) => {
    let response: any;
    if (!Locator.api.isReady()) {
      return;
    }

    setIsLoading(true);

    try {
      response = await Locator.api.callAPI(method, path, bodyData);
    } catch (error: any) {
      // console.log("Post Error: ", error, JSON.stringify(error));
      // console.log("Post Attr Error: ", error.errorCode, error.message, error.statusCode)
      // // @ts-ignore
      // window.xxxPost = error;

      mergeBodyData({ gameState: { connectionStatus: ConnectionStatus.DISCONNECTED } });
      setIsLoading(false);
      throw error;
    }

    setIsLoading(false);

    const result = await mergeResponse(response);
    return result;
  };

  const openNotificationModal = () => {
    (document?.getElementById('notification-popup') as any)?.showModal();
  };

  const closeNotificationModal = () => {
    (document?.getElementById('notification-popup') as any)?.close();
    mergeBodyData({ message: ReplyMessageEnum.EMPTY });
  };

  const openConnectionErrorModal = () => {
    (document?.getElementById('connection-error-popup') as any)?.showModal();
  };

  const closeConnectionErrorModal = () => {
    (document?.getElementById('connection-error-popup') as any)?.close();
    mergeBodyData({ gameState: { connectionStatus: ConnectionStatus.CONNECTED } });
  };

  const handleApiMessage = (message: string) => {
    switch (message) {
      case ReplyMessageEnum.FULL_CHEST:
        openNotificationModal();
        break;
      case ReplyMessageEnum.USER_NOT_ENOUGH_MONEY:
        data.ref.message = message;
        setData({ ref: data.ref });
        openNotificationModal();
        break;
    }
  };

  const refresh = () => {
    setData({ ref: data.ref });
  };

  return (
    <ApiContext.Provider
      value={{
        getApi,
        postApi,
        serverTime: serverTime.current,
        data,
        chestSlots,
        isLoading,
        closeNotificationModal,
        openConnectionErrorModal,
        closeConnectionErrorModal,
        mergeBodyData,
        processMessage,
        refresh,
      }}
    >
      {children}

      {isLoading && (
        <div className="loading-container">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      )}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useContext must be used within a ApiProvider');
  }
  return context;
};
