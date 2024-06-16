//import {defer, Deferred} from "../utils";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import {Storage} from "./storage";
import { Storage } from "@ton-community/assets-sdk";

export interface MyS3StorageParams {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

export class MyS3Storage implements Storage {
  private readonly accessKeyId: string;

  private readonly secretAccessKey: string;

  private readonly bucket: string;

  private readonly region: string;

  //   private readonly s3: Deferred<S3> = defer(async () => {
  // console.log('Here')
  //     const s3 = await import("@aws-sdk/client-s3").then((m) => m.S3);
  //     return new s3({
  //       apiVersion: '2006-03-01',
  //       region: this.region,
  //       credentials: {
  //         accessKeyId: this.accessKeyId,
  //         secretAccessKey: this.secretAccessKey,
  //       },
  //     });
  //   });

  constructor(accessKeyId: string, secretAccessKey: string, bucket: string, region: string) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.bucket = bucket;
    this.region = region;
  }

  public static create(params: MyS3StorageParams) {
    return new MyS3Storage(params.accessKeyId, params.secretAccessKey, params.bucket, params.region);
  }

  async uploadFile(contents: Buffer): Promise<string> {
    //     const s3 = await this.s3();
    // console.log('uploadFile 1 ')
    //     const key = "jetton/" + Math.random().toString(36).substring(2);
    // console.log('uploadFile 2 ')
    //     await s3.putObject({
    //       Bucket: this.bucket,
    //       Key: key,
    //       Body: contents,
    //     });
    //     console.log('uploadFile 3 ')
    //     return "https://" + this.bucket + ".s3.amazonaws.com/" + key;
    console.log('Storage uploadFile ')
    const client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
    const key = "jetton/" + Math.random().toString(36).substring(2);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: contents,
    });

    try {
      const response = await client.send(command);
      console.log(response);
    } catch (err) {
      console.error(err);
    }
// console.log('Upload done: ', "https://" + this.bucket + ".s3.amazonaws.com/" + key)
//     return "https://" + this.bucket + ".s3.amazonaws.com/" + key;

    console.log('Upload done: ', `https://s3.${this.region}.amazonaws.com/${this.bucket}/${key}`)
    return `https://s3.${this.region}.amazonaws.com/${this.bucket}/${key}`
  }
}
