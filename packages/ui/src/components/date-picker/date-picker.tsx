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
import { useMachine, useControllable, useId } from "@/hooks";
import { mergeProps } from "@/machines/shared";
import { createCalendarMachine, connectCalendar } from "@/machines/calendar";
import { createPopoverMachine, connectPopover } from "@/machines/popover";
import type { CalendarApi } from "@/machines/calendar";
import type { PopoverConnectReturn } from "@/machines/popover";
import type {
  DatePickerRootProps,
  DatePickerLabelProps,
  DatePickerControlProps,
  DatePickerInputProps,
  DatePickerTriggerProps,
  DatePickerClearTriggerProps,
  DatePickerContentProps,
  DatePickerPositionerProps,
  DatePickerViewControlProps,
  DatePickerPrevTriggerProps,
  DatePickerNextTriggerProps,
  DatePickerGridProps,
  DatePickerGridHeaderProps,
  DatePickerGridHeaderCellProps,
  DatePickerGridBodyProps,
  DatePickerGridRowProps,
  DatePickerGridCellProps,
  DatePickerCellTriggerProps,
  DatePickerMonthSelectProps,
  DatePickerYearSelectProps,
} from "./date-picker.types";

// ────────────────── Date formatting helpers ──────────────────

const formatDate = (date: Date | null, locale: string): string => {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const parseDate = (str: string): Date | null => {
  if (!str) return null;
  const date = new Date(str);
  if (isNaN(date.getTime())) return null;
  return date;
};

// ────────────────── Context ──────────────────

interface DatePickerContextValue {
  calendarApi: CalendarApi;
  popoverApi: PopoverConnectReturn;
  isOpen: boolean;
  value: Date | null;
  inputValue: string;
  setInputValue: (value: string) => void;
  selectDate: (date: Date) => void;
  clearValue: () => void;
  openPopover: () => void;
  closePopover: () => void;
  ids: {
    root: string;
    label: string;
    input: string;
    trigger: string;
    content: string;
    grid: string;
  };
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  locale: string;
}

const DatePickerContext = createContext<DatePickerContextValue | null>(null);

const useDatePickerContext = (): DatePickerContextValue => {
  const ctx = useContext(DatePickerContext);
  if (!ctx) {
    throw new Error("DatePicker compound components must be used within DatePicker.Root");
  }
  return ctx;
};

// ────────────────── Root ──────────────────

const Root = (props: DatePickerRootProps) => {
  const {
    value: controlledValue,
    defaultValue = null,
    onValueChange,
    open: controlledOpen,
    onOpenChange,
    min,
    max,
    disabled = false,
    locale = "en-US",
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
      grid: `${baseId}-grid`,
    }),
    [baseId],
  );

  const [value, setValue] = useControllable<Date | null>({
    value: controlledValue,
    defaultValue,
    onChange: onValueChange,
  });

  const [inputValue, setInputValue] = useState(() => formatDate(value, locale));

  // Popover machine
  const [open, setOpen] = useControllable({
    value: controlledOpen,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const popoverMachine = useMemo(
    () => createPopoverMachine({ id: ids.root, open: false }),
    [ids.root],
  );
  const [popState, popCtx, popSend] = useMachine(popoverMachine);
  const popoverApi = connectPopover(popState, popCtx, popSend);

  // Sync popover open state
  useEffect(() => {
    if (open && popState === "closed") {
      popSend({ type: "OPEN" });
    } else if (!open && popState === "open") {
      popSend({ type: "CLOSE" });
    }
  }, [open, popState, popSend]);

  useEffect(() => {
    const isOpen = popState === "open";
    if (isOpen !== open) {
      setOpen(isOpen);
    }
  }, [popState, open, setOpen]);

  // Calendar machine
  const calendarMachine = useMemo(
    () => createCalendarMachine({ value, min, max, disabled, locale }),
    [value, min, max, disabled, locale],
  );
  const [calState, calCtx, calSend] = useMachine(calendarMachine);
  const calendarApi = connectCalendar(calState, calCtx, calSend, {
    root: `${baseId}-cal`,
    grid: ids.grid,
  });

  // Sync calendar context
  useEffect(() => {
    calSend({ type: "SET_CONTEXT", context: { min, max, disabled, locale } });
  }, [min, max, disabled, locale, calSend]);

  // Controlled value → calendar
  useEffect(() => {
    if (controlledValue !== undefined) {
      const machineVal = calCtx.value;
      const same =
        controlledValue === null
          ? machineVal === null
          : machineVal !== null && controlledValue.getTime() === machineVal.getTime();
      if (!same) {
        if (controlledValue) {
          calSend({ type: "SELECT_DATE", date: controlledValue });
        } else {
          calSend({ type: "SET_CONTEXT", context: { value: null } });
        }
      }
    }
  }, [controlledValue, calCtx.value, calSend]);

  // Calendar value → external
  useEffect(() => {
    const machineVal = calCtx.value;
    const same =
      value === null
        ? machineVal === null
        : machineVal !== null && value !== null && value.getTime() === machineVal.getTime();
    if (!same) {
      setValue(machineVal);
      setInputValue(formatDate(machineVal, locale));
    }
  }, [calCtx.value, value, setValue, locale]);

  const selectDate = useCallback(
    (date: Date) => {
      calSend({ type: "SELECT_DATE", date });
      setInputValue(formatDate(date, locale));
      // Close popover after selection
      popSend({ type: "CLOSE" });
    },
    [calSend, popSend, locale],
  );

  const clearValue = useCallback(() => {
    calSend({ type: "SET_CONTEXT", context: { value: null } });
    setValue(null);
    setInputValue("");
  }, [calSend, setValue]);

  const openPopover = useCallback(() => {
    popSend({ type: "OPEN" });
  }, [popSend]);

  const closePopover = useCallback(() => {
    popSend({ type: "CLOSE" });
  }, [popSend]);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Outside click to close
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

  const isOpen = popState === "open";

  return (
    <DatePickerContext.Provider
      value={{
        calendarApi,
        popoverApi,
        isOpen,
        value,
        inputValue,
        setInputValue,
        selectDate,
        clearValue,
        openPopover,
        closePopover,
        ids,
        triggerRef,
        contentRef,
        locale,
      }}
    >
      <div
        data-scope="date-picker"
        data-part="root"
        data-state={isOpen ? "open" : "closed"}
        id={ids.root}
      >
        {children}
      </div>
    </DatePickerContext.Provider>
  );
};

// ────────────────── Sub-components ──────────────────

const Label = forwardRef<HTMLLabelElement, DatePickerLabelProps>((props, ref) => {
  const ctx = useDatePickerContext();
  const labelProps: Record<string, unknown> = {
    "data-scope": "date-picker",
    "data-part": "label",
    id: ctx.ids.label,
    htmlFor: ctx.ids.input,
  };
  return <label ref={ref} {...mergeProps(labelProps, props)} />;
});

const Control = forwardRef<HTMLDivElement, DatePickerControlProps>((props, ref) => {
  const controlProps: Record<string, unknown> = {
    "data-scope": "date-picker",
    "data-part": "control",
  };
  return <div ref={ref} {...mergeProps(controlProps, props)} />;
});

const Input = forwardRef<HTMLInputElement, DatePickerInputProps>((props, ref) => {
  const ctx = useDatePickerContext();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      ctx.setInputValue(val);
    },
    [ctx],
  );

  const handleBlur = useCallback(() => {
    const parsed = parseDate(ctx.inputValue);
    if (parsed) {
      ctx.selectDate(parsed);
    } else if (ctx.inputValue === "") {
      ctx.clearValue();
    } else {
      // Revert to last valid value
      ctx.setInputValue(formatDate(ctx.value, ctx.locale));
    }
  }, [ctx]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const parsed = parseDate(ctx.inputValue);
        if (parsed) {
          ctx.selectDate(parsed);
        }
      }
    },
    [ctx],
  );

  const inputProps: Record<string, unknown> = {
    "data-scope": "date-picker",
    "data-part": "input",
    id: ctx.ids.input,
    "aria-labelledby": ctx.ids.label,
    value: ctx.inputValue,
    onChange: handleChange,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    placeholder: "yyyy-mm-dd",
    autoComplete: "off",
  };

  return <input ref={ref} {...mergeProps(inputProps, props)} />;
});

