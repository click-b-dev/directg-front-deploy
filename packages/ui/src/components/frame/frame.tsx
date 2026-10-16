/**
 * [Machine: 불필요] iframe 래퍼. 상태 전이 없음
 */

import { forwardRef } from "react";
import type { FrameRootProps } from "./frame.types";

const SCOPE = "frame";

const Root = forwardRef<HTMLIFrameElement, FrameRootProps>((props, ref) => {
  const { src, title, sandbox, loading = "lazy", ...restProps } = props;

  return (
    <iframe
      ref={ref}
      data-scope={SCOPE}
      data-part="root"
      src={src}
      title={title}
      sandbox={sandbox}
      loading={loading}
      {...restProps}
    />
  );
});

Root.displayName = "Frame.Root";

export const Frame = { Root };
