import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

interface QuestAnimationContextType {
  questRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  emptyChestRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  animating: string | null | undefined;
  animationStyle: { [key: string]: React.CSSProperties };
  showFlyingMedalAnimation: (questId: string) => void;
}

const QuestAnimationContext = createContext<
  QuestAnimationContextType | undefined
>(undefined);

export const QuestAnimationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [animating, setAnimating] = useState<string | null>();
  const [animationStyle, setAnimationStyle] = useState<{[key: string]:React.CSSProperties}>({});
  const questRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const emptyChestRefs = useRef<Array<HTMLDivElement | null>>([]);

  // FIXME: To be verified: Need to update empty chest list properly
  const showFlyingMedalAnimation = useCallback(
    (questId: string) => {
      if (!animating) {
        const questElement = questRefs.current[questId];
        const chestElement = emptyChestRefs.current[0];

        if (questElement && chestElement) {
          const questRect = questElement.getBoundingClientRect();
          const chestRect = chestElement.getBoundingClientRect();

          const startX = questRect.left + questRect.width / 2;
          const startY = questRect.top + questRect.height / 2;
          const endX = chestRect.left + chestRect.width / 2;
          const endY = chestRect.top + chestRect.height / 2;

          const translateX = endX - startX;
          const translateY = endY - startY;

          setAnimationStyle({
            container: {
              transform: `translate(${translateX}px, ${translateY}px)`,
              position: "absolute",
              left: questRect.left + questRect.width / 2 - 20,
              top: questRect.top - 20,
            },
            child: {
              transform: `scale(1)`,
              position: "absolute",
            },
          });
        }

        setTimeout(() => {
          setAnimating(null);
          setAnimationStyle({});
        }, 600); // Match the animation duration
      }
    },
    [animating]
  );

  return (
    <QuestAnimationContext.Provider
      value={{
        questRefs,
        emptyChestRefs,
        animating,
        animationStyle,
        showFlyingMedalAnimation,
      }}
    >
      {children}
    </QuestAnimationContext.Provider>
  );
};

export const useQuestAnimation = (): QuestAnimationContextType => {
  const context = useContext(QuestAnimationContext);
  if (context === undefined) {
    throw new Error("useRefs must be used within a RefProvider");
  }
  return context;
};
