import { ReplyMessageEnum } from '@app/api';
import { ChestStatusForViewEnum, GameChestDataViewType } from '@app/api/models/game-chest-collection';
import { ApiData } from '@app/api/models/utils';
import ServerTime from '@app/api/server-time';
import { formatTimeCounterInMinute } from '@app/common/ultils';
import { SVGImage } from '@app/components';
import chestImage from '@res/svg/common-chest.svg?raw';
import gemImage from '@res/svg/gem.svg?raw';
import medalImage from '@res/svg/medal.svg?raw';
import pSZMImage from '@res/svg/pSZM.svg?raw';
import timeImage from '@res/svg/time.svg?raw';
import { useEffect, useState } from 'react';

import { ChestItem } from './chest-item';
import styles from './styles.module.scss';
import Locator from '@services/locator';
import { useQuestAnimation } from '@app/providers/questAnimation';
import { useTour } from '@reactour/tour';

const ClaimChestArea = (props: {
  data: { ref: ApiData };
  serverTime: ServerTime;
  postApi: Function;
  mergeBodyData: Function;
  chestSlots: GameChestDataViewType[];
}) => {
  const { data, serverTime, postApi, mergeBodyData } = props;
  const { gameDesign, rewards } = props.data.ref;
  const [selectedChest, setSelectedChest] = useState<GameChestDataViewType>();
  const [localChestSlots, setLocalChestSlots] = useState<GameChestDataViewType[]>([]);
  const [isOpeningChest, setIsOpeningChest] = useState<boolean>(false);
  const [canOpenNow, setCanOpenNow] = useState(true);
  const { emptyChestRefs } = useQuestAnimation();
  const { isOpen, setCurrentStep } = useTour();

  useEffect(() => {
    if (data?.ref?.gameDesign?.data?.general?.CHEST_OPEN_NOW_COST) {
      let rs = true;
      Object.entries(data.ref.gameDesign.data.general.CHEST_OPEN_NOW_COST).forEach((entry, idx) => {
        let [key, value] = entry;

        try {
          value = parseFloat(value.toString());
        } catch (error) {
          console.log('ERR - Cannot parse CHEST_OPEN_NOW_COST: ', error);
          value = 0;
        }

        if (((data.ref.userAsset as any)[key] || 0) < value) {
          rs = false;
        }
      });

      setCanOpenNow(rs);
    }
  }, [data]);

  const onStartOpen = async (chest: GameChestDataViewType) => {
    setSelectedChest(chest);
    closeModal();

    const result = await postApi(`chest`, 'PUT', { chestId: chest.chestId });
    if (result) {
      Locator.mainEventBus.emit('window', undefined, JSON.stringify({
        cmd: 'tracking',
        data: {
          event: 'szm_unlock_chest',
          params: {
            chest_quality: chest.chestType,
            duration: gameDesign.data.chest[chest?.chestType]?.openTime,
          },
        },
      }));
    }
  };

  const normalizeRewardsForTracking = (rewards: any) => {
    if (rewards.user) {
      for (const [key, value] of Object.entries(rewards.user)) {
        rewards[key] = value;
      }
      delete rewards.user;
    }

    if (rewards.game) {
      for (const [key, value] of Object.entries(rewards.game)) {
        rewards[key] = value;
      }
      delete rewards.game;
    }

    return rewards;
  };

  const onUnlockChest = async (chest: GameChestDataViewType) => {
    const result = await postApi(`chest/claim`, 'POST', { chestId: chest.chestId });
    if (result) {
      Locator.mainEventBus.emit('window', undefined, JSON.stringify({
        cmd: 'tracking',
        data: {
          event: 'szm_open_chest',
          params: {
            chest_quality: chest.chestType,
            unlock_duration: Math.floor(chest.openElapsed / 1000),
            rewards: normalizeRewardsForTracking(result.rewards),
            is_paid_open: false,
            gem_spending: 0,
          },
        },
      }));

      openModal(chest);
    }
  };

  const onOpenNowChest = async (chest: GameChestDataViewType) => {
    const result = await postApi(`chest/open-chest`, 'PUT', { chestId: chest.chestId });
    if (result) {
      Locator.mainEventBus.emit('window', undefined, JSON.stringify({
        cmd: 'tracking',
        data: {
          event: 'szm_open_chest',
          params: {
            chest_quality: chest.chestType,
            unlock_duration: Math.floor(chest.openElapsed / 1000),
            rewards: normalizeRewardsForTracking(result.rewards),
            is_paid_open: true,
            gem_spending: result.cost,
          },
        },
      }));
    }

    closeModal();
  };

  // TODO: Open chest with gem ...
  // Description: Click to Locked chest, then the popup for open chest with gem is shown

  const UnlockChestBodyPopup = (props: { chest?: GameChestDataViewType }) => {
    const { chest } = props;

    return (
      <div className={[styles['modal-body'], 'unlock-chest-popup-tour'].join(' ')}>
        <h1 className="font-bold text-2xl text-neutral-700 mb-3">Unlock Chest?</h1>

        {!!chest?.chestType && (
          <div className={[styles['chest-title-area'], '-mb-1'].join(' ')}>
            <SVGImage src={timeImage} width={15} height={15} />
            <label className="roboto-medium">
              {formatTimeCounterInMinute(gameDesign.data.chest[chest?.chestType]?.openTime || 0)}
            </label>
          </div>
        )}
        <SVGImage src={chestImage} height={60} width={60} />
        <div className={['modal-action', styles['modal-bottom']].join(' ')}>
          <button className={[styles['cancel-btn']].join(' ')} onClick={async () => { await setTimeout(() => setCurrentStep(3), 1000); closeModal()}}>
            Cancel
          </button>
          <button className={[styles['unlock-btn']].join(' ')} onClick={async () => {onStartOpen(chest!); isOpen && await setTimeout(() => setCurrentStep(3), 1000)}}>
            Start Unlock
          </button>
        </div>
      </div>
    );
  };

  const RewardsBodyPopup = (props: { chest?: GameChestDataViewType }) => {
    const { chest } = props;

    return (
      <div className={[styles['modal-body']].join(' ')}>
        <h1 className="font-bold text-2xl text-neutral-700 mb-3">Rewards</h1>

        <div className={[styles['rewards-container']].join(' ')}>
          {!!rewards?.['pSZM'] && (
            <div className={[styles['rewards']].join(' ')}>
              <SVGImage src={pSZMImage} height={35} width={35} />
              <span>x{Math.floor(rewards?.['pSZM'])}</span>
            </div>
          )}
          {!!rewards?.['gem'] && (
            <div className={[styles['rewards']].join(' ')}>
              <SVGImage src={gemImage} width={35} height={35} />
              <span>x{Math.floor(rewards?.['gem'])}</span>
            </div>
          )}
          {!!rewards?.['medal'] && (
            <div className={[styles['rewards']].join(' ')}>
              <SVGImage src={medalImage} width={35} height={35} />
              <span>x{Math.floor(rewards?.['medal'])}</span>
            </div>
          )}
        </div>
        <div className={['modal-action', styles['modal-bottom']].join(' ')}>
          <button className={[styles['unlock-btn']].join(' ')} onClick={closeModal}>
            Okay
          </button>
        </div>
      </div>
    );
  };

  const UnlockChestWithGemBodyPopup = (props: { chest?: GameChestDataViewType; canOpenChestNow: boolean }) => {
    const { chest, canOpenChestNow = true } = props;
    const countdownTime =
      chest?.status == ChestStatusForViewEnum.COUNTDOWN
        ? Math.floor(chest.remainingTime / 1000)
        : (!!chest?.chestType && gameDesign.data.chest[chest?.chestType]?.openTime) || 0;

    return (
      <div className={[styles['modal-body']].join(' ')}>
        <h1 className="font-bold text-2xl text-neutral-700 mb-3">Open Now?</h1>

        {!!chest?.chestType && (
          <div className={styles['chest-title-area']}>
            <SVGImage src={timeImage} width={15} height={15} />
            <label className="roboto-medium">{formatTimeCounterInMinute(countdownTime)}</label>
          </div>
        )}
        <SVGImage src={chestImage} height={60} width={60} />
        <div>
          {!canOpenChestNow && (
            <div className={[styles['chest-item-error']].join(' ')}>
              <span>Insufficient gem balance</span>
            </div>
          )}
        </div>
        <div className={['modal-action', styles['modal-bottom']].join(' ')}>
          <button className={[styles['cancel-btn']].join(' ')} onClick={closeModal}>
            Cancel
          </button>
          <button
            className={[styles['open-btn'], canOpenChestNow ? '' : styles['disabled-btn']].join(' ')}
            onClick={() => {
              canOpenChestNow && onOpenNowChest(chest!);
            }}
          >
            Open
            <span>
              <SVGImage src={gemImage} width={12} height={15} />
              {gameDesign.data.general.CHEST_OPEN_NOW_COST['gem']}
            </span>
          </button>
        </div>
      </div>
    );
  };

  const openModal = (chest: GameChestDataViewType) => {
    setSelectedChest(chest);
    // console.log('chest: ', chest);
    (document?.getElementById('chest-confirm') as any)?.showModal();
  };

  const closeModal = () => {
    (document?.getElementById('chest-confirm') as any)?.close();
    selectedChest?.status == ChestStatusForViewEnum.AVAILABLE_UNLOCK && mergeBodyData({ rewards: {} });
  };

  useEffect(() => {
    if (selectedChest && props.data.ref.message == ReplyMessageEnum.OPEN_NOW) {
      selectedChest.status = ChestStatusForViewEnum.AVAILABLE_UNLOCK;
      mergeBodyData({ message: ReplyMessageEnum.EMPTY });
      openModal(selectedChest);
    }
  }, [props.data]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (data?.ref?.gameChests && data?.ref?.gameDesign) {
        let chestSlots = data.ref.gameChests.update(data, serverTime);

        let isOpening = chestSlots.some(
          (item) =>
            item.status == ChestStatusForViewEnum.COUNTDOWN || item.status == ChestStatusForViewEnum.AVAILABLE_UNLOCK
        );

        setLocalChestSlots(chestSlots.slice());

        setIsOpeningChest((preValue: boolean) => {
          if (isOpening !== preValue) {
            return isOpening;
          }
          return preValue;
        });
      }
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const findEmptyChestIndex = (chestIndex: number, allChests: GameChestDataViewType[] ) => {
    let count = 0;
    for (let i = 0; i < chestIndex; i++) {
      if ((Array.isArray(allChests) && allChests[i]?.status === ChestStatusForViewEnum.NEXT_CHEST)) {
        count++;
      }
    }
    return count;
  }

  return (
    <div className={[styles['claim-chests'], 'claim-chests-tour'].join(' ')}>
      {localChestSlots?.length > 0 ? (
        localChestSlots.map((chest, idx) => {
          return (
            <ChestItem
              key={idx}
              chest={chest}
              onStartOpen={onStartOpen}
              gameDesign={gameDesign}
              onUnlockChest={onUnlockChest}
              openModal={openModal}
              refCallback={(element: HTMLDivElement | null) => {if (chest.status === ChestStatusForViewEnum.NEXT_CHEST) {emptyChestRefs.current[findEmptyChestIndex(idx, localChestSlots)] = element}}}
            />
          );
        })
      ) : (
        <label className="text-center">
          <i>Empty chest</i>
        </label>
      )}

      <dialog id="chest-confirm" className="modal modal-bottom sm:modal-middle">
        {/* <div className="modal-box">{!!selectedChest && <UnlockChestBodyPopup chest={selectedChest} />}</div> */}
        <div className="modal-box">
          {selectedChest?.status == ChestStatusForViewEnum.AVAILABLE_COUNTDOWN &&
            (isOpeningChest ? (
              <UnlockChestWithGemBodyPopup chest={selectedChest} canOpenChestNow={canOpenNow} />
            ) : (
              <UnlockChestBodyPopup chest={selectedChest} />
            ))}
          {selectedChest?.status == ChestStatusForViewEnum.COUNTDOWN && (
            <UnlockChestWithGemBodyPopup chest={selectedChest} canOpenChestNow={canOpenNow} />
          )}
          {selectedChest?.status == ChestStatusForViewEnum.AVAILABLE_UNLOCK && (
            <RewardsBodyPopup chest={selectedChest} />
          )}
          {/* {selectedChest?.status == ChestStatusForViewEnum.NEXT_CHEST && (
            <>
              <button className={[styles["cancel-btn"]].join(" ")} onClick={closeModal}>
                Next Chest
              </button>
            </>
          )} */}
        </div>
      </dialog>
    </div>
  );
};

export default ClaimChestArea;
