import { QuestStatusEnum } from '@app/api/models/game-quest-collection';
import { useEffect, useState } from 'react';

import { useApi } from '@app/api';
import { ChestStatusForViewEnum } from '@app/api/models/game-chest-collection';
import Locator from '@services/locator';
import { DailyQuestLineItem, QuestItem } from './quest-item';
import styles from './styles.module.scss';
import { useQuestAnimation } from '@app/providers/questAnimation';

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

export const DailyQuestTab = () => {
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
  const { gameDesign, gameQuests, gameChests } = data.ref;

  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<DailyQuestLineItem | undefined>(undefined);
  const [lineItems, setLineItems] = useState<DailyQuestLineItem[]>([]);
  const { questRefs } = useQuestAnimation();
  useEffect(() => {
    const lines: DailyQuestLineItem[] = [];

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

      if (info[0].tab === 'daily' && info[0].enabled) {
        let progress = data.count;
        let layer = data.layer;
        let status = data.status;
        let isFullChest = !chestSlots.some((chest) => {
          return chest.status == ChestStatusForViewEnum.NEXT_CHEST || chest.status == ChestStatusForViewEnum.EMPTY;
        });
        let medalRewards = 0;

        const today = getStartOfDay(serverNow);
        const questAtDay = getStartOfDay(data.updatedAt);
        try {
          medalRewards = parseFloat(info?.[layer]?.rewards?.['medal'].toString() || '0');
        } catch (error) {
          // console.log('Cannot convert medals number: ', error)
          medalRewards = 0;
        }

        if (today !== questAtDay) {
          progress = 0;
          layer = 0;
          status = QuestStatusEnum.GOING;
        }

        if (!info[layer]) {
          layer = info.length - 1;
          status = QuestStatusEnum.CLAIMED;
          progress = info[layer].amount;
        }

        lines.push({
          id,
          progress,
          status,
          tab: info[layer].tab,
          claimable: !isFullChest || medalRewards <= 0,
          title: gameDesign.data.text[`quest.title.${id}`]?.[language] || `quest.title.${id}`,
          total: info[layer].amount,
          rewards: info[layer].rewards,
        });
      }
    }

    setLineItems(lines);
  }, [data]);

  const onClaimButton = async (item: DailyQuestLineItem) => {
    try {
      const result = await postApi(`daily-quest/${item.id}`, 'POST', {});
      if (result) {
        Locator.mainEventBus.emit(
          'window',
          undefined,
          JSON.stringify({
            cmd: 'tracking',
            data: {
              event: 'szm_complete_quest',
              params: {
                quest_id: item.id,
                rewards: result.rewards,
              },
            },
          })
        );
      }
    } catch (ex) {}
  };

  const onSocialRedirect = (item: DailyQuestLineItem, redirectUrl: string) => {
    console.log('redirectUrl: ', redirectUrl, item);
    setRedirectUrl(redirectUrl);
    setSelectedItem(item);
    (document?.getElementById('confirm_redirect') as any)?.showModal();
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
          <QuestItem
            key={line.id}
            item={line}
            onClaimButton={onClaimButton}
            gameDesign={gameDesign}
            onSocialRedirect={onSocialRedirect}
            refCallback={(element: HTMLDivElement | null) => {questRefs.current[line.id] = element}}
          />
        ))}
      </div>

      {/* <dialog id="confirm_redirect" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg"></h3>
          <p className="py-4 text-accent">Are you sure redirect to social channel?</p>
          <div className={["modal-action", styles["modal-bottom"]].join(" ")}>
            <button className="btn btn-success mr-1" onClick={redirectHandler}>Go</button>
            <button className="btn" onClick={closeModal}>Cancel</button>
          </div>
        </div>
      </dialog> */}
    </div>
  );
};
