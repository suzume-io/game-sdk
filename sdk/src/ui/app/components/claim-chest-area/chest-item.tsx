import { useEffect, useMemo, useState } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import { ChestStatusEnum, ChestStatusForViewEnum, GameChestDataViewType, GameChestModelType } from '@app/api/models/game-chest-collection';
import GameDesign from '@app/api/models/game-design';
import ServerTime from '@app/api/server-time';
import { useLocalization } from '@app/providers/localization';
import { formatTimeCounterInMinute } from '@app/common/ultils';
import { ClaimChestButton, SVGImage } from '@app/components';

import timeImage from '@res/svg/time.svg?raw';
import chestImage from '@res/svg/common-chest.svg?raw';
import medalImage from '@res/svg/medal.svg?raw'
import gemImage from '@res/svg/gem.svg?raw'
import styles from './styles.module.scss';
import './progress-bar.css'
import { useTour } from '@reactour/tour';

export const ChestItem = (props: {
  // chest: GameChestModelType;
  // allChests: GameChestModelType[];
  onStartOpen: Function;
  onUnlockChest: Function;
  openModal: Function;
  gameDesign: GameDesign;
  // serverTime: ServerTime;
  chest: GameChestDataViewType;
  refCallback: (element: HTMLDivElement | null) => void;
}) => {
  // const { chest, allChests, serverTime, gameDesign, onStartOpen, onUnlockChest } = props;
  const { chest, gameDesign, onStartOpen, onUnlockChest, openModal, refCallback } = props;
  const { translate } = useLocalization();
  const { isOpen, setCurrentStep } = useTour();

  return (
    <div className={[styles['chest-btn-container']].join(' ')} ref={refCallback}>
      {
        chest.status == ChestStatusForViewEnum.AVAILABLE_COUNTDOWN && (
          <ClaimChestButton chestClassName="chest-btn-normal" title={formatTimeCounterInMinute(gameDesign.data.chest[chest.chestType].openTime)} titleIcon={timeImage} toolTipContent={translate('questboard.unlock')} onClick={async () => {openModal(chest); isOpen && await setCurrentStep(2)}}>
            <div className={styles["chest-image-container"]}>
              <SVGImage src={chestImage} height={40} width={40} />
            </div>
          </ClaimChestButton>
        )
      }

      {
        chest.status == ChestStatusForViewEnum.COUNTDOWN && (
          // TODO: Add gem required to unlock the chest immediately
          // - Dynamic Cost generate, for now, hard code get "gem"
          <ClaimChestButton chestClassName="chest-btn-unlocking" title={formatTimeCounterInMinute(Math.floor(chest.remainingTime / 1000))} titleIcon={timeImage} footerText={gameDesign?.data?.general?.CHEST_OPEN_NOW_COST["gem"] || '10'} footerIcon={gemImage} onClick={() => openModal(chest)}>
            <div className={styles["chest-image-container"]}>
              <SVGImage src={chestImage} height={40} width={40} />
            </div>
          </ClaimChestButton>
        )
      }

      {
        chest.status == ChestStatusForViewEnum.AVAILABLE_UNLOCK && (
          <ClaimChestButton chestClassName="chest-btn-open" title={translate('questboard.unlocked')} toolTipContent={translate('questboard.open')} onClick={() => onUnlockChest(chest)}>        
            <div className={styles["chest-image-container"]}>
              <SVGImage src={chestImage} height={40} width={40} />
            </div>
          </ClaimChestButton>
        )
      }

      {
        chest.status == ChestStatusForViewEnum.NEXT_CHEST && (
          <ClaimChestButton chestClassName="chest-btn-next" title={translate('questboard.next_chest')} footerText={`${chest.userMedal} / ${chest.nextChestMedal}`}>
            <div className={styles["progress-bar-container"]}>
              <CircularProgressbarWithChildren
                value={!!chest?.userMedal && !!chest?.nextChestMedal ? Math.floor((chest.userMedal * 100) / chest.nextChestMedal) : 0}
                strokeWidth={50}
                styles={buildStyles({
                  strokeLinecap: "butt",
                })}
              >
                <SVGImage src={medalImage} height={30} width={30} />
              </CircularProgressbarWithChildren>
            </div>
          </ClaimChestButton>
        )
      }
    </div>
  );
};
