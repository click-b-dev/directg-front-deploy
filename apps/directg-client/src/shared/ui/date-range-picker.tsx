"use client";

import { useEffect, useRef } from "react";

// legacy bootstrap-daterangepicker(moment/jQuery) — 실제 vendor 로드로 UI·동작 100% 재현(개발자 승인).
// legacy와 동일 CDN: jQuery 3.7.1(SRI) + moment(jsdelivr latest) + daterangepicker(jsdelivr). 이 페이지에서만 로드(page-scoped).
// CSS(daterangepicker.css CDN + daterangepicker-dark.css)는 screen이 <link>로 로드. 초기화는 legacy 인라인 스크립트 동형.

interface MomentInstance {
  subtract(amount: number, unit: string): MomentInstance;
  startOf(unit: string): MomentInstance;
  endOf(unit: string): MomentInstance;
  format(fmt: string): string;
}
type MomentStatic = (...args: unknown[]) => MomentInstance;

interface JQueryElementLike {
  data(key: string): unknown;
  daterangepicker(
    options: Record<string, unknown>,
    cb: (start: MomentInstance, end: MomentInstance) => void,
  ): JQueryElementLike;
  html(value: string): void;
  val(value: string): void;
}
interface JQueryLike {
  (target: Element | string): JQueryElementLike;
  fn: { daterangepicker?: unknown };
}

declare global {
  interface Window {
    jQuery?: JQueryLike;
    moment?: MomentStatic;
  }
}

const JQUERY_SRC = "https://code.jquery.com/jquery-3.7.1.min.js";
const JQUERY_INTEGRITY = "sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=";
const MOMENT_SRC = "https://cdn.jsdelivr.net/momentjs/latest/moment.min.js";
const DRP_SRC = "https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js";

const loadScript = (src: string, integrity?: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error(`load fail: ${src}`)));
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = "anonymous";
    }
    script.async = false; // 순차 로드(jQuery→moment→daterangepicker) 보장
    script.dataset.loaded = "false";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(`load fail: ${src}`)));
    document.body.appendChild(script);
  });

type DateRangePickerProps = {
  startName: string;
  endName: string;
  initialStart: string;
  initialEnd: string;
  /** 폼 GET action(legacy PHP_SELF). */
  action: string;
  /** daterangepicker showCustomRangeLabel(legacy 화면별 상이: refund=false, retail=미설정→기본 true). */
  showCustomRangeLabel?: boolean;
};

/**
 * storefront 기간검색 위젯 (legacy `mypage_refund.html` 카드 본문). 라벨 + reportrange 박스 + 폼(시작~종료 + 검색).
 * 실제 daterangepicker vendor를 로드해 legacy 인라인 스크립트를 동형 재현(프리셋 + 2개월 달력 + Cancel/Apply).
 */
export const DateRangePicker = ({
  startName,
  endName,
  initialStart,
  initialEnd,
  action,
  showCustomRangeLabel = false,
}: DateRangePickerProps) => {
  const inited = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadScript(JQUERY_SRC, JQUERY_INTEGRITY);
      await loadScript(MOMENT_SRC);
      await loadScript(DRP_SRC);
      if (cancelled) return;

      const $ = window.jQuery;
      const moment = window.moment;
      if (!$ || !moment || !$.fn.daterangepicker) return;
      if (inited.current) return;
      const box = $("#reportrange");
      if (box.data("daterangepicker")) return;
      inited.current = true;

      // legacy 인라인 스크립트 동형
      const cb = (start: MomentInstance, end: MomentInstance) => {
        $("#reportrange2").html(`${start.format("YYYY-MM-DD")} - ${end.format("YYYY-MM-DD")}`);
        $(`#${startName}`).val(start.format("YYYY-MM-DD"));
        $(`#${endName}`).val(end.format("YYYY-MM-DD"));
      };
      const start = moment().subtract(29, "days");
      const end = moment();
      box.daterangepicker(
        {
          startDate: start,
          endDate: end,
          showCustomRangeLabel,
          ranges: {
            오늘: [moment(), moment()],
            어제: [moment().subtract(1, "days"), moment().subtract(1, "days")],
            "지난 7일": [moment().subtract(6, "days"), moment()],
            "지난 30일": [moment().subtract(29, "days"), moment()],
            이번달: [moment().startOf("month"), moment().endOf("month")],
            지난달: [
              moment().subtract(1, "month").startOf("month"),
              moment().subtract(1, "month").endOf("month"),
            ],
            올해: [moment().startOf("year"), moment()],
          },
          cancelClass: "btn-danger",
          alwaysShowCalendars: true,
        },
        cb,
      );
    })().catch(() => {
      /* CDN 로드 실패 시 무시 — 폼 수동 입력 fallback */
    });
    return () => {
      cancelled = true;
    };
  }, [startName, endName, showCustomRangeLabel]);

  return (
    <div className="d-flex">
      <label
        htmlFor="search_payment_method"
        className="col-sm-1 col-form-label text-center border-end"
      >
        기간검색
      </label>
      <div
        id="reportrange"
        className="col-sm-3 rounded-0 align-content-center text-center border-end"
        data-toggle="date-picker-range"
        data-target-display="#reportrange2"
        data-cancel-class="btn-light"
      >
        <i className="mdi mdi-calendar"></i>&nbsp;
        <span id="reportrange2">
          {initialStart} - {initialEnd}
        </span>{" "}
        <i className="mdi mdi-menu-down"></i>
      </div>
      <div className="col-sm-9 p-0 rounded-0">
        <form className="input-group" method="get" action={action}>
          <div className="d-flex">
            <input
              type="text"
              className="form-control rounded-0 border-0 border-end"
              id={startName}
              name={startName}
              placeholder="시작일자"
              defaultValue={initialStart}
              readOnly
            />
            <span className="input-group-text rounded-0 border-0 border-end">~</span>
            <input
              type="text"
              className="form-control rounded-0 border-0 border-end"
              id={endName}
              name={endName}
              placeholder="종료일자"
              defaultValue={initialEnd}
              readOnly
            />
          </div>
          <div className="">
            <button className="btn btn-primary btn-xl font-14 mx-2 px-2" type="submit">
              검색
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
