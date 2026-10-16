/**
 * [Machine: 불필요] 키보드 단축키 표시. 상태 전이 없음
 */

import { forwardRef } from "react";
import type { KbdRootProps } from "./kbd.types";

const SCOPE = "kbd";

const Root = forwardRef<HTMLElement, KbdRootProps>((props, ref) => {
  return <kbd ref={ref} data-scope={SCOPE} data-part="root" {...props} />;
});

Root.displayName = "Kbd.Root";

export const Kbd = { Root };
