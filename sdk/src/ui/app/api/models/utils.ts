import GameAsset from './game-asset';
import GameChestCollection, { ChestStatusForViewEnum, GameChestDataViewType } from './game-chest-collection';
import GameDesign from './game-design';
import GameQuestCollection, { QuestRecurringEnum, QuestStatusEnum } from './game-quest-collection';
import GameState from './game-state';
import NftCollection, { NftCollectionModelType } from './nft-collection';
import NftOwnership from './nft-ownership';
import ReferralConnectionCollection from './referral-connection-collection';
import UserAsset from './user-asset';
import UserProfile from './user-profile';

export type ApiData = {  
  isShow: boolean;
  gameDesign: GameDesign;
  userProfile: UserProfile;
  userAsset: UserAsset;
  gameAsset: GameAsset;
  gameQuests: GameQuestCollection;
  gameChests: GameChestCollection;
  gameState: GameState;

  nftCollections: NftCollection,
  nftOwnerships: NftOwnership,

  selectedNftCollection: NftCollectionModelType | undefined,

  referralConnections: ReferralConnectionCollection;
  rewards: any;
  message: string;
};

export function mergeValue(value: any, original: any): any {
  if (value === null || value === undefined) {
    return original;
  }

  return value;
}

export const shouldShowRedDot = (data: ApiData) => {
  const { gameDesign, gameChests, gameQuests } = data;

  let hasChestToOpen = false;
  for (const chest of gameChests.slots) {    
    if (!chest) {
      continue;
    }
    const chestDesign = gameDesign.data.chest[chest.chestType];
    if (!chestDesign) {
      continue;
    }
    if (chest.status === ChestStatusForViewEnum.AVAILABLE_COUNTDOWN && chest.openElapsed >= chestDesign.openTime) {
      hasChestToOpen = true;
      break;
    }
  }

  if (!hasChestToOpen) {
    let availableChest = 0;
    let chestBeingOpened = 0;
    for (const chest of gameChests.slots) {
      if (!chest) {
        continue;
      }
      if (chest.status === ChestStatusForViewEnum.AVAILABLE_UNLOCK) {
        availableChest += 1;
      } else if (chest.status === ChestStatusForViewEnum.AVAILABLE_COUNTDOWN) {
        chestBeingOpened += 1;
      }
    }

    if (availableChest > 0 && chestBeingOpened === 0) {
      hasChestToOpen = true;
    }
  }

  let hasQuestToClaim = false;
  console.log('quest data', gameQuests.data)
  for (const [key, quest] of Object.entries(gameQuests.data)) {
    const questDesign = gameDesign.data.quest[quest.questId];
    if (!questDesign || !questDesign.length || !questDesign[0].enabled) {
      continue;
    }

    if (quest.layer < questDesign.length && quest.status === QuestStatusEnum.DONE) {
      hasQuestToClaim = true;
      break;
    }
  }

  let hasSocialQuestToDo = false;
  for (const [questId, questDesign] of Object.entries(gameDesign.data.quest)) {
    if (!questDesign || !questDesign.length || !questDesign[0].enabled) {
      continue;
    }

    if (questDesign[0].recurring === QuestRecurringEnum.SOCIAL) {
      const questModel = gameQuests.data[questId];
      if (!questModel || (questModel.status === QuestStatusEnum.GOING && questModel.layer < questDesign.length)) {        
        hasSocialQuestToDo = true;
        break;
      }
    }
  }

  console.log('hasChestToOpen', hasChestToOpen)
  console.log('hasQuestToClaim', hasQuestToClaim)
  console.log('hasSocialQuestToDo', hasSocialQuestToDo)

  return hasChestToOpen || hasQuestToClaim || hasSocialQuestToDo;
};
