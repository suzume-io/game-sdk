import { ApiContextValues, ReplyMessageEnum, useApi } from '@app/api';
import { QuestStatusEnum } from '@app/api/models/game-quest-collection';
import ServerTime from '@app/api/server-time';
import { useEffect, useState } from 'react';
import { ApiData } from '@app/api/models/utils';

import { AchivementQuestItem, AchievementQuestLineItem } from './quest-item';
import styles from './styles.module.scss';
import { ChestStatusForViewEnum, GameChestDataViewType } from '@app/api/models/game-chest-collection';
import { useQuestAnimation } from '@app/providers/questAnimation';
import { useTour } from '@reactour/tour';
import Locator from '@services/locator';

function getStartOfDay(timestamp: number) {
  // Create a new Date object using the timestamp
  const date = new Date(timestamp);

  // Set the time to midnight (00:00:00)
  date.setUTCHours(0);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);

  // Convert the date back to milliseconds
  return date.getTime();
}

function getStartOfMonday(timestamp: number) {
  // Create a new Date object using the timestamp
  const date = new Date(timestamp);

  // Calculate the difference between the current day and Monday
  const diff = (date.getDay() + 6) % 7; // +6 to make Sunday (0) the last day of the week

  // Adjust the date to Monday
  date.setDate(date.getDate() - diff);

  // Set the time to midnight (00:00:00)
  date.setUTCHours(0);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);

  // Convert the date back to milliseconds
  return date.getTime();
}

export const AchivementQuestTab = () => {
  const language = 'en';

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
  const { gameDesign, gameQuests } = data.ref;

  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<AchievementQuestLineItem | undefined>(undefined);
  const [lineItems, setLineItems] = useState<AchievementQuestLineItem[]>([]);
  const { questRefs } = useQuestAnimation();
  const { setIsOpen } = useTour();
  // Start questboard ftue
  // FIXME: to be verified: only trigger for first time users
  useEffect(() => {
    const welcomeGift = data?.ref?.gameQuests?.data?.welcome_gift
    const isWelcomeGiftClaimed = welcomeGift?.layer && welcomeGift?.layer > 0;
    console.log("welcomeGift", welcomeGift);
    if (lineItems.length > 0 && !isWelcomeGiftClaimed) {
      setTimeout(() => setIsOpen(true), 500)
    }
  }, [data?.ref?.gameQuests?.data?.welcome_gift, lineItems, setIsOpen]);

  useEffect(() => {
    const lines: AchievementQuestLineItem[] = [];

    const serverNow = serverTime.getTime();

    for (const [id, info] of Object.entries(gameDesign.data.quest)) {
      if (!info || info.length === 0 || !info[0].enabled) {
        continue;
      }

      let data = gameQuests.find(id);
      if (!data) {
        data = {
          count: 0,
          layer: 0,
          status: QuestStatusEnum.GOING,
          questId: id,
          updatedAt: serverNow,
        };
      }

      if (!info || info.length === 0) {
        continue;
      }

      if (info[0].tab === 'achievement' && info[0].enabled) {
        let progress = data.count ||  0;
        let layer = data.layer;
        let status = data.status;
        let text = gameDesign.data.text?.[`quest.title.${id}`]?.[language] || `quest.title.${id}`;
        //FIXME: To be verified: sometimes the chestSlots contain 4 empty slots. chest.status == ChestStatusForViewEnum.EMPTY is newly added. Need to check whether it's okay
        let isFullChest = !chestSlots.some((chest) => {
          return chest.status == ChestStatusForViewEnum.NEXT_CHEST || chest.status == ChestStatusForViewEnum.EMPTY;
        })
        let medalRewards = 0;

        try {
          medalRewards = parseFloat(info?.[layer]?.rewards?.['medal'].toString() || '0');
        } catch (error) {
          // console.log('Cannot convert medals number: ', error)
          medalRewards = 0;
        }

        if (!info[layer]) {
          layer = info.length - 1;
          status = QuestStatusEnum.CLAIMED;
          progress = info[layer].amount;
        } else {
          if (progress < info[layer].initial) {
            progress = info[layer].initial;
          }
          if (progress >= info[layer].amount) {
            status = QuestStatusEnum.DONE;
          }
        }

        lines.push({
          id,
          progress,
          status,
          claimable: !isFullChest || medalRewards <= 0,
          title: text,
          tab: info[layer].tab,
          total: info[layer].amount,
          rewards: info[layer].rewards,
          scheme: info[layer].scheme,
          schemeLink: info[layer].schemeLink,
          schemeTarget: info[layer].schemeTarget,
        });
      }
    }

    setLineItems(lines);

    if (
      data.ref.message == ReplyMessageEnum.TELEGRAM_NOT_FOUND ||
      data.ref.message == ReplyMessageEnum.TELEGRAM_NOT_FOUND_API_FAIL
    ) {
      setRedirectUrl(selectedItem?.schemeLink || '');
      setSelectedItem(undefined);
      (document?.getElementById('confirm_redirect') as any)?.showModal();

      data.ref.message = '';
      refresh();
    }
  }, [data]);

  const onClaimButton = (item: AchievementQuestLineItem) => {
    setSelectedItem(item);
    // console.log('data.ref.userProfile?.initData?.user?.id: ', data.ref.userProfile?.initData?.user?.id)
    postApi(`daily-quest/${item.id}`, 'POST', { teleUserId: data.ref.userProfile?.initData?.user?.id });
  };

  const onSocialRedirect = (item: AchievementQuestLineItem, redirectUrl: string) => {
    console.log('redirectUrl: ', redirectUrl, item);
    setRedirectUrl(redirectUrl);
    setSelectedItem(item);
    (document?.getElementById('confirm_redirect') as any)?.showModal();

    data.ref.message = '';
    refresh();
  };

  const closeModal = () => {
    (document?.getElementById('confirm_redirect') as any)?.close();
  };

  const redirectHandler = () => {
    const telegramClient = (window as any).telegramClient;
    if (telegramClient) {
      telegramClient.openTelegramLink(redirectUrl);
    } else {
      window.open(redirectUrl, '_blank');
    }
    selectedItem && postApi(`daily-quest/${selectedItem.id}`, 'PUT', { count: 1 });
    closeModal();
  };

  return (
    <div role="tabpanel" className={['tab-content block', styles['scroll-view-container']].join(' ')}>
      <div className={[styles['scroll-view']].join(' ')}>
        {lineItems.map((line) => (
          <AchivementQuestItem
            key={line.id}
            item={line}
            onClaimButton={onClaimButton}
            gameDesign={gameDesign}
            onSocialRedirect={onSocialRedirect}
            refCallback={(element: HTMLDivElement | null) => {questRefs.current[line.id] = element}}
          />
        ))}
      </div>

      <dialog id="confirm_redirect" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <span className="py-4">
            {(data.ref.message == ReplyMessageEnum.TELEGRAM_NOT_FOUND ||
              data.ref.message == ReplyMessageEnum.TELEGRAM_NOT_FOUND_API_FAIL) && (
              <p>Please join social group before claiming.</p>
            )}
            <h1 className="py-2 font-bold text-md text-neutral-500">Are you sure to go to the following Link?</h1>
            <a className="py-2 text-cyan-600" href={redirectUrl} target="_blank">
              {redirectUrl}
            </a>
          </span>
          <div className={['modal-action', styles['modal-bottom']].join(' ')}>
            <button className={[styles['cancel-btn']].join(' ')} onClick={closeModal}>
              Cancel
            </button>
            <button className={['mr-1', styles['go-btn']].join(' ')} onClick={redirectHandler}>
              Go
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};
