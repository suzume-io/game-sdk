import { PopoverStylesObj } from "@reactour/popover";
import { PopoverContentProps, StepType } from "@reactour/tour";
import { SVGImage } from "@app/components";
import medalImage from "@res/svg/medal.svg?raw";

type VerticalAlign = "top" | "bottom";
type HorizontalAlign = "left" | "right";
type Position = VerticalAlign | HorizontalAlign | "custom";

const steps: StepType[] = [
  {
    selector: ".achievement-quest-tour:first-of-type",
    content: () => (
      <div className="flex flex-col justify-center items-center">
        <p className="inline-flex items-center text-center">
          <span className="text-xl">Claim the welcome gift!</span>
        </p>
      </div>
    ),
  },
  {
    selector: ".claim-chests-tour",
    content: () => (
      <div className="flex flex-col justify-center items-center">
        <div className="inline-flex items-center text-xl text-center">
          <span className="h-[35px] mx-1">
            <SVGImage src={medalImage} height={35} width={35} />
          </span>
          <span>
            automatically become <b>Chests</b>!
          </span>
        </div>
        <p className="inline-flex items-center text-center">
          <span className="text-xl">Tap to unlock it!</span>
        </p>
      </div>
    ),
    highlightedSelectors: [".chest-btn-normal-tour:first-of-type"],
    mutationObservables: [
      ".claim-chests-tour",
      ".chest-btn-normal-tour:first-of-type",
    ],
  },
  {
    // CAUTION: This step is intentionally skipped.
    selector: ".claim-chests-tour",
    content: "",
    styles: {
      popover: (base: any, state: any) => {
        return {
          ...base,
          display: "none",
        };
      },
      maskWrapper: (base: any, state: any) => {
        return {
          ...base,
          display: "none",
        };
      },
    },
  },
  {
    // CAUTION: This step is intentionally skipped.
    selector: ".claim-chests-tour",
    content: ({ setCurrentStep }: PopoverContentProps) => (
      <div className="flex flex-col justify-center items-center">
        <p className="inline-flex items-center text-xl text-center">
          Unlocking takes time ⏳
        </p>
        <p className="inline-flex items-center text-xl text-center">
          Let's check back later
        </p>
        <button
          className="btn mt-4"
          style={{
            backgroundColor: "#1CB0F6",
            color: "#ffffff",
            border: "2px solid #1896D1"
          }}
          onClick={() => setCurrentStep((cur: number) => cur + 1)}
        >
          Okay
        </button>
      </div>
    ),
    styles: {
      popover: (base: any, state: any) => {
        return {
          ...base,
          borderRadius: 10,
          padding: "20px",
          top: "-30px",
          left: "30px",
        };
      },
    },
    stepInteraction: false,
    highlightedSelectors: [".chest-btn-unlocking-tour:first-of-type"],
    mutationObservables: [
      ".claim-chests-tour",
      ".chest-btn-unlocking-tour:first-of-type",
    ],
  },
  {
    selector: ".close-button-tour",
    content: () => (
      <div className="flex flex-col justify-center items-center">
        <p className="inline-flex items-center text-center">
          <span className="text-xl">Tap to return to game</span>
        </p>
      </div>
    ),
  },
];

const style: PopoverStylesObj = {
  popover: (base, state: any) => {
    return {
      ...base,
      borderRadius: 10,
      padding: "15px",
      margin: "10px",
      ...doArrow(state.position, state.verticalAlign, state.horizontalAlign),
    };
  },
};

const opositeSide = {
  top: "bottom",
  bottom: "top",
  right: "left",
  left: "right",
};

const popoverPadding = 10;

function doArrow(
  position: Position,
  verticalAlign: VerticalAlign,
  horizontalAlign: HorizontalAlign
) {
  if (!position || position === "custom") {
    return {};
  }

  const width = 16;
  const height = 12;
  const color = "white";
  const isVertical = position === "top" || position === "bottom";
  const spaceFromSide = 10;

  const obj = {
    [`--rtp-arrow-${
      isVertical ? opositeSide[horizontalAlign] : verticalAlign
    }`]: height + spaceFromSide + "px",
    [`--rtp-arrow-${opositeSide[position]}`]: -height + 2 + "px",
    [`--rtp-arrow-border-${isVertical ? "left" : "top"}`]: `${
      width / 2
    }px solid transparent`,
    [`--rtp-arrow-border-${isVertical ? "right" : "bottom"}`]: `${
      width / 2
    }px solid transparent`,
    [`--rtp-arrow-border-${position}`]: `${height}px solid ${color}`,
  };
  return obj;
}

export { steps, style, popoverPadding };
