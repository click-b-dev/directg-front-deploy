import { forwardRef } from "react";
import type { SkeletonRootProps } from "./skeleton.types";
import { dataAttr } from "@/machines/shared/dom";

const SCOPE = "skeleton";

const Root = forwardRef<HTMLDivElement, SkeletonRootProps>(
  ({ loaded = false, children, ...props }, ref) => {
    if (loaded) {
      return <>{children}</>;
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        data-scope={SCOPE}
        data-part="root"
        data-loaded={dataAttr(loaded)}
        {...props}
      />
    );
  },
);

Root.displayName = "Skeleton.Root";

export const Skeleton = { Root };
