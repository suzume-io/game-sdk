import { SVGImage } from '@app/components';
import avatarImage from '@res/img/avatar.png?base64';
import pSZMImage from '@res/svg/pSZM.svg?raw';

import styles from './styles.module.scss';
import Locator from '@services/locator';
import { useApi } from '@app/api';

export const InvitesQuestTab = () => {
  const language = 'en';

  const { data } = useApi();
  const { gameDesign, gameAsset, referralConnections } = data.ref;

  const openShareDialog = () => {
    const url = gameDesign.data.general.BOT_CHANNEL_URL || 't.me/solitaire_szm_bot';
    let text = gameDesign.data.text['share.text']['en'] || 'You are invited';

    const user = data.ref.userProfile?.initData?.user;
    let username = user.username;
    if (!username) {
      username = [user.first_name, user.last_name].filter((it) => !!it).join(' ');
      if (!username) {
        username = user.id;
      }
    }
    text = text.replace(new RegExp('\\{username\\}', 'g'), user ? user.username : '');

    Locator.mainEventBus.emit(
      'window',
      undefined,
      JSON.stringify({
        cmd: 'share',
        data: {
          url,
          text,
          code: gameAsset.referralCode,
        },
      })
    );
  };

  return (
    <div role="tabpanel" className={['tab-content block', styles['scroll-view-container']].join(' ')}>
      <div className={['card', styles['quest-item']].join(' ')}>
        <div className={[styles['quest-item-title']].join(' ')}>
          <h6 className="text-md font-semibold text-neutral-700">Invite Friends for Bonuses</h6>
        </div>
        <div className={[styles['quest-item-content']].join(' ')}>
          <div className={[styles['left-content']].join(' ')}>
            <SVGImage src={pSZMImage} width={45} height={45} />
          </div>
          <div className={[styles['right-content']].join(' ')}>
            <h6 className="text-md font-semibold text-neutral-700">Invite a friend</h6>
            <div className={[styles['description']].join(' ')}>
              <SVGImage src={pSZMImage} width={20} height={20} />
              <span className="ml-1">
                <b>+100</b> for you and friend
              </span>
            </div>
          </div>
        </div>
        <div className={[styles['action-area']].join(' ')} onClick={openShareDialog}>
          <button>Invite</button>
        </div>
      </div>

      <div className={['card', 'mt-5', styles['quest-item']].join(' ')}>
        <div className={[styles['friend-list-title']].join(' ')}>
          <h1 className="text-xl font-semibold text-neutral-700">Recent Invites</h1>
        </div>
        <div className={[styles['friend-list-content']].join(' ')}>
          {referralConnections.data?.map((connection) => (
            <div className={[styles['friend-item']].join(' ')}>
              <img
                src={connection.userAvatar || avatarImage}
                alt={connection.userName}
                width={30}
                height={30}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = avatarImage;
                }}
              />
              <label>{connection.label}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
