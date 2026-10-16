/**
 * SignaturePad connect
 * 머신 상태를 서명 패드 DOM 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import { dataAttr } from "@/machines/shared/dom";
import type {
  SignaturePadState,
  SignaturePadContext,
  SignaturePadEvent,
  StrokePath,
} from "./types";

/** SVG path d 속성 문자열 생성 */
function pathToSvgD(path: StrokePath): string {
  if (path.length === 0) return "";
  const first = path[0]!;
  if (path.length === 1) {
    return `M${first.x},${first.y}L${first.x},${first.y}`;
  }

  let d = `M${first.x},${first.y}`;
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]!;
    const curr = path[i]!;
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += `Q${prev.x},${prev.y},${midX},${midY}`;
  }
  const last = path[path.length - 1]!;
  d += `L${last.x},${last.y}`;
  return d;
}

type DataState = "empty" | "drawing" | "filled";

function getDataState(state: SignaturePadState, ctx: SignaturePadContext): DataState {
  if (state === "drawing") return "drawing";
  if (ctx.paths.length > 0) return "filled";
  return "empty";
}

export interface SignaturePadConnectReturn {
  /** 서명이 비어있는지 */
  isEmpty: boolean;
  /** 그리기 중인지 */
  isDrawing: boolean;
  /** 모든 획의 SVG path d 속성 배열 */
  pathDetails: { d: string }[];
  /** 현재 그리는 중인 획의 SVG path d 속성 */
  currentPathD: string;
  /** 전체 SVG data URL로 내보내기 */
  getDataUrl(type?: "image/svg+xml" | "image/png"): string;
  /** root 속성 */
  rootProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": DataState;
    "data-disabled": "" | undefined;
    id: string;
  };
  /** label 속성 */
  labelProps: {
    "data-scope": string;
    "data-part": string;
    id: string;
  };
  /** control (SVG container) 속성 */
  controlProps: {
    "data-scope": string;
    "data-part": string;
    "data-state": DataState;
    "data-disabled": "" | undefined;
    id: string;
    role: "application";
    "aria-label": string;
    "aria-roledescription": "signature pad";
    tabIndex: number;
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
  /** segment (SVG path) 공통 속성 */
  getSegmentProps(props: { index: number }): {
    "data-scope": string;
    "data-part": string;
    d: string;
    fill: "none";
    stroke: "currentColor";
    strokeWidth: number;
    strokeLinecap: "round";
    strokeLinejoin: "round";
  };
  /** 현재 그리기 중인 segment 속성 */
  currentSegmentProps: {
    "data-scope": string;
    "data-part": string;
    d: string;
    fill: "none";
    stroke: "currentColor";
    strokeWidth: number;
    strokeLinecap: "round";
    strokeLinejoin: "round";
    opacity: number;
  };
  /** guide (서명선) 속성 */
  guideProps: {
    "data-scope": string;
    "data-part": string;
  };
  /** clearTrigger 속성 */
  clearTriggerProps: {
    "data-scope": string;
    "data-part": string;
    type: "button";
    "aria-label": string;
    disabled: boolean;
    onClick: () => void;
  };
}

export function connectSignaturePad(
  state: SignaturePadState,
  context: SignaturePadContext,
  send: Send<SignaturePadEvent>,
): SignaturePadConnectReturn {
  const isEmpty = context.paths.length === 0 && context.currentPath.length === 0;
  const isDrawing = state === "drawing";
  const dataState = getDataState(state, context);
  const isInteractive = !context.disabled && !context.readOnly;

  const pathDetails = context.paths.map((path) => ({
    d: pathToSvgD(path),
  }));

  const currentPathD = pathToSvgD(context.currentPath);

  function getDataUrl(type: "image/svg+xml" | "image/png" = "image/svg+xml"): string {
    const controlEl = document.getElementById(`${context.id}-control`);
    const svgEl = controlEl?.querySelector("svg");
    if (!svgEl) return "";

    if (type === "image/svg+xml") {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      return `data:image/svg+xml;base64,${btoa(svgString)}`;
    }

    // For PNG, use canvas
    const canvas = document.createElement("canvas");
    const rect = svgEl.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return "";

    const img = new Image();
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
    canvasCtx.drawImage(img, 0, 0);
    return canvas.toDataURL(type);
  }

  function getPointFromEvent(e: React.PointerEvent): { x: number; y: number; pressure: number } {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  }

  return {
    isEmpty,
    isDrawing,
    pathDetails,
    currentPathD,
    getDataUrl,
    rootProps: {
      "data-scope": "signature-pad",
      "data-part": "root",
      "data-state": dataState,
      "data-disabled": dataAttr(context.disabled),
      id: context.id,
    },
    labelProps: {
      "data-scope": "signature-pad",
      "data-part": "label",
      id: `${context.id}-label`,
    },
    controlProps: {
      "data-scope": "signature-pad",
      "data-part": "control",
      "data-state": dataState,
      "data-disabled": dataAttr(context.disabled),
      id: `${context.id}-control`,
      role: "application",
      "aria-label": "Signature pad",
      "aria-roledescription": "signature pad",
      tabIndex: isInteractive ? 0 : -1,
      onPointerDown(e: React.PointerEvent) {
        if (!isInteractive) return;
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        const point = getPointFromEvent(e);
        send({ type: "DRAW_START", point });
      },
      onPointerMove(e: React.PointerEvent) {
        if (!isInteractive || !isDrawing) return;
        e.preventDefault();
        const point = getPointFromEvent(e);
        send({ type: "DRAW_MOVE", point });
      },
      onPointerUp(e: React.PointerEvent) {
        if (!isInteractive) return;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        send({ type: "DRAW_END" });
      },
      onPointerLeave(e: React.PointerEvent) {
        if (!isInteractive || !isDrawing) return;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        send({ type: "DRAW_END" });
      },
      style: {
        touchAction: "none",
        userSelect: "none",
      },
    },
    getSegmentProps(props: { index: number }) {
      const path = context.paths[props.index];
      return {
        "data-scope": "signature-pad" as const,
        "data-part": "segment" as const,
        d: path ? pathToSvgD(path) : "",
        fill: "none" as const,
        stroke: "currentColor" as const,
        strokeWidth: 2,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
      };
    },
    currentSegmentProps: {
      "data-scope": "signature-pad",
      "data-part": "segment",
      d: currentPathD,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      opacity: isDrawing ? 1 : 0,
    },
    guideProps: {
      "data-scope": "signature-pad",
      "data-part": "guide",
    },
    clearTriggerProps: {
      "data-scope": "signature-pad",
      "data-part": "clear-trigger",
      type: "button",
      "aria-label": "Clear signature",
      disabled: isEmpty || context.disabled,
      onClick() {
        send({ type: "CLEAR" });
      },
    },
  };
}
