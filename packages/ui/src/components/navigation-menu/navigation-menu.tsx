import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { mergeProps } from "@/machines/shared";
import { createNavigationMenuMachine, connectNavigationMenu } from "@/machines/navigation-menu";
import type { NavigationMenuApi, NavigationMenuItem } from "@/machines/navigation-menu";
import type {
  NavigationMenuRootProps,
  NavigationMenuListProps,
  NavigationMenuItemProps,
  NavigationMenuTriggerProps,
  NavigationMenuContentProps,
  NavigationMenuLinkProps,
  NavigationMenuIndicatorProps,
  NavigationMenuViewportProps,
  NavigationMenuArrowProps,
} from "./navigation-menu.types";

interface NavigationMenuContextValue {
  api: NavigationMenuApi;
  registerItem: (item: NavigationMenuItem) => void;
  unregisterItem: (value: string) => void;
}

interface NavigationMenuItemContextValue {
  value: string;
  disabled?: boolean;
}

const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null);
const NavigationMenuItemContext = createContext<NavigationMenuItemContextValue | null>(null);

const useNavigationMenuContext = (): NavigationMenuContextValue => {
  const ctx = useContext(NavigationMenuContext);
  if (!ctx) {
    throw new Error("NavigationMenu compound components must be used within NavigationMenu.Root");
  }
  return ctx;
};

const useNavigationMenuItemContext = (): NavigationMenuItemContextValue => {
  const ctx = useContext(NavigationMenuItemContext);
  if (!ctx) {
    throw new Error("NavigationMenu.Trigger/Content must be used within NavigationMenu.Item");
  }
  return ctx;
};

const Root = forwardRef<HTMLElement, NavigationMenuRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    children,
    id: customId,
    ...restProps
  } = props;

  const [value, setValue] = useControllable<string | null>({
    value: controlledValue ?? undefined,
    defaultValue: defaultValue ?? null,
    onChange: (v) => onValueChange?.(v),
  });

  const baseId = useId(customId);

  const itemsRef = useRef<NavigationMenuItem[]>([]);

  const machine = useMemo(
    () =>
      createNavigationMenuMachine({
        id: baseId,
        value,
        items: itemsRef.current,
        orientation,
      }),
    [baseId, value, orientation],
  );

  const [state, context, send] = useMachine(machine);

  useEffect(() => {
    send({ type: "SET_ORIENTATION", orientation });
  }, [orientation, send]);

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== context.value) {
      send({ type: "SET_VALUE", value: controlledValue });
    }
  }, [controlledValue, context.value, send]);

  useEffect(() => {
    if (context.value !== value) {
      setValue(context.value);
    }
  }, [context.value, value, setValue]);

  const registerItem = useCallback(
    (item: NavigationMenuItem) => {
      const existing = itemsRef.current.find((i) => i.value === item.value);
      if (!existing) {
        itemsRef.current = [...itemsRef.current, item];
        send({ type: "SET_ITEMS", items: itemsRef.current });
      }
    },
    [send],
  );

  const unregisterItem = useCallback(
    (itemValue: string) => {
      itemsRef.current = itemsRef.current.filter((i) => i.value !== itemValue);
      send({ type: "SET_ITEMS", items: itemsRef.current });
    },
    [send],
  );

  const api = connectNavigationMenu(state, context, send);
  const rootProps = api.getRootProps();

  const ctxValue = useMemo(
    () => ({ api, registerItem, unregisterItem }),
    [api, registerItem, unregisterItem],
  );

  return (
    <NavigationMenuContext.Provider value={ctxValue}>
      <nav ref={ref} {...mergeProps(rootProps as Record<string, unknown>, restProps)}>
        {children}
      </nav>
    </NavigationMenuContext.Provider>
  );
});

const List = forwardRef<HTMLUListElement, NavigationMenuListProps>((props, ref) => {
  const { api } = useNavigationMenuContext();
  const listProps = api.getListProps();

  return <ul ref={ref} {...mergeProps(listProps as Record<string, unknown>, props)} />;
});

const Item = forwardRef<HTMLLIElement, NavigationMenuItemProps>((props, ref) => {
  const { value, disabled, children, ...restProps } = props;
  const { api, registerItem, unregisterItem } = useNavigationMenuContext();

  useEffect(() => {
    registerItem({ value, disabled });
    return () => unregisterItem(value);
  }, [value, disabled, registerItem, unregisterItem]);

  const itemProps = api.getItemProps({ value });
  const itemCtxValue = useMemo(() => ({ value, disabled }), [value, disabled]);

  return (
    <NavigationMenuItemContext.Provider value={itemCtxValue}>
      <li ref={ref} {...mergeProps(itemProps as Record<string, unknown>, restProps)}>
        {children}
      </li>
    </NavigationMenuItemContext.Provider>
  );
});

const Trigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>((props, ref) => {
  const { api } = useNavigationMenuContext();
  const { value, disabled } = useNavigationMenuItemContext();
  const triggerProps = api.getTriggerProps({ value, disabled });

  return (
    <button
      ref={ref}
      type="button"
      {...mergeProps(triggerProps as Record<string, unknown>, props)}
    />
  );
});

const Content = forwardRef<HTMLDivElement, NavigationMenuContentProps>((props, ref) => {
  const { api } = useNavigationMenuContext();
  const { value } = useNavigationMenuItemContext();
  const contentProps = api.getContentProps({ value });

  return <div ref={ref} {...mergeProps(contentProps as Record<string, unknown>, props)} />;
});

const Link = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(({ active, ...props }, ref) => {
  const { api } = useNavigationMenuContext();
  const linkProps = api.getLinkProps({ active });

  return <a ref={ref} {...mergeProps(linkProps as Record<string, unknown>, props)} />;
});

const Indicator = forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>((props, ref) => {
  const { api } = useNavigationMenuContext();
  const indicatorProps = api.getIndicatorProps();

  return <div ref={ref} {...mergeProps(indicatorProps as Record<string, unknown>, props)} />;
});

const Viewport = forwardRef<HTMLDivElement, NavigationMenuViewportProps>((props, ref) => {
  const { api } = useNavigationMenuContext();
  const viewportProps = api.getViewportProps();

  return <div ref={ref} {...mergeProps(viewportProps as Record<string, unknown>, props)} />;
});

const Arrow = forwardRef<HTMLDivElement, NavigationMenuArrowProps>((props, ref) => {
  const { api } = useNavigationMenuContext();
  const arrowProps = api.getArrowProps();

  return <div ref={ref} {...mergeProps(arrowProps as Record<string, unknown>, props)} />;
});

export const NavigationMenu = {
  Root,
  List,
  Item,
  Trigger,
  Content,
  Link,
  Indicator,
  Viewport,
  Arrow,
};
