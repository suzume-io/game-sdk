import avatarImage from '@res/img/avatar.png?base64';

const CollectibleItem = (props: any) => {
  const { item, openModal } = props;
  const { imageURL, count } = item;
  return (
    <div
      className="relative w-auto rounded-md overflow-hidden"
      style={{height: '100px'}}
      onClick={() => openModal(item)}
    >
      <figure>
        <img src={imageURL || avatarImage} alt="" style={{
          height: '80px',
          width: '100%',
          objectFit: 'fill'
        }}/>
      </figure>
      <p className="absolute bottom-0 right-0.5">{`x${count || 0}`}</p>
    </div>
  );
};

export default CollectibleItem;
