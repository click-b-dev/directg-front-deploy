import { createContext, forwardRef, useContext, useMemo } from "react";
import { mergeProps } from "@/machines/shared";
import { encodeQR } from "./qr-encoder";
import type {
  QRCodeRootProps,
  QRCodeFrameProps,
  QRCodePatternProps,
  QRCodeOverlayProps,
} from "./qr-code.types";

interface QRCodeContextValue {
  matrix: boolean[][];
  size: number;
  moduleCount: number;
}

const QRCodeContext = createContext<QRCodeContextValue | null>(null);

const useQRCodeContext = (): QRCodeContextValue => {
  const ctx = useContext(QRCodeContext);
  if (!ctx) {
    throw new Error("QRCode compound components must be used within QRCode.Root");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, QRCodeRootProps>((props, ref) => {
  const { value, size = 128, children, ...restProps } = props;

  const matrix = useMemo(() => encodeQR(value), [value]);
  const moduleCount = matrix.length;

  const rootProps: Record<string, unknown> = {
    "data-scope": "qr-code",
    "data-part": "root",
    style: { position: "relative", display: "inline-block", width: size, height: size },
  };

  return (
    <QRCodeContext.Provider value={{ matrix, size, moduleCount }}>
      <div ref={ref} {...mergeProps(rootProps, restProps)}>
        {children}
      </div>
    </QRCodeContext.Provider>
  );
});

const Frame = forwardRef<SVGSVGElement, QRCodeFrameProps>((props, ref) => {
  const ctx = useQRCodeContext();
  const { moduleCount } = ctx;

  const frameProps: Record<string, unknown> = {
    "data-scope": "qr-code",
    "data-part": "frame",
    viewBox: `0 0 ${moduleCount} ${moduleCount}`,
    width: "100%",
    height: "100%",
    style: { display: "block" },
  };

  // Build SVG path from matrix
  let path = "";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (ctx.matrix[row]![col]) {
        path += `M${col},${row}h1v1h-1z`;
      }
    }
  }

  return (
    <svg ref={ref} {...mergeProps(frameProps, props)}>
      <Pattern pathData={path} />
    </svg>
  );
});

const Pattern = forwardRef<SVGPathElement, QRCodePatternProps & { pathData?: string }>(
  (props, ref) => {
    const { pathData, ...rest } = props;
    if (pathData) {
      return (
        <path
          ref={ref}
          data-scope="qr-code"
          data-part="pattern"
          d={pathData}
          fill="currentColor"
          {...rest}
        />
      );
    }

    // Standalone usage (outside Frame)
    const ctx = useQRCodeContext();
    const { moduleCount, matrix } = ctx;

    let path = "";
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (matrix[row]![col]) {
          path += `M${col},${row}h1v1h-1z`;
        }
      }
    }

    const patternProps: Record<string, unknown> = {
      "data-scope": "qr-code",
      "data-part": "pattern",
      d: path,
      fill: "currentColor",
    };

    return <path ref={ref} {...mergeProps(patternProps, rest)} />;
  },
);

const Overlay = forwardRef<HTMLDivElement, QRCodeOverlayProps>((props, ref) => {
  const overlayProps: Record<string, unknown> = {
    "data-scope": "qr-code",
    "data-part": "overlay",
    style: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
  };

  return <div ref={ref} {...mergeProps(overlayProps, props)} />;
});

export const QRCode = {
  Root,
  Frame,
  Pattern,
  Overlay,
};
