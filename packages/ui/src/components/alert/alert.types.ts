import type { ComponentPropsWithRef } from "react";

export interface AlertRootProps extends ComponentPropsWithRef<"div"> {
  /** alert: 긴급, status: 비긴급 */
  role?: "alert" | "status";
}

export type AlertIconProps = ComponentPropsWithRef<"span">;

export type AlertTitleProps = ComponentPropsWithRef<"h5">;

export type AlertDescriptionProps = ComponentPropsWithRef<"div">;