const Trigger = forwardRef<HTMLButtonElement, DatePickerTriggerProps>((props, ref) => {
  const ctx = useDatePickerContext();

  const mergedRef = useCallback(
    (node: HTMLButtonElement | null) => {
      (ctx.triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    },
    [ctx.triggerRef, ref],
  );

  const triggerProps: Record<string, unknown> = {
    "data-scope": "date-picker",
    "data-part": "trigger",
    id: ctx.ids.trigger,
    type: "button",
    "aria-label": "Open calendar",
    "aria-expanded": ctx.isOpen,
    "aria-haspopup": "dialog",
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

const ClearTrigger = forwardRef<HTMLButtonElement, DatePickerClearTriggerProps>((props, ref) => {
  const ctx = useDatePickerContext();
  const clearProps: Record<string, unknown> = {
    "data-scope": "date-picker",
    "data-part": "clearTrigger",
    type: "button",
    "aria-label": "Clear date",
    onClick() {
      ctx.clearValue();
    },
  };
  return <button ref={ref} {...mergeProps(clearProps, props)} />;
});

const Positioner = forwardRef<HTMLDivElement, DatePickerPositionerProps>((props, ref) => {
  const ctx = useDatePickerContext();
  if (!ctx.isOpen) return null;

  const positionerProps: Record<string, unknown> = {
    "data-scope": "date-picker",
    "data-part": "positioner",
  };
  return <div ref={ref} {...mergeProps(positionerProps, props)} />;
});

const Content = forwardRef<HTMLDivElement, DatePickerContentProps>((props, ref) => {
  const ctx = useDatePickerContext();

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
      if (e.key === "Escape") {
        ctx.closePopover();
      }
    },
    [ctx.popoverApi],
  );

  const contentProps: Record<string, unknown> = {
    "data-scope": "date-picker",
    "data-part": "content",
    id: ctx.ids.content,
    role: "dialog",
    "aria-label": "Date picker",
    tabIndex: -1,
    onKeyDown: handleKeyDown,
  };

  return <div ref={mergedRef} {...mergeProps(contentProps, props)} />;
});

const ViewControl = forwardRef<HTMLDivElement, DatePickerViewControlProps>((props, ref) => {
  const viewControlProps: Record<string, unknown> = {
    "data-scope": "date-picker",
    "data-part": "viewControl",
  };
  return <div ref={ref} {...mergeProps(viewControlProps, props)} />;
});

const PrevTrigger = forwardRef<HTMLButtonElement, DatePickerPrevTriggerProps>((props, ref) => {
  const ctx = useDatePickerContext();
  const prevProps = ctx.calendarApi.getPrevTriggerProps();
  const merged: Record<string, unknown> = {
    ...prevProps,
    "data-scope": "date-picker",
    "data-part": "prevTrigger",
  };
  return <button ref={ref} {...mergeProps(merged, props)} />;
});

const NextTrigger = forwardRef<HTMLButtonElement, DatePickerNextTriggerProps>((props, ref) => {
  const ctx = useDatePickerContext();
  const nextProps = ctx.calendarApi.getNextTriggerProps();
  const merged: Record<string, unknown> = {
    ...nextProps,
    "data-scope": "date-picker",
    "data-part": "nextTrigger",
  };
  return <button ref={ref} {...mergeProps(merged, props)} />;
});

const DatePickerGrid = forwardRef<HTMLTableElement, DatePickerGridProps>((props, ref) => {
  const ctx = useDatePickerContext();
  const gridProps = ctx.calendarApi.getGridProps();
  const merged: Record<string, unknown> = {
    ...gridProps,
    "data-scope": "date-picker",
    "data-part": "grid",
  };
  return <table ref={ref} {...mergeProps(merged, props)} />;
});

const GridHeader = forwardRef<HTMLTableSectionElement, DatePickerGridHeaderProps>((props, ref) => {
  const ctx = useDatePickerContext();
  const headerProps = ctx.calendarApi.getGridHeaderProps();
  const merged: Record<string, unknown> = {
    ...headerProps,
    "data-scope": "date-picker",
  };
  return <thead ref={ref} {...mergeProps(merged, props)} />;
});

const GridHeaderCell = forwardRef<HTMLTableCellElement, DatePickerGridHeaderCellProps>(
  (props, ref) => {
    const { index, children, ...rest } = props;
    const ctx = useDatePickerContext();
    const cellProps = ctx.calendarApi.getGridHeaderCellProps(index);
    const merged: Record<string, unknown> = {
      ...cellProps,
      "data-scope": "date-picker",
    };
    return (
      <th ref={ref} {...mergeProps(merged, rest)}>
        {children ?? ctx.calendarApi.weekDays[index]}
      </th>
    );
  },
);

const GridBody = forwardRef<HTMLTableSectionElement, DatePickerGridBodyProps>((props, ref) => {
  const ctx = useDatePickerContext();
  const bodyProps = ctx.calendarApi.getGridBodyProps();
  const merged: Record<string, unknown> = {
    ...bodyProps,
    "data-scope": "date-picker",
  };
  return <tbody ref={ref} {...mergeProps(merged, props)} />;
});

const GridRow = forwardRef<HTMLTableRowElement, DatePickerGridRowProps>((props, ref) => {
  const { weekIndex, ...rest } = props;
  const ctx = useDatePickerContext();
  const rowProps = ctx.calendarApi.getGridRowProps(weekIndex);
  const merged: Record<string, unknown> = {
    ...rowProps,
    "data-scope": "date-picker",
  };
  return <tr ref={ref} {...mergeProps(merged, rest)} />;
});

const GridCell = forwardRef<HTMLTableCellElement, DatePickerGridCellProps>((props, ref) => {
  const { day, ...rest } = props;
  const ctx = useDatePickerContext();
  const cellProps = ctx.calendarApi.getGridCellProps(day);
  const merged: Record<string, unknown> = {
    ...cellProps,
    "data-scope": "date-picker",
  };
  return <td ref={ref} {...mergeProps(merged, rest)} />;
});

const CellTrigger = forwardRef<HTMLButtonElement, DatePickerCellTriggerProps>((props, ref) => {
  const { day, children, ...rest } = props;
  const ctx = useDatePickerContext();
  const triggerProps = ctx.calendarApi.getCellTriggerProps(day);

  const handleClick = useCallback(() => {
    if (!day.isDisabled) {
      ctx.selectDate(day.date);
    }
  }, [day, ctx]);

  const merged: Record<string, unknown> = {
    ...triggerProps,
    "data-scope": "date-picker",
    "data-part": "cellTrigger",
    onClick: handleClick,
  };

  return (
    <button ref={ref} type="button" {...mergeProps(merged, rest)}>
      {children ?? day.dayOfMonth}
    </button>
  );
});

const MonthSelect = forwardRef<HTMLSelectElement, DatePickerMonthSelectProps>((props, ref) => {
  const ctx = useDatePickerContext();
  const currentMonth = ctx.calendarApi.viewDate.getMonth();

  const months = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(ctx.locale, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: formatter.format(new Date(2024, i, 1)),
    }));
  }, [ctx.locale]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const month = parseInt(e.target.value, 10);
      const newDate = new Date(ctx.calendarApi.viewDate);
      newDate.setMonth(month);
      ctx.calendarApi.selectDate(newDate);
    },
    [ctx.calendarApi],
  );

  const selectProps: Record<string, unknown> = {
    "data-scope": "date-picker",
    "data-part": "monthSelect",
    value: currentMonth,
    onChange: handleChange,
    "aria-label": "Select month",
  };

  return (
    <select ref={ref} {...mergeProps(selectProps, props)}>
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  );
});

