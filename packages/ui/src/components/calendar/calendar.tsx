import { createContext, forwardRef, useContext, useEffect, useMemo } from "react";
import { useMachine, useControllable, useId } from "@/hooks";
import { mergeProps } from "@/machines/shared";
import { createCalendarMachine, connectCalendar } from "@/machines/calendar";
import type { CalendarApi } from "@/machines/calendar";
import type {
  CalendarRootProps,
  CalendarHeaderProps,
  CalendarHeadingProps,
  CalendarPrevTriggerProps,
  CalendarNextTriggerProps,
  CalendarGridProps,
  CalendarGridHeaderProps,
  CalendarGridHeaderCellProps,
  CalendarGridBodyProps,
  CalendarGridRowProps,
  CalendarGridCellProps,
  CalendarCellTriggerProps,
} from "./calendar.types";

const CalendarContext = createContext<CalendarApi | null>(null);

const useCalendarContext = (): CalendarApi => {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error("Calendar compound components must be used within Calendar.Root");
  }
  return ctx;
};

const Root = forwardRef<HTMLDivElement, CalendarRootProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = null,
    onValueChange,
    onFocusedDateChange,
    min,
    max,
    disabled = false,
    locale = "en-US",
    children,
    id: customId,
    ...restProps
  } = props;

  const [value, setValue] = useControllable<Date | null>({
    value: controlledValue,
    defaultValue,
    onChange: onValueChange,
  });

  const machine = useMemo(
    () =>
      createCalendarMachine({
        value,
        min,
        max,
        disabled,
        locale,
      }),
    [value, min, max, disabled, locale],
  );

  const [state, context, send] = useMachine(machine);

  // Sync external props
  useEffect(() => {
    send({ type: "SET_CONTEXT", context: { min, max, disabled, locale } });
  }, [min, max, disabled, locale, send]);

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      const machineVal = context.value;
      const same =
        controlledValue === null
          ? machineVal === null
          : machineVal !== null && controlledValue.getTime() === machineVal.getTime();
      if (!same) {
        if (controlledValue) {
          send({ type: "SELECT_DATE", date: controlledValue });
        } else {
          send({ type: "SET_CONTEXT", context: { value: null } });
        }
      }
    }
  }, [controlledValue, context.value, send]);

  // Machine → external
  useEffect(() => {
    const machineVal = context.value;
    const same =
      value === null
        ? machineVal === null
        : machineVal !== null && value !== null && value.getTime() === machineVal.getTime();
    if (!same) {
      setValue(machineVal);
    }
  }, [context.value, value, setValue]);

  // Focused date change callback
  useEffect(() => {
    onFocusedDateChange?.(context.focusedDate);
  }, [context.focusedDate, onFocusedDateChange]);

  const baseId = useId(customId);
  const ids = useMemo(() => ({ root: baseId, grid: `${baseId}-grid` }), [baseId]);

  const api = connectCalendar(state, context, send, ids);
  const rootProps = api.getRootProps();

  return (
    <CalendarContext.Provider value={api}>
      <div ref={ref} {...mergeProps(rootProps as Record<string, unknown>, restProps)}>
        {children}
      </div>
    </CalendarContext.Provider>
  );
});

const Header = forwardRef<HTMLDivElement, CalendarHeaderProps>((props, ref) => {
  const api = useCalendarContext();
  const headerProps = api.getHeaderProps();
  return <div ref={ref} {...mergeProps(headerProps as Record<string, unknown>, props)} />;
});

const Heading = forwardRef<HTMLDivElement, CalendarHeadingProps>((props, ref) => {
  const api = useCalendarContext();
  const headingProps = api.getHeadingProps();
  const { children, ...rest } = props;
  return (
    <div ref={ref} {...mergeProps(headingProps as Record<string, unknown>, rest)}>
      {children ?? api.heading}
    </div>
  );
});

const PrevTrigger = forwardRef<HTMLButtonElement, CalendarPrevTriggerProps>((props, ref) => {
  const api = useCalendarContext();
  const prevProps = api.getPrevTriggerProps();
  return <button ref={ref} {...mergeProps(prevProps as Record<string, unknown>, props)} />;
});

const NextTrigger = forwardRef<HTMLButtonElement, CalendarNextTriggerProps>((props, ref) => {
  const api = useCalendarContext();
  const nextProps = api.getNextTriggerProps();
  return <button ref={ref} {...mergeProps(nextProps as Record<string, unknown>, props)} />;
});

const Grid = forwardRef<HTMLTableElement, CalendarGridProps>((props, ref) => {
  const api = useCalendarContext();
  const gridProps = api.getGridProps();
  return <table ref={ref} {...mergeProps(gridProps as Record<string, unknown>, props)} />;
});

const GridHeader = forwardRef<HTMLTableSectionElement, CalendarGridHeaderProps>((props, ref) => {
  const api = useCalendarContext();
  const headerProps = api.getGridHeaderProps();
  return <thead ref={ref} {...mergeProps(headerProps as Record<string, unknown>, props)} />;
});

const GridHeaderCell = forwardRef<HTMLTableCellElement, CalendarGridHeaderCellProps>(
  (props, ref) => {
    const { index, children, ...rest } = props;
    const api = useCalendarContext();
    const cellProps = api.getGridHeaderCellProps(index);
    return (
      <th ref={ref} {...mergeProps(cellProps as Record<string, unknown>, rest)}>
        {children ?? api.weekDays[index]}
      </th>
    );
  },
);

const GridBody = forwardRef<HTMLTableSectionElement, CalendarGridBodyProps>((props, ref) => {
  const api = useCalendarContext();
  const bodyProps = api.getGridBodyProps();
  return <tbody ref={ref} {...mergeProps(bodyProps as Record<string, unknown>, props)} />;
});

const GridRow = forwardRef<HTMLTableRowElement, CalendarGridRowProps>((props, ref) => {
  const { weekIndex, ...rest } = props;
  const api = useCalendarContext();
  const rowProps = api.getGridRowProps(weekIndex);
  return <tr ref={ref} {...mergeProps(rowProps as Record<string, unknown>, rest)} />;
});

const GridCell = forwardRef<HTMLTableCellElement, CalendarGridCellProps>((props, ref) => {
  const { day, ...rest } = props;
  const api = useCalendarContext();
  const cellProps = api.getGridCellProps(day);
  return <td ref={ref} {...mergeProps(cellProps as Record<string, unknown>, rest)} />;
});

const CellTrigger = forwardRef<HTMLButtonElement, CalendarCellTriggerProps>((props, ref) => {
  const { day, children, ...rest } = props;
  const api = useCalendarContext();
  const triggerProps = api.getCellTriggerProps(day);
  return (
    <button ref={ref} type="button" {...mergeProps(triggerProps as Record<string, unknown>, rest)}>
      {children ?? day.dayOfMonth}
    </button>
  );
});

export const Calendar = {
  Root,
  Header,
  Heading,
  PrevTrigger,
  NextTrigger,
  Grid,
  GridHeader,
  GridHeaderCell,
  GridBody,
  GridRow,
  GridCell,
  CellTrigger,
};
