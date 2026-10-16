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
import { useControllable, useId } from "@/hooks";
import { useMachine } from "@/hooks/use-machine";
import { mergeProps, Keys, dataAttr } from "@/machines/shared";
import { createPopoverMachine, connectPopover } from "@/machines/popover";
import type { PopoverConnectReturn } from "@/machines/popover";
import type {
  TimeValue,
  TimeGranularity,
  TimePickerRootProps,
  TimePickerLabelProps,
  TimePickerControlProps,
  TimePickerInputProps,
  TimePickerTriggerProps,
  TimePickerClearTriggerProps,
  TimePickerContentProps,
  TimePickerPositionerProps,
  TimePickerColumnProps,
  TimePickerCellProps,
  TimePickerSpacerProps,
} from "./time-picker.types";

// ────────────────── Helpers ──────────────────

const padTwo = (n: number): string => {
  return n.toString().padStart(2, "0");
};

const formatTimeValue = (
  val: TimeValue | null,
  hour12: boolean,
  granularity: TimeGranularity,
): string => {
  if (!val) return "";
  const parts: string[] = [];
  if (hour12) {
    const period = val.hour >= 12 ? "PM" : "AM";
    const h = val.hour % 12 || 12;
    parts.push(padTwo(h));
    if (granularity !== "hour") parts.push(padTwo(val.minute));
    if (granularity === "second") parts.push(padTwo(val.second));
    return `${parts.join(":")} ${period}`;
  }
  parts.push(padTwo(val.hour));
  if (granularity !== "hour") parts.push(padTwo(val.minute));
  if (granularity === "second") parts.push(padTwo(val.second));
  return parts.join(":");
};

const parseTimeString = (str: string, hour12: boolean): TimeValue | null => {
  if (!str) return null;
  const trimmed = str.trim().toUpperCase();
  let isPM = false;
  let isAM = false;
  let cleaned = trimmed;

  if (hour12) {
    if (trimmed.endsWith("PM")) {
      isPM = true;
      cleaned = trimmed.slice(0, -2).trim();
    } else if (trimmed.endsWith("AM")) {
      isAM = true;
      cleaned = trimmed.slice(0, -2).trim();
    }
  }

  const parts = cleaned.split(":").map((p) => parseInt(p.trim(), 10));
  if (parts.some(isNaN)) return null;

  let hour = parts[0] ?? 0;
  const minute = parts[1] ?? 0;
  const second = parts[2] ?? 0;

  if (hour12) {
    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }

  return { hour, minute, second };
};

// ────────────────── Context ──────────────────

interface TimePickerContextValue {
  value: TimeValue | null;
  setValue: (value: TimeValue | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  isOpen: boolean;
  popoverApi: PopoverConnectReturn;
  openPopover: () => void;
  closePopover: () => void;
  hour12: boolean;
  granularity: TimeGranularity;
  disabled: boolean;
  ids: {
    root: string;
    label: string;
    input: string;
    trigger: string;
    content: string;
  };
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  selectCell: (type: "hour" | "minute" | "second" | "period", value: number | string) => void;
}

const TimePickerContext = createContext<TimePickerContextValue | null>(null);

const useTimePickerContext = (): TimePickerContextValue => {
  const ctx = useContext(TimePickerContext);
  if (!ctx) {
    throw new Error("TimePicker compound components must be used within TimePicker.Root");
  }
  return ctx;
};

// ────────────────── Root ──────────────────

const Root = (props: TimePickerRootProps) => {
  const {
    value: controlledValue,
    defaultValue = null,
    onValueChange,
    open: controlledOpen,
    onOpenChange,
    hour12 = false,
    granularity = "minute",
    disabled = false,
    id: customId,
    children,
  } = props;

  const baseId = useId(customId);
  const ids = useMemo(
    () => ({
      root: baseId,
      label: `${baseId}-label`,
      input: `${baseId}-input`,
      trigger: `${baseId}-trigger`,
      content: `${baseId}-content`,
    }),
    [baseId],
  );

  const [value, setValue] = useControllable<TimeValue | null>({
    value: controlledValue,
    defaultValue,
    onChange: onValueChange,
  });

  const [inputValue, setInputValue] = useState(() => formatTimeValue(value, hour12, granularity));

  // Popover
  const [open, setOpen] = useControllable({
    value: controlledOpen,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const popMachine = useMemo(() => createPopoverMachine({ id: ids.root, open: false }), [ids.root]);
  const [popState, popCtx, popSend] = useMachine(popMachine);
  const popoverApi = connectPopover(popState, popCtx, popSend);

  useEffect(() => {
    if (open && popState === "closed") popSend({ type: "OPEN" });
    else if (!open && popState === "open") popSend({ type: "CLOSE" });
  }, [open, popState, popSend]);

  useEffect(() => {
    const isOpen = popState === "open";
    if (isOpen !== open) setOpen(isOpen);
  }, [popState, open, setOpen]);

  // Sync input when value changes externally
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(formatTimeValue(controlledValue, hour12, granularity));
    }
  }, [controlledValue, hour12, granularity]);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Outside click
  useEffect(() => {
    if (popState !== "open") return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) return;
      popSend({ type: "CLOSE" });
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [popState, popSend]);