const YearSelect = forwardRef<HTMLSelectElement, DatePickerYearSelectProps>((props, ref) => {
  const ctx = useDatePickerContext();
  const currentYear = ctx.calendarApi.viewDate.getFullYear();

  const years = useMemo(() => {
    const start = currentYear - 50;
    const end = currentYear + 50;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentYear]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const year = parseInt(e.target.value, 10);
      const newDate = new Date(ctx.calendarApi.viewDate);
      newDate.setFullYear(year);
      ctx.calendarApi.selectDate(newDate);
    },
    [ctx.calendarApi],
  );

  const selectProps: Record<string, unknown> = {
    "data-scope": "date-picker",
    "data-part": "yearSelect",
    value: currentYear,
    onChange: handleChange,
    "aria-label": "Select year",
  };

  return (
    <select ref={ref} {...mergeProps(selectProps, props)}>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
});

export const DatePicker = {
  Root,
  Label,
  Control,
  Input,
  Trigger,
  ClearTrigger,
  Positioner,
  Content,
  ViewControl,
  PrevTrigger,
  NextTrigger,
  Grid: DatePickerGrid,
  GridHeader,
  GridHeaderCell,
  GridBody,
  GridRow,
  GridCell,
  CellTrigger,
  MonthSelect,
  YearSelect,
};
