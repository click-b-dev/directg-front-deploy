import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

// legacy admin: <input data-provide="datepicker" data-date-format="yyyy-mm-dd">.
// 테마 app.min.css에 bootstrap-datepicker 스타일이 번들돼 있어, 동일 마크업만 렌더하면
// 스타일이 그대로 적용된다. jQuery/신규 의존성 없이 bootstrap-datepicker 기본 동작을 재현한다.
// 기본값: weekStart=0(일), 영문 라벨, format yyyy-mm-dd, autoclose=false, todayHighlight=false.

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
// daysMin, weekStart=0
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad2 = (n: number) => String(n).padStart(2, "0");
const formatYmd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// yyyy-mm-dd 파싱 (실제 유효 날짜만). 아니면 null.
const parseYmd = (s: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(mo) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null;
  }
  return date;
};

const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();

type View = "days" | "months" | "years";

type BootstrapDatepickerProps = {
  id?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  containerId?: string;
};

export const BootstrapDatepicker = ({
  id,
  name,
  defaultValue = "",
  placeholder,
  containerId,
}: BootstrapDatepickerProps) => {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("days");
  // 표시 중인 달/연도 기준. 값이 유효하면 그 달, 아니면 오늘.
  const [viewDate, setViewDate] = useState<Date>(() => parseYmd(defaultValue) ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫힘 (bootstrap-datepicker autoclose=false 기본: 날짜 선택으로는 닫히지 않음)
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setView("days");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openPicker = () => {
    const parsed = parseYmd(value);
    if (parsed) setViewDate(parsed);
    setView("days");
    setOpen(true);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const selectDay = (d: Date) => {
    setValue(formatYmd(d));
    setViewDate(d);
  };

  const selected = parseYmd(value);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // days 뷰: weekStart=0 기준 6주(42칸) 그리드
  const dayCells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startOffset = first.getDay(); // weekStart=0
    const cells: Date[] = [];
    for (let i = 0; i < 42; i += 1) {
      cells.push(new Date(viewYear, viewMonth, 1 - startOffset + i));
    }
    return cells;
  }, [viewYear, viewMonth]);

  const decadeStart = Math.floor(viewYear / 10) * 10;

  return (
    <div className="position-relative" id={containerId} ref={containerRef}>
      <input
        type="text"
        className="form-control"
        id={id}
        name={name}
        value={value}
        onChange={onInputChange}
        onFocus={openPicker}
        onClick={openPicker}
        autoComplete="off"
        placeholder={placeholder}
      />
      {open && (
        <div
          className="datepicker datepicker-dropdown dropdown-menu datepicker-orient-left datepicker-orient-top"
          style={{ display: "block", top: "100%", left: 0 }}
        >
          {view === "days" && (
            <div className="datepicker-days" style={{ display: "block" }}>
              <table className="table-condensed">
                <thead>
                  <tr>
                    <th
                      className="prev"
                      onClick={() => setViewDate(new Date(viewYear, viewMonth - 1, 1))}
                    >
                      «
                    </th>
                    <th className="datepicker-switch" colSpan={5} onClick={() => setView("months")}>
                      {MONTHS[viewMonth]} {viewYear}
                    </th>
                    <th
                      className="next"
                      onClick={() => setViewDate(new Date(viewYear, viewMonth + 1, 1))}
                    >
                      »
                    </th>
                  </tr>
                  <tr>
                    {DOW.map((d) => (
                      <th key={d} className="dow">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }, (_, week) => (
                    <tr key={week}>
                      {dayCells.slice(week * 7, week * 7 + 7).map((d) => {
                        const diff = monthIndex(d) - (viewYear * 12 + viewMonth);
                        const classes = ["day"];
                        if (diff < 0) classes.push("old");
                        else if (diff > 0) classes.push("new");
                        if (selected && formatYmd(d) === formatYmd(selected))
                          classes.push("active");
                        return (
                          <td
                            key={formatYmd(d)}
                            className={classes.join(" ")}
                            onClick={() => selectDay(d)}
                          >
                            {d.getDate()}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "months" && (
            <div className="datepicker-months" style={{ display: "block" }}>
              <table className="table-condensed">
                <thead>
                  <tr>
                    <th
                      className="prev"
                      onClick={() => setViewDate(new Date(viewYear - 1, viewMonth, 1))}
                    >
                      «
                    </th>
                    <th className="datepicker-switch" colSpan={5} onClick={() => setView("years")}>
                      {viewYear}
                    </th>
                    <th
                      className="next"
                      onClick={() => setViewDate(new Date(viewYear + 1, viewMonth, 1))}
                    >
                      »
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7}>
                      {MONTHS_SHORT.map((mo, idx) => {
                        const classes = ["month"];
                        if (
                          selected &&
                          selected.getFullYear() === viewYear &&
                          selected.getMonth() === idx
                        ) {
                          classes.push("active");
                        }
                        return (
                          <span
                            key={mo}
                            className={classes.join(" ")}
                            onClick={() => {
                              setViewDate(new Date(viewYear, idx, 1));
                              setView("days");
                            }}
                          >
                            {mo}
                          </span>
                        );
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {view === "years" && (
            <div className="datepicker-years" style={{ display: "block" }}>
              <table className="table-condensed">
                <thead>
                  <tr>
                    <th
                      className="prev"
                      onClick={() => setViewDate(new Date(viewYear - 10, viewMonth, 1))}
                    >
                      «
                    </th>
                    <th className="datepicker-switch" colSpan={5}>
                      {decadeStart}-{decadeStart + 9}
                    </th>
                    <th
                      className="next"
                      onClick={() => setViewDate(new Date(viewYear + 10, viewMonth, 1))}
                    >
                      »
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7}>
                      {Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i).map((yr) => {
                        const classes = ["year"];
                        if (yr < decadeStart || yr > decadeStart + 9) classes.push("old");
                        if (selected && selected.getFullYear() === yr) classes.push("active");
                        return (
                          <span
                            key={yr}
                            className={classes.join(" ")}
                            onClick={() => {
                              setViewDate(new Date(yr, viewMonth, 1));
                              setView("months");
                            }}
                          >
                            {yr}
                          </span>
                        );
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