  const openPopover = useCallback(() => {
    popSend({ type: "OPEN" });
  }, [popSend]);

  const closePopover = useCallback(() => {
    popSend({ type: "CLOSE" });
  }, [popSend]);

  const selectCell = useCallback(
    (type: "hour" | "minute" | "second" | "period", cellValue: number | string) => {
      const current = value ?? { hour: 0, minute: 0, second: 0 };
      let next: TimeValue;

      if (type === "period") {
        const period = cellValue as string;
        let newHour = current.hour;
        if (period === "AM" && newHour >= 12) newHour -= 12;
        if (period === "PM" && newHour < 12) newHour += 12;
        next = { ...current, hour: newHour };
      } else {
        next = { ...current, [type]: cellValue as number };
      }

      setValue(next);
      setInputValue(formatTimeValue(next, hour12, granularity));
    },
    [value, setValue, hour12, granularity],
  );

  const isOpen = popState === "open";

  return (
    <TimePickerContext.Provider
      value={{
        value,
        setValue,
        inputValue,
        setInputValue,
        isOpen,
        popoverApi,
        openPopover,
        closePopover,
        hour12,
        granularity,
        disabled,
        ids,
        triggerRef,
        contentRef,
        selectCell,
      }}
    >
      <div
        data-scope="time-picker"
        data-part="root"
        data-state={isOpen ? "open" : "closed"}
        data-disabled={dataAttr(disabled)}
        id={ids.root}
      >
        {children}
      </div>
    </TimePickerContext.Provider>
  );
};

// ────────────────── Sub-components ──────────────────

const Label = forwardRef<HTMLLabelElement, TimePickerLabelProps>((props, ref) => {
  const ctx = useTimePickerContext();
  const labelProps: Record<string, unknown> = {
    "data-scope": "time-picker",
    "data-part": "label",
    id: ctx.ids.label,
    htmlFor: ctx.ids.input,
  };
  return <label ref={ref} {...mergeProps(labelProps, props)} />;
});

const Control = forwardRef<HTMLDivElement, TimePickerControlProps>((props, ref) => {
  const controlProps: Record<string, unknown> = {
    "data-scope": "time-picker",
    "data-part": "control",
  };
  return <div ref={ref} {...mergeProps(controlProps, props)} />;
});

const Input = forwardRef<HTMLInputElement, TimePickerInputProps>((props, ref) => {
  const ctx = useTimePickerContext();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      ctx.setInputValue(e.target.value);
    },
    [ctx],
  );

  const handleBlur = useCallback(() => {
    const parsed = parseTimeString(ctx.inputValue, ctx.hour12);
    if (parsed) {
      ctx.setValue(parsed);
      ctx.setInputValue(formatTimeValue(parsed, ctx.hour12, ctx.granularity));
    } else if (ctx.inputValue === "") {
      ctx.setValue(null);
    } else {
      ctx.setInputValue(formatTimeValue(ctx.value, ctx.hour12, ctx.granularity));
    }
  }, [ctx]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const parsed = parseTimeString(ctx.inputValue, ctx.hour12);
        if (parsed) {
          ctx.setValue(parsed);
          ctx.setInputValue(formatTimeValue(parsed, ctx.hour12, ctx.granularity));
        }
      }
    },
    [ctx],
  );

  const placeholder = ctx.hour12
    ? ctx.granularity === "second"
      ? "hh:mm:ss AM"
      : ctx.granularity === "minute"
        ? "hh:mm AM"
        : "hh AM"
    : ctx.granularity === "second"
      ? "HH:mm:ss"
      : ctx.granularity === "minute"
        ? "HH:mm"
        : "HH";

  const inputProps: Record<string, unknown> = {
    "data-scope": "time-picker",
    "data-part": "input",
    id: ctx.ids.input,
    "aria-labelledby": ctx.ids.label,
    value: ctx.inputValue,
    onChange: handleChange,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    placeholder,
    disabled: ctx.disabled,
    autoComplete: "off",
  };

  return <input ref={ref} {...mergeProps(inputProps, props)} />;
});

