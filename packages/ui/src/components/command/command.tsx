/**
 * Command — Command palette Compound Component
 * 간소화된 Combobox 변형. 별도 상태머신 없이 React 상태로 구현.
 * Headless: 스타일 없음. data-* 속성으로 CSS 타겟팅.
 */

/**
 * [Machine: 불필요] 내부 필터링 로직만 존재. combobox 머신으로 전환 검토 가능
 */

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CommandRootProps,
  CommandInputProps,
  CommandListProps,
  CommandEmptyProps,
  CommandGroupProps,
  CommandGroupHeadingProps,
  CommandItemProps,
  CommandSeparatorProps,
  CommandShortcutProps,
  CommandContextValue,
} from "./command.types";

const SCOPE = "command";

/* ─── React Context ─── */

const CommandContext = createContext<CommandContextValue | null>(null);

const useCommandContext = (): CommandContextValue => {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error("Command compound components must be used within <Command.Root>");
  return ctx;
};

/* ─── Default filter ─── */

const defaultFilter = (label: string, search: string): boolean => {
  if (!search) return true;
  return label.toLowerCase().includes(search.toLowerCase());
};

/* ─── Root ─── */

export const Root = forwardRef<HTMLDivElement, CommandRootProps>(
  ({ filter = defaultFilter, loop = false, children, ...props }, ref) => {
    const [search, setSearch] = useState("");
    const [selectedValue, setSelectedValue] = useState("");

    // Registry of items: value -> { label, keywords }
    const itemsRef = useRef<Map<string, { label: string; keywords?: string[] }>>(new Map());
    const onSelectRef = useRef<Map<string, (value: string) => void>>(new Map());
    const [, forceUpdate] = useState(0);

    const registerItem = useCallback((value: string, label: string, keywords?: string[]) => {
      itemsRef.current.set(value, { label, keywords });
      forceUpdate((c) => c + 1);
    }, []);

    const unregisterItem = useCallback((value: string) => {
      itemsRef.current.delete(value);
      onSelectRef.current.delete(value);
      forceUpdate((c) => c + 1);
    }, []);

    const registerOnSelect = useCallback((value: string, onSelect: (value: string) => void) => {
      onSelectRef.current.set(value, onSelect);
    }, []);

    const activateItem = useCallback((value: string) => {
      const handler = onSelectRef.current.get(value);
      handler?.(value);
    }, []);

    const isMatching = useCallback(
      (value: string): boolean => {
        const item = itemsRef.current.get(value);
        if (!item) return false;
        const searchText = [item.label, ...(item.keywords ?? [])].join(" ");
        return filter(searchText, search);
      },
      [filter, search],
    );

    const hasMatches = useMemo(() => {
      for (const [value] of itemsRef.current) {
        if (isMatching(value)) return true;
      }
      return false;
    }, [isMatching]);

    // Get ordered matching items
    const getMatchingValues = useCallback((): string[] => {
      const result: string[] = [];
      for (const [value] of itemsRef.current) {
        if (isMatching(value)) result.push(value);
      }
      return result;
    }, [isMatching]);

    // Auto-select first matching item when search changes
    useEffect(() => {
      const matching = getMatchingValues();
      if (matching.length > 0 && !matching.includes(selectedValue)) {
        setSelectedValue(matching[0]!);
      }
    }, [search, getMatchingValues, selectedValue]);

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const matching = getMatchingValues();
        if (matching.length === 0) return;

        const currentIdx = matching.indexOf(selectedValue);

        if (e.key === "ArrowDown") {
          e.preventDefault();
          let nextIdx = currentIdx + 1;
          if (nextIdx >= matching.length) {
            nextIdx = loop ? 0 : matching.length - 1;
          }
          setSelectedValue(matching[nextIdx]!);
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          let prevIdx = currentIdx - 1;
          if (prevIdx < 0) {
            prevIdx = loop ? matching.length - 1 : 0;
          }
          setSelectedValue(matching[prevIdx]!);
        }

        if (e.key === "Home") {
          e.preventDefault();
          setSelectedValue(matching[0]!);
        }

        if (e.key === "End") {
          e.preventDefault();
          setSelectedValue(matching[matching.length - 1]!);
        }

        if (e.key === "Enter") {
          e.preventDefault();
          if (selectedValue) {
            activateItem(selectedValue);
          }
        }
      },
      [getMatchingValues, selectedValue, loop, activateItem],
    );

    const ctxValue = useMemo<CommandContextValue>(
      () => ({
        search,
        selectedValue,
        filter,
        setSearch,
        setSelectedValue,
        registerItem,
        unregisterItem,
        registerOnSelect,
        activateItem,
        isMatching,
        hasMatches,
        loop,
      }),
      [
        search,
        selectedValue,
        filter,
        registerItem,
        unregisterItem,
        registerOnSelect,
        activateItem,
        isMatching,
        hasMatches,
        loop,
      ],
    );

    return (
      <CommandContext.Provider value={ctxValue}>
        <div ref={ref} data-scope={SCOPE} data-part="root" onKeyDown={handleKeyDown} {...props}>
          {children}
        </div>
      </CommandContext.Provider>
    );
  },
);

