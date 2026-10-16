import { createContext, forwardRef, useContext, useEffect, useMemo } from "react";
import { useMachine } from "@/hooks";
import { useId } from "@/hooks/use-id";
import { mergeProps } from "@/machines/shared";
import { createAvatarMachine, connectAvatar } from "@/machines/avatar";
import type { AvatarApi } from "@/machines/avatar";
import type { AvatarRootProps, AvatarImageProps, AvatarFallbackProps } from "./avatar.types";

const AvatarContext = createContext<AvatarApi | null>(null);

const useAvatarContext = (): AvatarApi => {
  const ctx = useContext(AvatarContext);
  if (!ctx) {
    throw new Error("Avatar compound components must be used within Avatar.Root");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, AvatarRootProps>((props, ref) => {
  const { children, id: customId, ...restProps } = props;

  const baseId = useId(customId);
  const ids = useMemo(() => ({ root: baseId }), [baseId]);

  const machine = useMemo(() => createAvatarMachine(), []);
  const [state, context, send] = useMachine(machine);
  const api = connectAvatar(state, context, send, ids);

  const rootProps = api.getRootProps();

  return (
    <AvatarContext.Provider value={api}>
      <div ref={ref} {...mergeProps(rootProps as Record<string, unknown>, restProps)}>
        {children}
      </div>
    </AvatarContext.Provider>
  );
});

const Image = forwardRef<HTMLImageElement, AvatarImageProps>((props, ref) => {
  const { src, alt, onLoadingStatusChange, ...restProps } = props;
  const api = useAvatarContext();
  const imageProps = api.getImageProps();

  // src가 변경되면 외부에 알림
  useEffect(() => {
    onLoadingStatusChange?.(api.state);
  }, [api.state, onLoadingStatusChange]);

  const mergedProps = mergeProps(
    imageProps as Record<string, unknown>,
    {
      ...restProps,
      src,
      alt,
    } as Record<string, unknown>,
  );

  return <img ref={ref} {...mergedProps} />;
});

const Fallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>((props, ref) => {
  const api = useAvatarContext();
  const fallbackProps = api.getFallbackProps();

  return <span ref={ref} {...mergeProps(fallbackProps as Record<string, unknown>, props)} />;
});

export const Avatar = {
  Root,
  Image,
  Fallback,
};
