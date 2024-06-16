import {
  AssetsSDK,
  createApi,
  createSender,
  importKey,
  NftContent,
} from "@ton-community/assets-sdk";

import { MyS3Storage, MyS3StorageParams } from "./@types/s3-storage";
import { NftCollectionModel, NftCollectionModelType, NftStatus } from "../user-api/model/nft-collection";

export async function mintNftCollection(storageParams: MyS3StorageParams, nftCollection: NftCollectionModelType, callback: Function) {
  const NETWORK = process.env.STAGE == 'dev' ? "testnet" : "mainnet";
  const api = await createApi(NETWORK);

  console.log('mintNftCollection 0: ', NETWORK, process.env.MNEMONICS)

  const keyPair = await importKey(process.env.MNEMONICS!);
  // There are multiple versions of wallet on TON.
  // The same MNEMONICS can generate different wallet addresses under different versions
  // Make sure your wallet is highload-v2 to use the SDK
  // Ref: https://docs.ton.org/participate/wallets/contracts
  const sender = await createSender("highload-v2", keyPair, api);

  if (!keyPair) {
    throw new Error('Keypair is not exist')
  }

  const storage: MyS3Storage = new MyS3Storage(storageParams.accessKeyId, storageParams.secretAccessKey, storageParams.bucket, storageParams.region);

  const sdk = AssetsSDK.create({
    api: api,
    storage: storage,
    sender: sender,
  });

  console.log("Using wallet", sdk.sender?.address);

  const adminAddress = sdk.sender?.address;

  // NFT metadata explanation:
  // https://docs.ton.org/develop/dapps/tutorials/collection-minting#references
  const collection = await sdk.deployNftCollection(
    {
      collectionContent: nftCollection.metadata as any,
      commonContent: "",
    },
    {
      adminAddress: adminAddress,
    }
  );

  console.log("NFT contract deployed: ", collection.address);

  // nftCollection.on_chain_address = collection.address.toString();
  // nftCollection.status = NftStatus.ON_CHAIN;
  // nftCollection.updated_at = Date.now();
  // await NftCollectionModel.update(nftCollection.id, nftCollection.collection_handle, nftCollection)
  callback?.()

  return collection;
}
