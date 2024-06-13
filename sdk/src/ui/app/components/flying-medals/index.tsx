import { useQuestAnimation } from "@app/providers/questAnimation";
import { SVGImage } from "@app/components";
import medalImage from "@res/svg/medal.svg?raw";
import styles from "./styles.module.scss";

const QuestFlyingMedals = () => {
  const { animationStyle } = useQuestAnimation();
  return (
    <div className={styles["flying-medal"]} style={animationStyle.container}>
      <div className={styles["child-medal"]} style={animationStyle.child}>
        <div className={[styles["medal-1"]].join(" ")}>
          <SVGImage src={medalImage} width={28} height={28} />
        </div>
        <div className={[styles["medal-2"]].join(" ")}>
          <SVGImage src={medalImage} width={28} height={28} />
        </div>
        <div className={[styles["medal-3"]].join(" ")}>
          <SVGImage src={medalImage} width={28} height={28} />
        </div>
      </div>
    </div>
  );
};

export default QuestFlyingMedals;
