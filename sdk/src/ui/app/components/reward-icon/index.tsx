import GameDesign from '@app/api/models/game-design';

// import coinImage from '@res/img/coin.png?base64';
import coinImage from '@res/svg/pSZM.svg?raw';
import gemImage from '@res/svg/gem.svg?raw';
import medalImage from '@res/svg/medal.svg?raw';

const GLOBAL_ASSET_ICONS: Record<string, string> = {
  'pSZM': coinImage,
  'gem': gemImage,
  'medal': medalImage
};

export const RewardIcon = (props: { id: string, gameDesign: GameDesign, width: number, height: number }) => {
  const { id, gameDesign, width, height } = props;
  const iconURL =  gameDesign.data.assets[id]?.iconURL || GLOBAL_ASSET_ICONS[id];

  // console.log(id)
  // console.log(iconURL)
  return <img src={iconURL} alt="Ticket" width={width} height={height} />
}
