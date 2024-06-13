import { useApi } from '@app/api';
import { SVGImage } from '@app/components';
import { useEffect, useState } from 'react';

import gemImage from '@res/svg/gem.svg?raw';
import homeImage from "@res/svg/home.svg?raw";
import pSZMImage from '@res/svg/pSZM.svg?raw';
import walletImage from "@res/svg/wallet.svg?raw";
import avatarImage from '@res/img/avatar.png?base64';

import { QuestStatusEnum } from '@app/api/models/game-quest-collection';
import { CollectionList } from '@app/components/collection-list';
import { useLocalization } from '@app/providers/localization';
import styles from './vault-styles.module.scss';
import { useNavigate } from 'react-router-dom';

// TODO: Remote if have the new generation method
const API_KEY = '5twtxLaosDF7sYJ8U5ltDDtxr8F74KPrXYC0YhNiYKAAvYiyqKT8ceJKp0zNVWkLQaYV7NnVR783CAQ2jGA5tzR1LZBxWg1Z97I7nn8SNvcXLyXyvk0f0sNgA1enwZlS'

const VaultPage = (props: any) => {
  const navigate = useNavigate();
  const { data, serverTime, postApi, getApi, chestSlots, closeNotificationModal, mergeBodyData } = useApi();
  const [isInit, setIsInit] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const { translate, changeLocale, locale } = useLocalization();
  const [tabIndicators, setTabIndicators] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getApi("vault/profile");
    getApi("nft/ownership");
    
    console.log("GET VAULT: ", data);
  }, [])
  
  const mint = async () => {
    const now = Date.now();
    console.log("Create collection ", `season-${now}`);
    const data = {
      gameName: "solitaire",
      collectionHandle: `season-${now}`,
      imageUrl: "https://mobilegaminginsider.com/wp-content/uploads/2024/01/Solo-Leveling-Mobile-1536x864.jpg",
      metadata: {
        title: `${now}`,
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Identifies the asset to which this token represents",
          },
          decimals: {
            type: "integer",
            description:
              "The number of decimal places that the token amount should display - e.g. 18, means to divide the token amount by 1000000000000000000 to get its user representation.",
          },
          description: {
            type: "string",
            description: "Describes the asset to which this token represents",
          },
          image: {
            type: "string",
            description:
              "A URI pointing to a resource with mime type image/* representing the asset to which this token represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.",
          },
          properties: {
            type: "object",
            description: "Arbitrary properties. Values may be strings, numbers, object or arrays.",
          },
        },
        attributes: [
          {
            trait_type: "Background",
            value: "Green",
          },
          {
            trait_type: "Head",
            value: "Hat",
          },
          {
            trait_type: "Level",
            display_type: "number",
            value: 10,
          },
        ],
      },
    };
    const result = await postApi(`nft/collection`, "POST", {
      nftCollectionData: data,
      apiKey: API_KEY,
    });

    [4].forEach(async (item, idx) => {
      console.log("Create nft ", `season-${now}`);
      await new Promise((resolve, reject) => {
        setTimeout(() => resolve({}), item * 3000)
      })
      const data = {
        gameName: "solitaire",
        collectionHandle: `season-${now}`,
        count: item,
        imageUrl: "https://i.pinimg.com/236x/bc/9a/72/bc9a720149eb9db98db5fb8f256b2d3d.jpg",
        metadata: {
          title: `Token ${Date.now()} - ${idx}`,
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Identifies the asset to which this token represents",
            },
            decimals: {
              type: "integer",
              description:
                "The number of decimal places that the token amount should display - e.g. 18, means to divide the token amount by 1000000000000000000 to get its user representation.",
            },
            description: {
              type: "string",
              description: "Describes the asset to which this token represents",
            },
            image: {
              type: "string",
              description:
                "A URI pointing to a resource with mime type image/* representing the asset to which this token represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.",
            },
            properties: {
              type: "object",
              description: "Arbitrary properties. Values may be strings, numbers, object or arrays.",
            },
          },
          attributes: [
            {
              trait_type: "Background",
              value: "Green",
            },
            {
              trait_type: "Head",
              value: "Hat",
            },
            {
              trait_type: "Level",
              display_type: "number",
              value: 10,
            },
          ],
        },
      };
      const result = postApi(`nft/ownership`, "POST", {
        nftOwnershipData: data,
        apiKey: API_KEY,
      });
    });

    // getApi('nft/ownership');
  };

  return (
    <div id="vault" className={[styles["vault-container"]].join(" ")}>
      <div
        className={["navbar min-h-14 bg-base-100", styles["navbar"]].join(" ")}
      >
        <div className="navbar-start">
          <div className={[styles["user-profile-area"]].join(" ")} onClick={() => {
            console.log("NAVIGATE TO QB PAGE")
            navigate('/quest-board');
          }}>
            <img
                src={
                  data.ref.userProfile?.initData?.user?.photo_url || avatarImage
                }
              alt="Avatar"
              width={30}
              height={30}
            />
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
              <label className="text-l">
                {/* {Math.ceil((data.ref.userAsset.gem || 0) * 10) / 10} */}
              </label>
            </div>
            <div className={[styles["pszm-area"]].join(" ")}>
              <SVGImage src={pSZMImage} width={20} height={20} />
              <label className="text-l">
                {/* {Math.ceil((data.ref.userAsset.pSZM || 0) * 10) / 10} */}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className={styles["body"]}>
        <CollectionList data={data}/>
      </div>

      <div className={["btm-nav", "bg-white", styles["bottom-nav"]].join(" ")}>
        <button
          className={styles[activeTab == "home" ? "active" : "non-active"]}
          onClick={() => {
            mint()
            setActiveTab("home")
          }}
        >
          <SVGImage src={homeImage} width={25} height={25} />
          <span
            className={[
              "btm-nav-label text-sm font-normal",
              styles["bottom-nav-label"],
            ].join(" ")}
          >
            {translate("vault.home")}
          </span>
        </button>
        <button
          className={styles[activeTab == "bag" ? "active" : "non-active"]}
          onClick={() => setActiveTab("bag")}
        >
          <SVGImage src={walletImage} width={25} height={25} />
          <span
            className={[
              "btm-nav-label text-sm font-normal",
              styles["bottom-nav-label"],
            ].join(" ")}
          >
            {translate("vault.me")}
          </span>
        </button>
      </div>
    </div>
  );
};

export default VaultPage;
