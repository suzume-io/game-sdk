import { useState } from "react";
import CollectibleItem from "./collectible-item";
import styles from "./styles.module.scss";

const CollectionDetailList = (props: any) => {
  const { items } = props;
  const [selectedCollectibleItem, setSelectedCollectibleItem] = useState({});

  const OffchainCollectibleItemPopup = (props: any) => {
    const { item } = props;
    const { metadata, imageURL, ownershipId } = item;
    return (
      <div className={[styles["modal-body"]].join(" ")}>
        <h1 className="font-bold text-2xl text-neutral-700 mb-3">{metadata?.title || ownershipId}</h1>

        <div className={[styles["item-container"]].join(" ")}>
          <figure className="m-2">
            <img className="rounded-md" src={imageURL} alt="" />
          </figure>
        </div>
        <div className={["modal-action", styles["modal-bottom"]].join(" ")}>
          <button
            className={[styles["okay-btn"]].join(" ")}
            //   onClick={}
          >
            Transfer
          </button>
          <button
            className={[styles["okay-btn"]].join(" ")}
            //   onClick={}
          >
            Marketplace
          </button>
        </div>
      </div>
    );
  };

  const OnchainCollectibleItemPopup = (props: any) => {
    const { item } = props;
    const { name, itemImg } = item;
    return (
      <div className={[styles["modal-body"]].join(" ")}>
        <h1 className="font-bold text-2xl text-neutral-700 mb-3">{name}</h1>

        <div className={[styles["item-container"]].join(" ")}>
          <figure className="m-2">
            <img className="rounded-md" src={itemImg} alt="" />
          </figure>
        </div>
        <div className={["modal-action", styles["modal-bottom"]].join(" ")}>
          <button
            className={[styles["okay-btn"]].join(" ")}
            //   onClick={}
          >
            Mint
          </button>
        </div>
      </div>
    );
  };

  const openModal = (item: any) => {
    setSelectedCollectibleItem(item);
    (document?.getElementById("collectible-item-popup") as any)?.showModal();
  };
  return (
    <>
      <div
        className={[
          "grid grid-cols-4 gap-4 m-4",
          // styles["scroll-view-container"],
        ].join(" ")}
      >
        {items.map((item: any, i: number) => (
          <CollectibleItem
            key={`collectible-${item.id}-${i}`}
            item={item}
            openModal={openModal}
          />
        ))}
      </div>
      <dialog id="collectible-item-popup" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          {selectedCollectibleItem && (selectedCollectibleItem as any)?.onchain ? (
            <OnchainCollectibleItemPopup item={selectedCollectibleItem} />
          ) : (
            <OffchainCollectibleItemPopup item={selectedCollectibleItem} />
          )}
        </div>
      </dialog>
    </>
  );
};

export default CollectionDetailList;
