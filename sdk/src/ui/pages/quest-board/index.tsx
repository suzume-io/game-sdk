import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ReplyMessageEnum, useApi } from '@app/api';
import { GameDesignQuestTabEnum } from '@app/api/models/game-design';
import { QuestRecurringEnum, QuestStatusEnum } from '@app/api/models/game-quest-collection';
import { ClaimChestArea, SVGImage } from '@app/components';
import { useLocalization } from '@app/providers/localization';
import avatarImage from '@res/img/avatar.png?base64';
import gemPngImage from '@res/img/gem.png?base64';
import pSZMPngImage from '@res/img/pSZM.png?base64';
import cardChestImage from '@res/svg/card-chest.svg?raw';
import closeImage from '@res/svg/close.svg?raw';
import gemImage from '@res/svg/gem.svg?raw';
import homeImage from '@res/svg/home.svg?raw';
import pSZMImage from '@res/svg/pSZM.svg?raw';
import walletImage from '@res/svg/wallet.svg?raw';
import { useEffect, useMemo, useState } from 'react';

import Locator from '@services/locator';

import styles from './styles.module.scss';
import { ConnectionStatus } from '@app/api/models/game-state';
import { QuestAnimationProvider } from '@app/providers/questAnimation';
import QuestFlyingMedals from '@app/components/flying-medals';
import { TourProvider, useTour } from '@reactour/tour';
import { steps, style, popoverPadding } from '@app/common/tour';

const DEBUG = true;

const CloseQuestBoardButton = (props: any) => {
  const { closeQuestBoard } = props;
  const {isOpen, setIsOpen} = useTour();

  return <div className={[styles['close-btn-area'], 'close-button-tour'].join(' ')}>
  <button
    className={[styles['close-btn']].join(' ')}
    onClick={() => {
      if (isOpen) {
        setIsOpen(false);
      }
      closeQuestBoard();
    }}
  ></button>
</div>
}

