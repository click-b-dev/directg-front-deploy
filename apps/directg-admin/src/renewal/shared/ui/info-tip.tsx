import type { ReactNode } from "react";
import iconInfo from "@/renewal/assets/icon-info.svg";
import iconTooltipArrow from "@/renewal/assets/icon-tooltip-arrow.svg";

type InfoTipProps = { label: string; children: ReactNode };

// Figma `info`(20px 원형 아이콘) + `tooltip`(흰색 · radius 8 · 그림자 · 위쪽 화살표). 호버/포커스 시 아래에 표시.
export const InfoTip = ({ label, children }: InfoTipProps) => (
  <span className="rn:group rn:relative rn:inline-flex">
    <button
      type="button"
      aria-label={label}
      className="rn:flex rn:size-20 rn:items-center rn:justify-center rn:rounded-circle rn:border rn:border-solid rn:border-[#5bbdeb] rn:bg-[#bfe6f7] rn:p-2"
    >
      <img src={iconInfo} alt="" width={14} height={14} />
    </button>
    <span
      role="tooltip"
      className="rn:absolute rn:top-full rn:right-0 rn:z-10 rn:mt-10 rn:hidden rn:w-max rn:max-w-400 rn:rounded-8 rn:bg-surface rn:px-12 rn:pt-8 rn:pb-10 rn:text-detail rn:font-regular rn:text-ink rn:shadow-float rn:group-focus-within:block rn:group-hover:block"
    >
      <img
        src={iconTooltipArrow}
        alt=""
        width={12}
        height={10}
        className="rn:absolute rn:-top-8 rn:right-16"
      />
      {children}
    </span>
  </span>
);
