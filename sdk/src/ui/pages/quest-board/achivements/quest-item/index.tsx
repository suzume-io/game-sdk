import { ReactElement } from 'react';

import styles from './styles.module.scss';
import { QuestStatusEnum } from '@app/api/models/game-quest-collection';
import GameDesign from '@app/api/models/game-design';
import { RewardIcon, SVGImage } from '@app/components';

import xImage from '@res/svg/x.svg?raw';
import telegramImage from '@res/svg/telegram.svg?raw';
import { useQuestAnimation } from '@app/providers/questAnimation';
import { useTour } from '@reactour/tour';

export type AchievementQuestLineItem = {
  id: string;
  title: string;
  tab: string;
  scheme: string;
  schemeTarget: string;
  schemeLink: string;
  progress: number;
  total: number;
  claimable: boolean;
  rewards: Record<string, number | number[]>;
  status: number;
};

export const AchivementQuestItem = (props: {
  item: AchievementQuestLineItem;
  gameDesign: GameDesign;
  onClaimButton: (item: AchievementQuestLineItem) => void;
  onSocialRedirect: (item: AchievementQuestLineItem, redirectUrl: string) => void;
  refCallback: (element: HTMLDivElement | null) => void
}) => {
  const { item, gameDesign, onClaimButton, onSocialRedirect, refCallback } = props;
  const { showFlyingMedalAnimation } = useQuestAnimation();
  const { isOpen, setCurrentStep } = useTour();

  const followIcons: Record<string, string> = {
    twitter: xImage,
    telegram: telegramImage,
  };

  const hasScheme = !!item.scheme;

  return (
    <div className={['card', styles['quest-item'], 'achievement-quest-tour'].join(' ')}>
      {/* QUEST TITLE */}
      <div className={[styles['quest-item-title']].join(' ')}>
        <label>{item.title}</label>
      </div>
      {/* QUEST PROGESS */}
      {/* TODO: pull social account from backend */}
      <div className={[styles['quest-item-progress']].join(' ')}>
        {item.tab != 'achievement' && (
          <progress className="progress progress-info w-100" value={item.progress} max={item.total}></progress>
        )}

        {hasScheme && (
          <label className={[styles['social-label']].join(' ')}>
            <SVGImage src={followIcons[item.scheme] || telegramImage} width={25} height={20} />
            <span className="ml-1">{item.schemeTarget}</span>
          </label>
        )}

        {!hasScheme && (
          <>
            <progress className="progress progress-info w-100" value={item.progress} max={item.total}></progress>
            {!!item.total && (
              <span className={[styles['counter']].join(' ')}>
                {`${Math.min(item.total, item.progress)}/${item.total}`}
              </span>
            )}
          </>
        )}
      </div>      
      <div className={[styles["quest-item-info-n-actions"]].join(" ")}>
        <div className={[styles["info"]].join(" ")}>
          {item.status === QuestStatusEnum.DONE && !item.claimable && (
            <div className={[styles["quest-item-error"]].join(" ")}>
              <span>Require at least 1 empty chest slot to claim</span>
            </div>
          )}
          {Object.entries(item.rewards).map(([key, value]) => {
            return (
              <div key={key} className={['indicator', styles['info-indicator']].join(' ')}>
                <div className={['indicator-item indicator-bottom', styles['info-indicator-bottom']].join(' ')}>
                  <span>{Array.isArray(value) ? `${value[0]} - ${value[1]}` : `x${value}`}</span>
                </div>
                <div className={[styles['icon-container']].join(' ')}>
                  <RewardIcon id={key} gameDesign={gameDesign} width={25} height={25} />
                </div>
              </div>
            );
          })}
        </div>
        {/* CLAIM BUTTON */}
        {item.status === QuestStatusEnum.GOING && hasScheme && (
          <div className={[styles['action']].join(' ')}>
            {/* TODO: Get URL from server or local */}
            <button className="btn" onClick={() => onSocialRedirect(item, item.schemeLink)}>
              Go
            </button>
          </div>
        )}
        {item.status === QuestStatusEnum.DONE && (
          <div className={[styles["action"]].join(" ")} ref={refCallback}>
            <button 
              className={["btn", !item.claimable ? styles["disabled"] : ""].join(" ")} 
              onClick={async () => {
                if (item.claimable) {
                  onClaimButton(item); 
                  item.rewards?.medal && showFlyingMedalAnimation(item.id);
                  isOpen && await setTimeout(() => setCurrentStep(1), 1000);
              }
            }}
            >
              Claim
            </button>
          </div>
        )}
        {item.status === QuestStatusEnum.CLAIMED && (
          <div className={[styles['action']].join(' ')}>
            <p className="text-neutral-300">Claimed</p>
          </div>
        )}
      </div>
    </div>
  );
};
