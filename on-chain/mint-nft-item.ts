import {
    AssetsSDK,
    createApi,
    createSender,
    importKey,
} from "@ton-community/assets-sdk";
import { Address } from "@ton/core";
import { NftCollectionModelType, NftStatus } from "../user-api/model/nft-collection";
import { NftOwnershipModel, NftOwnershipModelType } from "../user-api/model/nft-ownership";
import { MyS3Storage, MyS3StorageParams } from "./@types/s3-storage";

export async function mintNftItem(nftCollection: NftCollectionModelType, nftOwnership: NftOwnershipModelType, storageParams: MyS3StorageParams, callback: Function) {
  const NETWORK = process.env.STAGE == 'dev' ? "testnet" : "mainnet";
  const api = await createApi(NETWORK);
  const keyPair = await importKey(process.env.MNEMONICS!);
  const sender = await createSender("highload-v2", keyPair, api);

  if (!keyPair) {
    throw new Error('Keypair is not exist')
  }

  const storage: MyS3Storage = new MyS3Storage(storageParams.accessKeyId, storageParams.secretAccessKey, storageParams.bucket, storageParams.region);

  const sdk = AssetsSDK.create({
    api: api,
    sender: sender,
    storage: storage,
  });

  const collection = sdk.openNftCollection(Address.parse(nftCollection.on_chain_address));

  console.log("Minting NFT...");
  const { nextItemIndex: index } = await collection.getData();
  await collection.sendMint(sender, {
    index: index,
    owner: sdk.sender?.address!,
    individualContent: nftOwnership.metadata,
  });
  console.log("NFT minted");
  const nftItem = await collection.getItem(index);
  console.log("NFT Item address", nftItem.address);

  // nftOwnership.on_chain_address = nftItem.address.toString()
  // nftOwnership.status = NftStatus.ON_CHAIN;
  // nftOwnership.updated_at = Date.now();
  // await NftOwnershipModel.update(nftOwnership.user_id, nftOwnership.ownership_id, nftOwnership)
  callback?.(nftOwnership, nftItem.address.toString());

  return nftOwnership;
}
