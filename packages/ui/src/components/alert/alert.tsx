/**
 * [Machine: 불필요] WAI-ARIA Alert 패턴이나 단방향 알림으로 상태 전이 없음
 */

import { forwardRef } from "react";
import type {
  AlertRootProps,
  AlertIconProps,
  AlertTitleProps,
  AlertDescriptionProps,
} from "./alert.types";

const SCOPE = "alert";

const Root = forwardRef<HTMLDivElement, AlertRootProps>(({ role = "alert", ...props }, ref) => {
  return <div ref={ref} role={role} data-scope={SCOPE} data-part="root" {...props} />;
});

Root.displayName = "Alert.Root";

const Icon = forwardRef<HTMLSpanElement, AlertIconProps>((props, ref) => {
  return <span ref={ref} data-scope={SCOPE} data-part="icon" {...props} />;
});

Icon.displayName = "Alert.Icon";

const Title = forwardRef<HTMLHeadingElement, AlertTitleProps>((props, ref) => {
  return <h5 ref={ref} data-scope={SCOPE} data-part="title" {...props} />;
});

Title.displayName = "Alert.Title";

const Description = forwardRef<HTMLDivElement, AlertDescriptionProps>((props, ref) => {
  return <div ref={ref} data-scope={SCOPE} data-part="description" {...props} />;
});

Description.displayName = "Alert.Description";

export const Alert = { Root, Icon, Title, Description };
