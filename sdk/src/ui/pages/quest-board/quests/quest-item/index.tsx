import styles from './styles.module.scss';
import { QuestStatusEnum } from '@app/api/models/game-quest-collection';
import GameDesign from '@app/api/models/game-design';
import { RewardIcon, SVGImage } from '@app/components';
import xImage from '@res/svg/x.svg?raw';
import { useQuestAnimation } from '@app/providers/questAnimation';

export type DailyQuestLineItem = {
  id: string;
  tab: string;
  title: string;
  progress: number;
  claimable: boolean,
  total: number;
  rewards: Record<string, number | number[]>;
  status: number;
};

export const QuestItem = (props: { item: DailyQuestLineItem; gameDesign: GameDesign, onClaimButton: (item: DailyQuestLineItem) => void, onSocialRedirect: (item: DailyQuestLineItem, redirectUrl: string) => void, refCallback: (element: HTMLDivElement | null) => void }) => {
  const { item, gameDesign, onClaimButton, onSocialRedirect, refCallback } = props;
  const { showFlyingMedalAnimation } = useQuestAnimation();

  return (
    <div className={["card", styles["quest-item"]].join(" ")}>
      {/* QUEST TITLE */}
      <div className={[styles["quest-item-title"]].join(" ")}>
        <label>{item.title}</label>
      </div>
      {/* QUEST PROGESS */}
      <div className={[styles["quest-item-progress"]].join(" ")}>
        {item.tab != "achievement" && (
          <>
            <progress className="progress progress-info w-100" value={item.progress} max={item.total}></progress>
            <span className={[styles['counter']].join(' ')}>
              {Math.min(item.total, item.progress)}/{item.total}
            </span>
          </>
        )}
      </div>
      {item.status === QuestStatusEnum.DONE && !item.claimable && (
        <div className={[styles["quest-item-error"]].join(" ")}>
          <span>Require at least 1 empty chest slot to claim</span>
        </div>
      )}
      <div className={[styles["quest-item-info-n-actions"]].join(" ")}>
        <div className={[styles["info"]].join(" ")}>
          {Object.entries(item.rewards).map(([key, value]) => {
            return (
              <div key={key} className={["indicator", styles["info-indicator"]].join(" ")}>
                <div className={["indicator-item indicator-bottom", styles["info-indicator-bottom"]].join(" ")}>
                  <span>{Array.isArray(value) ? `${value[0]} - ${value[1]}` : `x${value}`}</span>
                </div>
                <div className={[styles["icon-container"]].join(" ")}>
                  <RewardIcon id={key} gameDesign={gameDesign} width={25} height={25} />
                </div>
              </div>
            );
          })}
        </div>
        {/* CLAIM BUTTON */}
        {item.status === QuestStatusEnum.DONE && (
          <div className={[styles["action"]].join(" ")} ref={refCallback}>
            <button 
              className={["btn", !item.claimable ? styles["disabled"] : ""].join(" ")} 
              onClick={() => {if (item.claimable) {
                onClaimButton(item); 
                item.rewards?.medal && showFlyingMedalAnimation(item.id);
              }}}
            >
              Claim
            </button>
          </div>
        )}

        {item.status === QuestStatusEnum.CLAIMED && (
          <div className={[styles["action"]].join(" ")}>
            <p className="text-neutral-300">Claimed</p>
          </div>
        )}
      </div>
    </div>
  );
};
