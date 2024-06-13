import { mergeValue } from './utils';

export enum NftCollectionStatusEnum {
  EMPTY = 0,
  ACTIVE = 100,
}

export type NftCollectionModelType = {
  id: string;
  collectionHandle: string;
  metadata: string;
  imageURL: string;
  count: number;
  status: number;
  createdAt: number;
  updatedAt: number;
};

export default class NftCollection {
  public data: Record<string, NftCollectionModelType>;

  constructor() {
    this.data = {};
  }

  public mergeMany(nftCollections: Record<string, any>[]) {
    if (!Array.isArray(nftCollections)) {
      return;
    }

    nftCollections.forEach((nftCollection) => this.mergeOne(nftCollection));
  }

  public mergeOne(nftCollectionData: Record<string, any>) {
    if (!nftCollectionData || !nftCollectionData.collection_handle) {
      return;
    }
    let metadata = {} 
    
    try {
      metadata = JSON.parse(nftCollectionData.metadata)
    } catch(error) {
      metadata = nftCollectionData.metadata
    }
    const collectionHandle = nftCollectionData.collection_handle;
    if (!this.data[collectionHandle]) {
      this.data[collectionHandle] = {
        id: nftCollectionData.id,
        collectionHandle,
        metadata: nftCollectionData.metadata,
        imageURL: nftCollectionData.image_url,
        count: nftCollectionData.count,
        status: nftCollectionData.status,
        createdAt: nftCollectionData.created_at,
        updatedAt: nftCollectionData.updated_at
      };
    } else {
      const nftCollection = this.data[collectionHandle];
      nftCollection.metadata = mergeValue(nftCollectionData.metadata, nftCollection.metadata);
      nftCollection.imageURL = mergeValue(nftCollectionData.image_url, nftCollection.imageURL);
      nftCollection.count = mergeValue(nftCollectionData.count, nftCollection.count);
      nftCollection.status = mergeValue(nftCollectionData.status, nftCollection.status);
      nftCollection.createdAt = mergeValue(nftCollectionData.opened_at, nftCollection.createdAt);
      nftCollection.updatedAt = mergeValue(nftCollectionData.updated_at, nftCollection.updatedAt);
      nftCollection.id = mergeValue(nftCollectionData.id, nftCollection.id);
    }
  }
}
