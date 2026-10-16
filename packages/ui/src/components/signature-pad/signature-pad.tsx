/**
 * SignaturePad 컴포넌트
 * Canvas/SVG 기반 서명 입력 구현.
 * 마우스/터치 그리기, 지우기, SVG/PNG export를 지원한다.
 */

import { createContext, forwardRef, useContext, useEffect, useMemo } from "react";
import { useMachine } from "@/hooks/use-machine";
import { useId } from "@/hooks/use-id";
import { createSignaturePadMachine, connectSignaturePad } from "@/machines/signature-pad";
import type { SignaturePadConnectReturn } from "@/machines/signature-pad";
import { mergeProps } from "@/machines/shared/dom";
import type {
  SignaturePadRootProps,
  SignaturePadControlProps,
  SignaturePadSegmentProps,
  SignaturePadCurrentSegmentProps,
  SignaturePadGuideProps,
  SignaturePadClearTriggerProps,
  SignaturePadLabelProps,
} from "./signature-pad.types";

/** 내부 Context */
const SignaturePadContext = createContext<SignaturePadConnectReturn | null>(null);

const useSignaturePadContext = () => {
  const ctx = useContext(SignaturePadContext);
  if (!ctx) {
    throw new Error("SignaturePad 하위 컴포넌트는 SignaturePad.Root 안에서 사용해야 합니다.");
  }
  return ctx;
};

/** Root */
const Root = ({
  paths: pathsProp,
  onPathsChange,
  disabled = false,
  readOnly = false,
  id: idProp,
  children,
}: SignaturePadRootProps) => {
  const id = useId(idProp);

  const machine = useMemo(
    () =>
      createSignaturePadMachine({
        id,
        paths: pathsProp,
        disabled,
        readOnly,
      }),
    [id, pathsProp, disabled, readOnly],
  );

  const [state, context, send] = useMachine(machine);
  const api = connectSignaturePad(state, context, send);

  // context 동기화
  useEffect(() => {
    send({ type: "SET_CONTEXT", context: { disabled, readOnly } });
  }, [disabled, readOnly, send]);

  // 외부 paths 동기화 (제어 모드)
  useEffect(() => {
    if (pathsProp !== undefined && pathsProp !== context.paths) {
      send({ type: "SET_CONTEXT", context: { paths: pathsProp } });
    }
  }, [pathsProp, context.paths, send]);

  // 머신 paths → 외부 콜백
  useEffect(() => {
    onPathsChange?.(context.paths);
  }, [context.paths, onPathsChange]);

  const ctxValue = useMemo(() => api, [state, context, api]);

  return (
    <SignaturePadContext.Provider value={ctxValue}>
      <div {...api.rootProps}>{children}</div>
    </SignaturePadContext.Provider>
  );
};

/** Label */
const Label = forwardRef<HTMLLabelElement, SignaturePadLabelProps>(({ children, ...rest }, ref) => {
  const api = useSignaturePadContext();
  const props = mergeProps(api.labelProps, rest as Record<string, unknown>);

  return (
    <label ref={ref} {...props}>
      {children}
    </label>
  );
});

/** Control — SVG 기반 그리기 영역 */
const Control = forwardRef<HTMLDivElement, SignaturePadControlProps>(
  ({ children, ...rest }, ref) => {
    const api = useSignaturePadContext();
    const props = mergeProps(api.controlProps, rest as Record<string, unknown>);

    return (
      <div ref={ref} {...props}>
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {api.pathDetails.map((path, i) => (
            <path
              key={i}
              d={path.d}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {api.isDrawing && api.currentPathD && (
            <path
              d={api.currentPathD}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        {children}
      </div>
    );
  },
);

/** Segment — 개별 획 SVG path */
const Segment = forwardRef<SVGPathElement, SignaturePadSegmentProps>(({ index, ...rest }, ref) => {
  const api = useSignaturePadContext();
  const segmentProps = api.getSegmentProps({ index });
  const merged = { ...segmentProps, ...rest };

  return <path ref={ref} {...merged} />;
});

/** CurrentSegment — 현재 그리는 중인 획 */
const CurrentSegment = forwardRef<SVGPathElement, SignaturePadCurrentSegmentProps>((rest, ref) => {
  const api = useSignaturePadContext();
  const merged = { ...api.currentSegmentProps, ...rest };

  return <path ref={ref} {...merged} />;
});

/** Guide — 서명 가이드선 */
const Guide = forwardRef<HTMLDivElement, SignaturePadGuideProps>(({ ...rest }, ref) => {
  const api = useSignaturePadContext();
  const props = mergeProps(api.guideProps, rest as Record<string, unknown>);

  return <div ref={ref} {...props} />;
});

/** ClearTrigger */
const ClearTrigger = forwardRef<HTMLButtonElement, SignaturePadClearTriggerProps>(
  ({ children, ...rest }, ref) => {
    const api = useSignaturePadContext();
    const props = mergeProps(api.clearTriggerProps, rest as Record<string, unknown>);

    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

export const SignaturePad = {
  Root,
  Label,
  Control,
  Segment,
  CurrentSegment,
  Guide,
  ClearTrigger,
  /** SVG data URL로 내보내기 유틸 (context 밖에서 사용 불가) */
  useSignaturePadContext,
};
