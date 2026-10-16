/**
 * [Machine: 불필요] 빈 상태 표시. 상태 전이 없음
 */

import { forwardRef } from "react";
import type {
  EmptyRootProps,
  EmptyIconProps,
  EmptyTitleProps,
  EmptyDescriptionProps,
  EmptyActionProps,
} from "./empty.types";

const SCOPE = "empty";

const Root = forwardRef<HTMLDivElement, EmptyRootProps>((props, ref) => {
  return <div ref={ref} data-scope={SCOPE} data-part="root" {...props} />;
});
Root.displayName = "Empty.Root";

const Icon = forwardRef<HTMLDivElement, EmptyIconProps>((props, ref) => {
  return <div ref={ref} data-scope={SCOPE} data-part="icon" aria-hidden="true" {...props} />;
});
Icon.displayName = "Empty.Icon";

const Title = forwardRef<HTMLHeadingElement, EmptyTitleProps>((props, ref) => {
  return <h3 ref={ref} data-scope={SCOPE} data-part="title" {...props} />;
});
Title.displayName = "Empty.Title";

const Description = forwardRef<HTMLParagraphElement, EmptyDescriptionProps>((props, ref) => {
  return <p ref={ref} data-scope={SCOPE} data-part="description" {...props} />;
});
Description.displayName = "Empty.Description";

const Action = forwardRef<HTMLDivElement, EmptyActionProps>((props, ref) => {
  return <div ref={ref} data-scope={SCOPE} data-part="action" {...props} />;
});
Action.displayName = "Empty.Action";

export const Empty = { Root, Icon, Title, Description, Action };
