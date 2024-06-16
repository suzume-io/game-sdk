import { AssetsSDK, createApi, createSender, importKey } from "@ton-community/assets-sdk";
import { toNano } from "@ton/core";
import { MyS3Storage, MyS3StorageParams } from "./@types/s3-storage";

export async function mintJetton(storageParams: MyS3StorageParams) {
  const NETWORK = process.env.STAGE == 'dev' ? "testnet" : "mainnet";
  const api = await createApi(NETWORK);

  const keyPair = await importKey(process.env.MNEMONICS!);
  // There are multiple versions of wallet on TON.
  // The same MNEMONICS can generate different wallet addresses under different versions
  // Make sure your wallet is highload-v2 to use the SDK
  // Ref: https://docs.ton.org/participate/wallets/contracts
  const sender = await createSender("highload-v2", keyPair, api);

  const storage: MyS3Storage = new MyS3Storage(storageParams.accessKeyId, storageParams.secretAccessKey, storageParams.bucket, storageParams.region);

  console.log('Storage config: ', storage)

  const sdk = AssetsSDK.create({
    api: api,
    storage: storage,
    sender: sender,
  });

  console.log("Using wallet", sdk.sender?.address);

  const jetton = await sdk.deployJetton(
    {
      name: "Test jetton v-1",
      decimals: 9,
      description: "Test jetton",
      symbol: "TEST",
    },
    {
      adminAddress: sdk.sender?.address!,
      premintAmount: toNano("100"),
    }
  );

  console.log("Created jetton with address", jetton.address);
  // Created jetton with address EQASffw86sCi1-BvsoxqkNQPddR4nzRagrbzHq4kJr0LnYBp
  // Created jetton with address EQAGuyq91l8fBpvthZt1Q0LdxkYZZ3xLuFKW0qUOXGxXjd93
  return jetton;
}

// mintJetton().catch(console.error);