/* ─── Input ─── */

export const Input = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ value: controlledValue, onValueChange, ...props }, ref) => {
    const ctx = useCommandContext();
    const value = controlledValue ?? ctx.search;

    return (
      <input
        ref={ref}
        type="text"
        role="combobox"
        aria-expanded={true}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        autoComplete="off"
        data-scope={SCOPE}
        data-part="input"
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          ctx.setSearch(val);
          onValueChange?.(val);
        }}
        {...props}
      />
    );
  },
);

/* ─── List ─── */

export const List = forwardRef<HTMLDivElement, CommandListProps>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} role="listbox" data-scope={SCOPE} data-part="list" {...props}>
      {children}
    </div>
  );
});

/* ─── Empty ─── */

export const Empty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children, ...props }, ref) => {
    const ctx = useCommandContext();

    if (ctx.hasMatches) return null;

    return (
      <div ref={ref} data-scope={SCOPE} data-part="empty" {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Group ─── */

export const Group = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, children, ...props }, ref) => {
    const headingId = useRef(`cmd-group-${Math.random().toString(36).slice(2, 8)}`).current;

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={heading ? headingId : undefined}
        data-scope={SCOPE}
        data-part="group"
        {...props}
      >
        {heading && (
          <div id={headingId} data-scope={SCOPE} data-part="group-heading" aria-hidden="true">
            {heading}
          </div>
        )}
        {children}
      </div>
    );
  },
);

/* ─── GroupHeading ─── */

export const GroupHeading = forwardRef<HTMLDivElement, CommandGroupHeadingProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} data-scope={SCOPE} data-part="group-heading" aria-hidden="true" {...props}>
        {children}
      </div>
    );
  },
);

/* ─── Item ─── */

export const Item = forwardRef<HTMLDivElement, CommandItemProps>(
  ({ value, keywords, disabled = false, onSelect, children, ...props }, ref) => {
    const ctx = useCommandContext();
    const label = typeof children === "string" ? children : value;

    // Register/unregister
    useEffect(() => {
      ctx.registerItem(value, label, keywords);
      return () => ctx.unregisterItem(value);
    }, [value, label, keywords]);

    // Register onSelect
    useEffect(() => {
      if (onSelect) {
        ctx.registerOnSelect(value, onSelect);
      }
    }, [value, onSelect]);

    const isSelected = ctx.selectedValue === value;
    const isVisible = ctx.isMatching(value);

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled || undefined}
        data-scope={SCOPE}
        data-part="item"
        data-selected={isSelected ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-value={value}
        onClick={() => {
          if (!disabled && onSelect) {
            onSelect(value);
          }
        }}
        onPointerMove={() => {
          if (!disabled) {
            ctx.setSelectedValue(value);
          }
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

/* ─── Separator ─── */

export const Separator = forwardRef<HTMLDivElement, CommandSeparatorProps>((props, ref) => {
  return <div ref={ref} role="separator" data-scope={SCOPE} data-part="separator" {...props} />;
});

/* ─── Shortcut ─── */

export const Shortcut = forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ children, ...props }, ref) => {
    return (
      <span ref={ref} data-scope={SCOPE} data-part="shortcut" {...props}>
        {children}
      </span>
    );
  },
);
