import { useEffect, useRef, useState } from "react";

// legacy bootstrap-daterangepicker(moment 기반, jQuery 플러그인) 재현.
// order 영역 공통 기간검색 위젯. 앱에 jQuery/moment/daterangepicker 부재 → React로 동작 재현(개발자 승인 A안).
// 재현 범위: 프리셋 팝업(선택/오늘/어제/지난7일/지난30일/이번달/지난달/직접선택) + date_label 폼 유지 +
//           직접선택 시 native date input 전환 + 93일/역순 검증 alert + 시작일 변경 시 종료일 picker 열기.
// 미재현(스코프): daterangepicker의 2개월 달력 그리드 — 이 화면 흐름에서 "직접선택"이 native date input으로
//           대체되므로 워크플로우 동일(order-step1.md 참조).

type DateRangePickerProps = {
  startName: string; // search_start_date
  endName: string; // search_end_date
  labelName: string; // date_label
  initialStart: string; // 진입 시 시작일(YYYY-MM-DD)
  initialEnd: string; // 진입 시 종료일(YYYY-MM-DD)
  initialLabel: string; // 진입 시 date_label
  emptyLabel?: string; // date_label 빈값일 때 표시 텍스트(legacy 화면별 상이: 대개 "선택", order_all은 "오늘")
  rangeColClassName?: string; // reportrange 박스 컬럼(legacy 화면별 상이: step/vbank=col-sm-2, order_all=col-sm-4)
  inputColClassName?: string; // 시작~종료 input-group 컬럼(step/vbank=col-sm-4, order_all=col-sm-6)
  includeAllPeriod?: boolean; // 프리셋 끝에 "전체기간"(날짜 비움) 추가(order_cancel_request 등)
  allPeriodOnly?: boolean; // 프리셋을 "전체기간" 하나만(order_old_list — 날짜 비활성, 연도로만 조회)
  presetKeys?: readonly string[]; // 화면별 프리셋 세트(배송 그룹: 선택/오늘/어제/지난 7일/지난달/지난해/직접선택)
};

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

const openNativePicker = (el: HTMLInputElement | null) => {
  if (!el) return;
  const withPicker = el as HTMLInputElement & { showPicker?: () => void };
  if (typeof withPicker.showPicker === "function") {
    try {
      withPicker.showPicker();
    } catch {
      el.focus();
    }
  } else {
    el.focus();
  }
};

const CUSTOM_LABEL = "직접선택";

