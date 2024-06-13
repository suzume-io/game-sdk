import { ApiData } from "@app/api/models/utils";
import { CollectionItem } from "./collection-item";
import styles from "./styles.module.scss";

export const CollectionList = (props: {data: {ref: ApiData}}) => {
  const { data } = props;

  return (
    <div className={["grid grid-cols-2 gap-4 m-4", styles["scroll-view-container"]].join(" ")}>
      {/* TODO: Use real data */}
      {data?.ref?.nftCollections?.data &&
        Object.values(data.ref.nftCollections.data)
          .map((collection, i) => {
            return (
            <CollectionItem
              key={`collection-${i}`}
              name={(collection?.metadata as any)?.title || collection?.collectionHandle || "Collection Name"}
              amount={collection.count || 0}
              img={collection?.imageURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"}
              id={"collectionId"}
              collection={collection}
            />
          )})}
    </div>
  );
};
