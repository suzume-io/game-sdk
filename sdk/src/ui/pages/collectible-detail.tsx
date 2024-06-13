import { useNavigate } from 'react-router-dom';
import { useApi } from "@app/api";
import {
  CollectionDetailHeader,
  CollectionDetailList,
} from "@app/components/collection-detail";
import { useEffect, useState } from "react";
import styles from './vault-styles.module.scss';
import { SVGImage } from '@app/components';
import gemImage from '@res/svg/gem.svg?raw';
import pSZMImage from '@res/svg/pSZM.svg?raw';
import avatarImage from '@res/img/avatar.png?base64';
import { NftOwnershipModelType } from "@app/api/models/nft-ownership";

// TODO: Remote if have the new generation method
const API_KEY = '5twtxLaosDF7sYJ8U5ltDDtxr8F74KPrXYC0YhNiYKAAvYiyqKT8ceJKp0zNVWkLQaYV7NnVR783CAQ2jGA5tzR1LZBxWg1Z97I7nn8SNvcXLyXyvk0f0sNgA1enwZlS'

const CollectionPage = (props: any) => {
  const navigate = useNavigate();
  const { mergeBodyData, data, postApi, getApi } = useApi();
  const [nftOwnerships, setNftOwnerships] = useState<NftOwnershipModelType[]>([])

  useEffect(() => {
    const { selectedNftCollection, nftOwnerships } = data.ref;
    if (selectedNftCollection && nftOwnerships.data) {
      let filter = Object.values(nftOwnerships.data).filter((item, idx) => {
        return item.ownershipId.indexOf(`${selectedNftCollection.id}:${selectedNftCollection.collectionHandle}:`) == 0;
      });

      setNftOwnerships(filter);
    }
  }, [data])

  console.log('collectionId');
  return (
    <div id="vault" style={{ backgroundColor: "#ffffff" }} className={[styles["vault-container"]].join(" ")}>
      <div className={["navbar min-h-14 bg-base-100", styles["navbar"]].join(" ")}>
        <div className="navbar-start">
          <div
            className={[styles["user-profile-area"]].join(" ")}
            onClick={() => {
              navigate('/quest-board');
            }}
          >
            <img src={data.ref.userProfile?.initData?.user?.photo_url || avatarImage} alt="Avatar" width={30} height={30} />
            <label className={[styles["username"]].join(" ")}>
              {/* {data.ref.userProfile?.initData?.user?.username ||
                data.ref.userProfile?.initData?.user?.id} */}
            </label>
          </div>
        </div>
        <div className="navbar-end">
          <div className={[styles["asset-area"]].join(" ")}>
            <div className={[styles["gem-area"]].join(" ")}>
              <SVGImage src={gemImage} width={20} height={20} />
              <label className="text-l">{/* {Math.ceil((data.ref.userAsset.gem || 0) * 10) / 10} */}</label>
            </div>
            <div className={[styles["pszm-area"]].join(" ")}>
              <SVGImage src={pSZMImage} width={20} height={20} />
              <label className="text-l">{/* {Math.ceil((data.ref.userAsset.pSZM || 0) * 10) / 10} */}</label>
            </div>
          </div>
        </div>
      </div>

      <CollectionDetailHeader
        name={(data?.ref?.selectedNftCollection?.metadata as any)?.title || "name"}
        img={data?.ref?.selectedNftCollection?.imageURL || avatarImage}
        amount={(data?.ref?.selectedNftCollection?.count) || 0}
      />
      <div className="m-4">
        <h1 className="text-2xl text-neutral-600 font-semibold">Items</h1>
      </div>

      <CollectionDetailList items={nftOwnerships} />

      <div className="fixed bottom-4 left-4">
        <button
          className="btn btn-circle bg-[#1CB0F6] text-white py-2.5 px-2.5 shadow-lg border-none"
          onClick={() => {
            mergeBodyData({ selectedNftCollection: undefined });
            navigate('/vault');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="48"
              d="M244 400L100 256l144-144M120 256h292"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CollectionPage;
