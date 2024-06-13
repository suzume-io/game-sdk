import { SVGImage } from '@app/components';
import styles from './styles.module.scss';

const ClaimChestButton = (props: any) => {
  const { chestClassName = '', title = '', titleIcon = null, children, footerText = '', footerIcon = null, toolTipContent, onClick } = props;
  return (
    <div
      className={[
        'btn',
        styles[chestClassName],
        styles['chest-btn'],
        `${chestClassName}-tour`
      ].join(' ')}
      onClick={onClick}
    >
      <div className="flex flex-col justify-between items-center h-full w-full">
        <div className="w-full h-[15px] my-1 text-center flex flex-row items-center justify-center mx-auto">
          {titleIcon && <div className="mr-[2px]"><SVGImage src={titleIcon} height={14} width={14} /></div>}
          <label className="roboto-medium text-[12px] text-slate-500">{title}</label>
        </div>
        {children}
        <div className={[["w-full h-[15px] my-1 text-center flex flex-row items-center justify-center mx-auto"], styles["footer-text"]].join(" ")}>
          {footerIcon && <div className="mr-[2px]"><SVGImage src={footerIcon} height={14} width={14} /></div>}
          <label className="roboto-medium text-md">{footerText}</label>
        </div>

      </div>
      {!!toolTipContent && (
        <div className={[styles["tooltiptext"]].join(" ")}>
          <span>{toolTipContent}</span>
        </div>
      )}
    </div>
  );
};

export default ClaimChestButton;