export const DateRangePicker = ({
  startName,
  endName,
  labelName,
  initialStart,
  initialEnd,
  initialLabel,
  emptyLabel = "선택",
  rangeColClassName = "col-sm-2",
  inputColClassName = "col-sm-4",
  includeAllPeriod = false,
  allPeriodOnly = false,
  presetKeys,
}: DateRangePickerProps) => {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [label, setLabel] = useState(initialLabel);
  const [custom, setCustom] = useState(initialLabel === CUSTOM_LABEL);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  // 팝업 외부 클릭 시 닫기(daterangepicker 동작).
  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // legacy ranges: '선택'=진입 시 start/end, 나머지는 moment 계산 재현. 화면별 프리셋 세트는 presetKeys로 지정.
  const presetCompute: Record<string, () => [string, string] | "custom"> = {
    선택: () => [initialStart, initialEnd],
    오늘: () => {
      const t = new Date();
      return [ymd(t), ymd(t)];
    },
    어제: () => {
      const y = addDays(new Date(), -1);
      return [ymd(y), ymd(y)];
    },
    "지난 7일": () => [ymd(addDays(new Date(), -6)), ymd(new Date())],
    "지난 30일": () => [ymd(addDays(new Date(), -29)), ymd(new Date())],
    이번달: () => {
      const t = new Date();
      return [ymd(startOfMonth(t)), ymd(endOfMonth(t))];
    },
    지난달: () => {
      const prev = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
      return [ymd(startOfMonth(prev)), ymd(endOfMonth(prev))];
    },
    지난해: () => {
      const y = new Date().getFullYear() - 1;
      return [ymd(new Date(y, 0, 1)), ymd(new Date(y, 11, 31))];
    },
    [CUSTOM_LABEL]: () => "custom",
    전체기간: () => ["", ""],
  };

  // 기본 프리셋 세트(step1/all/cancel 등). presetKeys로 화면별 세트 지정(배송 그룹 등).
  const resolvedKeys = allPeriodOnly
    ? ["전체기간"]
    : [
        ...(presetKeys ?? [
          "선택",
          "오늘",
          "어제",
          "지난 7일",
          "지난 30일",
          "이번달",
          "지난달",
          CUSTOM_LABEL,
        ]),
        ...(includeAllPeriod ? ["전체기간"] : []),
      ];
  const presets = resolvedKeys.map((key) => ({ key, compute: presetCompute[key] }));

  const applyPreset = (key: string, compute: () => [string, string] | "custom") => {
    const range = compute();
    setLabel(key);
    setOpen(false);
    if (range === "custom") {
      // 직접선택: date input 편집 가능 전환(값 유지) + native picker 유도.
      setCustom(true);
      window.requestAnimationFrame(() => openNativePicker(startRef.current));
      return;
    }
    setCustom(false);
    setStart(range[0]);
    setEnd(range[1]);
  };

  // legacy checkDateRange: 종료<시작 → 종료 초기화, 차이>93 → 변경한 쪽 초기화.
  const handleStartChange = (value: string) => {
    setStart(value);
    window.requestAnimationFrame(() => openNativePicker(endRef.current)); // endDateOpen()
    if (value && end) {
      const diff = dayDiff(value, end);
      if (diff < 0) {
        window.alert("종료일이 시작일보다 빠를 수 없습니다.");
        setEnd("");
      } else if (diff > 93) {
        window.alert(`조회 기간은 최대 93일을 초과할 수 없습니다.\n현재 선택 기간: ${diff}일`);
        setStart("");
      }
    }
  };

  const handleEndChange = (value: string) => {
    setEnd(value);
    if (start && value) {
      const diff = dayDiff(start, value);
      if (diff < 0) {
        window.alert("종료일이 시작일보다 빠를 수 없습니다.");
        setEnd("");
      } else if (diff > 93) {
        window.alert(`조회 기간은 최대 93일을 초과할 수 없습니다.\n현재 선택 기간: ${diff}일`);
        setEnd("");
      }
    }
  };

  const inputType = custom ? "date" : "text";

  return (
    // legacy: reportrange 박스 컬럼 + input-group 컬럼이 형제(라벨과 함께 한 row를 채움).
    <>
      <div className={rangeColClassName} ref={rootRef}>
        <div style={{ position: "relative" }}>
          <div
            className="form-control"
            style={{ cursor: "pointer" }}
            onClick={() => setOpen((prev) => !prev)}
          >
            <i className="mdi mdi-calendar" />
            &nbsp;
            <span>{label || emptyLabel}</span> <i className="mdi mdi-menu-down" />
          </div>
          {open && (
            <div
              className="dropdown-menu show p-0"
              style={{ position: "absolute", top: "100%", left: 0, zIndex: 1000 }}
            >
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className="dropdown-item"
                  onClick={() => applyPreset(preset.key, preset.compute)}
                >
                  {preset.key}
                </button>
              ))}
            </div>
          )}
        </div>
        <input type="hidden" name={labelName} value={label} />
      </div>
      <div className={inputColClassName}>
        <div className="input-group">
          <input
            type={inputType}
            className="form-control"
            id={startName}
            name={startName}
            placeholder="시작일자"
            value={start}
            readOnly={!custom}
            ref={startRef}
            onChange={(event) => handleStartChange(event.target.value)}
          />
          <span className="input-group-text">~</span>
          <input
            type={inputType}
            className="form-control"
            id={endName}
            name={endName}
            placeholder="종료일자"
            value={end}
            readOnly={!custom}
            ref={endRef}
            onChange={(event) => handleEndChange(event.target.value)}
          />
        </div>
      </div>
    </>
  );
};
