const CollectionDetailHeader = (props: any) => {
  const { name, img, amount } = props;
  return (
    <div className="flex flex-row gap-4 m-4">
      <div className="w-auto">
        <div className="avatar">
          <div className="w-24 rounded">
            <img src={img} alt="" />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-neutral-600">{name}</h2>
        <p className="text-slate-400">{`${amount} Items`}</p>
      </div>
    </div>
  );
};

export default CollectionDetailHeader;