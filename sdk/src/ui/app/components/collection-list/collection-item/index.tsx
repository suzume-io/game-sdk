import { useNavigate } from "react-router-dom";

import { useApi } from '@app/api';

export const CollectionItem = (props: any) => {
  const { mergeBodyData } = useApi();
  const { name, img, amount, id, collection } = props;
  const navigate = useNavigate();

  return (
    <div
      className="card w-auto"
      onClick={() => {
        // navigate(`/collection/${id}`)
        console.log('NAVIGATE TO COLLECTIBLE PAGE');
        mergeBodyData({ selectedNftCollection: collection });
        navigate('/vault/collectibles');
      }}
    >
      <figure>
        <img src={img} alt="" />
      </figure>
      <div className="card-body bg-slate-100 p-3 rounded-b-2xl gap-1 border-none">
        <h2 className="card-title text-neutral-600 text-lg">{name}</h2>
        <p className="text-slate-400 font-normal">{`${amount} Item`}</p>
      </div>
    </div>
  );
};
