import { mergeValue } from './utils';

export enum NftOwnershipStatusEnum {
  EMPTY = 0,
  ACTIVE = 100,
}

export type NftOwnershipModelType = {
  userId: string;
  ownershipId: string; // <game name>:<collection handle>:<NFT ID>
  imageURL: string;
  metadata: any;
  count: number;
  status: number;
  createdAt: number;
  updatedAt: number;
};

export default class NftOwnership {
  public data: Record<string, NftOwnershipModelType>;

  constructor() {
    this.data = {};
  }

  public mergeMany(nftOwnerships: Record<string, any>[]) {
    console.log('nftOwnerships: ', nftOwnerships)
    if (!Array.isArray(nftOwnerships)) {
      return;
    }

    nftOwnerships.forEach((nftOwnership) => this.mergeOne(nftOwnership));
  }

  public mergeOne(nftOwnershipData: Record<string, any>) {
    if (!nftOwnershipData || !nftOwnershipData.ownership_id) {
      return;
    }

    const ownershipId = nftOwnershipData.ownership_id;
    let metadata = {} 
    
    try {
      metadata = JSON.parse(nftOwnershipData.metadata)
    } catch(error) {
      metadata = nftOwnershipData.metadata
    }
    if (!this.data[ownershipId]) {
      this.data[ownershipId] = {
        userId: nftOwnershipData.user_id,
        ownershipId,
        imageURL: nftOwnershipData.image_url,
        metadata: metadata,
        count: nftOwnershipData.count,
        status: nftOwnershipData.status,
        createdAt: nftOwnershipData.created_at,
        updatedAt: nftOwnershipData.updated_at
      };
    } else {
      const nftOwnership = this.data[ownershipId];
      nftOwnership.imageURL = mergeValue(nftOwnershipData.image_url, nftOwnership.imageURL);
      nftOwnership.metadata = mergeValue(metadata, nftOwnership.metadata);
      nftOwnership.status = mergeValue(nftOwnershipData.status, nftOwnership.status);
      nftOwnership.createdAt = mergeValue(nftOwnershipData.opened_at, nftOwnership.createdAt);
      nftOwnership.updatedAt = mergeValue(nftOwnershipData.updated_at, nftOwnership.updatedAt);
      nftOwnership.userId = mergeValue(nftOwnershipData.user_id, nftOwnership.userId);
    }
  }
}
