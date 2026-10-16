/**
 * [Machine: 불필요] 입력 그룹 레이아웃. 상태 전이 없음
 */

import { forwardRef } from "react";
import type {
  InputGroupRootProps,
  InputGroupAddonProps,
  InputGroupElementProps,
} from "./input-group.types";

const SCOPE = "input-group";

const Root = forwardRef<HTMLDivElement, InputGroupRootProps>((props, ref) => {
  return <div ref={ref} data-scope={SCOPE} data-part="root" {...props} />;
});
Root.displayName = "InputGroup.Root";

const Addon = forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ placement = "start", ...props }, ref) => {
    return (
      <div ref={ref} data-scope={SCOPE} data-part="addon" data-placement={placement} {...props} />
    );
  },
);
Addon.displayName = "InputGroup.Addon";

const Element = forwardRef<HTMLDivElement, InputGroupElementProps>(
  ({ placement = "start", ...props }, ref) => {
    return (
      <div ref={ref} data-scope={SCOPE} data-part="element" data-placement={placement} {...props} />
    );
  },
);
Element.displayName = "InputGroup.Element";

export const InputGroup = { Root, Addon, Element };