const Trigger = forwardRef<HTMLButtonElement, TimePickerTriggerProps>((props, ref) => {
  const ctx = useTimePickerContext();

  const mergedRef = useCallback(
    (node: HTMLButtonElement | null) => {
      (ctx.triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    },
    [ctx.triggerRef, ref],
  );

  const triggerProps: Record<string, unknown> = {
    "data-scope": "time-picker",
    "data-part": "trigger",
    id: ctx.ids.trigger,
    type: "button",
    "aria-label": "Open time picker",
    "aria-expanded": ctx.isOpen,
    "aria-haspopup": "dialog",
    disabled: ctx.disabled,
    onClick() {
      if (ctx.isOpen) {
        ctx.closePopover();
      } else {
        ctx.openPopover();
      }
    },
  };

  return <button ref={mergedRef} {...mergeProps(triggerProps, props)} />;
});

const ClearTrigger = forwardRef<HTMLButtonElement, TimePickerClearTriggerProps>((props, ref) => {
  const ctx = useTimePickerContext();
  const clearProps: Record<string, unknown> = {
    "data-scope": "time-picker",
    "data-part": "clearTrigger",
    type: "button",
    "aria-label": "Clear time",
    disabled: ctx.disabled,
    onClick() {
      ctx.setValue(null);
      ctx.setInputValue("");
    },
  };
  return <button ref={ref} {...mergeProps(clearProps, props)} />;
});

const Positioner = forwardRef<HTMLDivElement, TimePickerPositionerProps>((props, ref) => {
  const ctx = useTimePickerContext();
  if (!ctx.isOpen) return null;

  const positionerProps: Record<string, unknown> = {
    "data-scope": "time-picker",
    "data-part": "positioner",
  };
  return <div ref={ref} {...mergeProps(positionerProps, props)} />;
});

const Content = forwardRef<HTMLDivElement, TimePickerContentProps>((props, ref) => {
  const ctx = useTimePickerContext();

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (ctx.contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ctx.contentRef, ref],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === Keys.Escape) {
        ctx.closePopover();
      }
    },
    [ctx.popoverApi],
  );

  const contentProps: Record<string, unknown> = {
    "data-scope": "time-picker",
    "data-part": "content",
    id: ctx.ids.content,
    role: "dialog",
    "aria-label": "Time picker",
    tabIndex: -1,
    onKeyDown: handleKeyDown,
  };

  return <div ref={mergedRef} {...mergeProps(contentProps, props)} />;
});

const Column = forwardRef<HTMLDivElement, TimePickerColumnProps>((props, ref) => {
  const { type, children, ...rest } = props;

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>("button"));
    const currentIdx = buttons.findIndex((b) => b === document.activeElement);

    if (e.key === Keys.ArrowDown) {
      e.preventDefault();
      const next = Math.min(currentIdx + 1, buttons.length - 1);
      buttons[next]?.focus();
      buttons[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === Keys.ArrowUp) {
      e.preventDefault();
      const prev = Math.max(currentIdx - 1, 0);
      buttons[prev]?.focus();
      buttons[prev]?.scrollIntoView({ block: "nearest" });
    }
  }, []);

  const columnProps: Record<string, unknown> = {
    "data-scope": "time-picker",
    "data-part": "column",
    "data-type": type,
    role: "listbox",
    "aria-label": `Select ${type}`,
    onKeyDown: handleKeyDown,
    style: { overflowY: "auto" },
  };

  return (
    <div ref={ref} {...mergeProps(columnProps, rest)}>
      {children}
    </div>
  );
});

const Cell = forwardRef<HTMLButtonElement, TimePickerCellProps>((props, ref) => {
  const { value: cellValue, type, children, ...rest } = props;
  const ctx = useTimePickerContext();

  const isSelected = useMemo(() => {
    if (!ctx.value) return false;
    if (type === "hour") {
      if (ctx.hour12) {
        const displayHour = ctx.value.hour % 12 || 12;
        return displayHour === cellValue;
      }
      return ctx.value.hour === cellValue;
    }
    if (type === "minute") return ctx.value.minute === cellValue;
    if (type === "second") return ctx.value.second === cellValue;
    if (type === "period") {
      const period = ctx.value.hour >= 12 ? "PM" : "AM";
      return period === cellValue;
    }
    return false;
  }, [ctx.value, ctx.hour12, type, cellValue]);

  const handleClick = useCallback(() => {
    ctx.selectCell(type, cellValue);
  }, [ctx, type, cellValue]);

  const cellProps: Record<string, unknown> = {
    "data-scope": "time-picker",
    "data-part": "cell",
    "data-type": type,
    "data-value": cellValue,
    "data-selected": dataAttr(isSelected),
    role: "option",
    "aria-selected": isSelected,
    type: "button",
    tabIndex: isSelected ? 0 : -1,
    onClick: handleClick,
  };

  const display = children ?? (type === "period" ? cellValue : padTwo(cellValue as number));

  return (
    <button ref={ref} {...mergeProps(cellProps, rest)}>
      {display}
    </button>
  );
});

const Spacer = forwardRef<HTMLDivElement, TimePickerSpacerProps>((props, ref) => {
  const spacerProps: Record<string, unknown> = {
    "data-scope": "time-picker",
    "data-part": "spacer",
    "aria-hidden": "true",
  };
  return <div ref={ref} {...mergeProps(spacerProps, props)} />;
});

export const TimePicker = {
  Root,
  Label,
  Control,
  Input,
  Trigger,
  ClearTrigger,
  Positioner,
  Content,
  Column,
  Cell,
  Spacer,
};