const QuestBoardPage = (props: any) => {
  const navigate = useNavigate();
  const {
    data,
    refresh,
    serverTime,
    getApi,
    postApi,
    chestSlots,
    closeNotificationModal,
    openConnectionErrorModal,
    closeConnectionErrorModal,
    mergeBodyData,
    processMessage,
  } = useApi();

  const { translate, changeLocale, locale } = useLocalization();
  const [tabIndicators, setTabIndicators] = useState<Record<string, boolean>>({});

  if (DEBUG) {
    (window as any).qbDebug = function (msg: any) {
      processMessage(msg);
    };
  }

  const close = () => {
    data.ref.isShow = false;
    refresh();
    setTimeout(() => {
      Locator.mainEventBus.emit('window', undefined, JSON.stringify({ cmd: 'close' }));
    }, 500);
  };

  useEffect(() => {
    let { gameDesign, gameQuests } = data.ref;
    if (!!gameQuests?.data && !!gameDesign?.data?.quest) {
      let tabIndicatorsValue: Record<string, boolean> = {};

      for (const [questId, questConfig] of Object.entries(gameDesign.data.quest)) {
        const questData = gameQuests.data[questId];
        const isQuestAvailable = questConfig && questConfig.length > 0 && questConfig[0].enabled;
        if (isQuestAvailable) {
          const isInAchievementTab = questConfig[0].tab == 'achievement';
          if (isInAchievementTab) {            
            const isSocialQuest = questConfig[0].recurring == QuestRecurringEnum.SOCIAL;
            const isWaitingToClaimQuest =
              questData && questData?.status == QuestStatusEnum.DONE && questData.layer < questConfig.length;
            const isAutoClaimable = (!questData || questData.layer < questConfig.length) && questConfig[0].initial >= questConfig[0].amount;
            if (isSocialQuest) {
              const isOnGoingQuest =
                questData && questData?.status == QuestStatusEnum.GOING && questData.layer < questConfig.length;

              // When quest belong to "achievement" and quest is initialized (value = null -> new user, value.status = GOING), only apply to quest has schema
              if (isOnGoingQuest || isWaitingToClaimQuest) {
                tabIndicatorsValue[questConfig[0].tab] = true;
              }
            } else if (isWaitingToClaimQuest || isAutoClaimable) {
                tabIndicatorsValue[questConfig[0].tab] = true;              
            }
          }
        }
      }
      setTabIndicators(tabIndicatorsValue);

      console.log('tabIndicatorsValue: ', tabIndicatorsValue);
    }

    if (data.ref.gameState.connectionStatus == ConnectionStatus.DISCONNECTED) {
      openConnectionErrorModal();
    }
  }, [data]);

  const userProfile = useMemo(() => {
    let avatarURL = avatarImage;
    let name = '';

    const user = data.ref.userProfile?.initData?.user;
    if (user) {
      if (user.photo_url) {
        avatarURL = user.photo_url;
      } else {
        // TODO: fix hard code
        avatarURL = `https://public-szm.s3.ap-southeast-1.amazonaws.com/avatars/${user.id}.jpg`;
      }

      if (user.first_name) {
        name = [user.first_name, user.last_name].filter((it) => !!it).join(' ');
      } else {
        name = user.username || String(user.id);
      }
    }

    return { name, avatarURL };
  }, [data]);

  return (
    <TourProvider
      steps={steps}
      showBadge={false}
      showDots={false}
      showCloseButton={false}
      showNavigation={false}
      showPrevNextButtons={false}
      onClickMask={() => {}}
      styles={style}
      padding={{ popover: popoverPadding + 10 }}
    >
      <QuestAnimationProvider>
        <div id="qb" className={[styles['qb-container'], data.ref.isShow ? 'show' : ''].join(' ')}>
          <div className={['navbar min-h-14 bg-base-100', styles['navbar']].join(' ')}>
            <div className="navbar-start">
              {/* <button className="btn btn-square btn-ghost"> onClick={close}> */}
              <div className={[styles['user-profile-area']].join(' ')}>
                {/* <SVGImage src={closeImage} width={40} height={40} /> */}
                <img
                  src={userProfile.avatarURL}
                  alt="Avatar"
                  width={30}
                  height={30}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = avatarImage;
                  }}
                />
                <label className={[styles['username']].join(' ')}>{userProfile.name}</label>
              </div>
            </div>
            <div className="navbar-end">
              <div className={[styles['asset-area']].join(' ')}>
                <div className={[styles['gem-area']].join(' ')}>
                  <SVGImage src={gemImage} width={20} height={20} />
                  <label className="text-l">{Math.floor(data.ref.userAsset.gem || 0)}</label>
                </div>
                <div className={[styles['pszm-area']].join(' ')}>
                  <SVGImage src={pSZMImage} width={20} height={20} />
                  <label className="text-l">{Math.floor(data.ref.userAsset.pSZM || 0)}</label>
                </div>
                <div
                  className={['pl-2'].join(' ')}
                  onClick={() => {
                    // TODO: Remove when merge to main branch
                    console.log('NAVIGATE TO VAULT PAGE');
                    navigate('/vault');
                  }}
                >
                  <SVGImage src={walletImage} width={25} height={40} />
                </div>
              </div>
            </div>
            <CloseQuestBoardButton closeQuestBoard={close} />
          </div>

          <div className={styles['body']}>
            <div className={[styles['claim-quests'], 'card bg-base-100'].join(' ')}>
              <div className={styles['quest-center-title']}>
                <div className={styles['quest-center-left-area']}>
                  <h4 className={styles['title']}>{translate('questboard.title')}</h4>
                  <span className={styles['description']}>{translate('questboard.description')}</span>
                </div>
                <div className={styles['quest-center-right-area']}>
                  <SVGImage src={cardChestImage} width={100} height={100} />
                </div>
              </div>

              <div role="tablist" className={['tabs tabs-bordered', styles['quest-tabs']].join(' ')}>
                {/* DAILY TAB */}
                <input
                  type="radio"
                  onClick={() => {
                    navigate('/quest-board/daily-quests');
                  }}
                  name="quests_tab"
                  role="tab"
                  className="tab text-neutral-400"
                  aria-label={translate('questboard.daily')}
                />

                {/* ACHIVEMENTS TAB */}
                <input
                  type="radio"
                  onClick={() => {
                    navigate('/quest-board/achievements');
                  }}
                  name="quests_tab"
                  role="tab"
                  className="tab text-neutral-400"
                  aria-label={translate('questboard.achivements')}
                />

                {/* INVITES TAB */}
                <input
                  type="radio"
                  onClick={() => {
                    navigate('/quest-board/invites');
                  }}
                  name="quests_tab"
                  role="tab"
                  className="tab text-neutral-400"
                  aria-label={translate('questboard.invites')}
                />

                {/* FEATURING TAB */}
                <input
                  type="radio"
                  onClick={() => navigate('/quest-board/features')}
                  name="quests_tab"
                  role="tab"
                  className="tab text-neutral-400"
                  aria-label={translate('questboard.featuring')}
                />

                <span
                  className={[
                    styles['indicator'],
                    tabIndicators[GameDesignQuestTabEnum.DAILY] ? styles['show'] : '',
                    styles['daily'],
                  ].join(' ')}
                ></span>
                <span
                  className={[
                    styles['indicator'],
                    tabIndicators[GameDesignQuestTabEnum.ACHIVEMENT] ? styles['show'] : '',
                    styles['achivement'],
                  ].join(' ')}
                ></span>
                <span
                  className={[
                    styles['indicator'],
                    tabIndicators[GameDesignQuestTabEnum.INVITES] ? styles['show'] : '',
                    styles['invites'],
                  ].join(' ')}
                ></span>
                <span
                  className={[
                    styles['indicator'],
                    tabIndicators[GameDesignQuestTabEnum.FEATURING] ? styles['show'] : '',
                    styles['featuring'],
                  ].join(' ')}
                ></span>

                <Outlet />
              </div>
            </div>

            <ClaimChestArea
              serverTime={serverTime}
              postApi={postApi}
              data={data}
              chestSlots={chestSlots}
              mergeBodyData={mergeBodyData}
            />
          </div>

          {/* <div className={["btm-nav", "bg-white", styles["bottom-nav"]].join(" ")}>
          <button className={styles[activeTab == "home" ? "active" : "non-active"]} onClick={() => setActiveTab("home")}>
            <SVGImage src={homeImage} width={25} height={25} />
            <span className={['btm-nav-label text-sm font-normal', styles['bottom-nav-label']].join(' ')}>
              {translate('questboard.home')}
            </span>
          </button>
          <button className={styles[activeTab == 'bag' ? 'active' : 'non-active']} onClick={() => setActiveTab('bag')}>
            <SVGImage src={walletImage} width={25} height={25} />
            <span className={['btm-nav-label text-sm font-normal', styles['bottom-nav-label']].join(' ')}>
              {translate('questboard.bag')}
            </span>
          </button>
        </div> */}

          <dialog id="notification-popup" className="modal modal-bottom sm:modal-middle">
            {/* <div className="modal-box">{!!selectedChest && <UnlockChestBodyPopup chest={selectedChest} />}</div> */}
            <div className="modal-box">
              <div className={[styles['modal-body']].join(' ')}>
                <h3 className="font-bold text-lg">Warning</h3>

                <div className={[styles['rewards-container']].join(' ')}>
                  {data.ref.message == ReplyMessageEnum.FULL_CHEST && (
                    <p>
                      Can’t claim any more medals as chest slots are full.
                      <br />
                      Try again after you open a chest.
                    </p>
                  )}
                  {data.ref.message == ReplyMessageEnum.USER_NOT_ENOUGH_MONEY && <p>Not enough.</p>}
                </div>
                <div className={['modal-action', styles['modal-bottom']].join(' ')}>
                  <button className={[styles['confirm-btn']].join(' ')} onClick={closeNotificationModal}>
                    Okay
                  </button>
                </div>
              </div>
            </div>
          </dialog>

          <dialog id="connection-error-popup" className="modal modal-bottom sm:modal-middle">
            {/* <div className="modal-box">{!!selectedChest && <UnlockChestBodyPopup chest={selectedChest} />}</div> */}
            <div className="modal-box">
              <div className={[styles['modal-body']].join(' ')}>
                <h3 className="font-bold text-lg">Warning</h3>

                <div className={[styles['rewards-container']].join(' ')}>
                  <p>Lost connection. Reconnecting ...</p>
                </div>
                <div className={['modal-action', styles['modal-bottom']].join(' ')}>
                  <button className={[styles['confirm-btn']].join(' ')} onClick={closeConnectionErrorModal}>
                    Okay
                  </button>
                </div>
              </div>
            </div>
          </dialog>
          <QuestFlyingMedals />
        </div>
      </QuestAnimationProvider>
    </TourProvider>
  );
};

export default QuestBoardPage;
