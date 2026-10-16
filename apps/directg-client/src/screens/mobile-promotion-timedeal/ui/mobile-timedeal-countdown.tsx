"use client";

import { useEffect, useRef } from "react";

// legacy `mobile/promotion/timedeal.html` 카운트다운(jQuery countdownTimer 플러그인) — 실제 vendor 로드로
// 동작 재현. jQuery 3.7.1(PC time-deal 선례 CDN/SRI) + public/mobile-assets 무수정 복사 vendor를 page-scoped
// 로드 후 legacy 인라인 동형 초기화. 모바일은 D:H:M:S 중 H·M·S 3개 span만($2 $3 $4, PC는 4개).

interface CountdownJQueryElement {
  countdowntimer(options: Record<string, unknown>): void;
}
interface CountdownJQuery {
  (selector: string): CountdownJQueryElement;
  fn: { countdowntimer?: unknown };
}
const getJQuery = (): CountdownJQuery | undefined =>
  (window as unknown as { jQuery?: CountdownJQuery }).jQuery;

const JQUERY_SRC = "https://code.jquery.com/jquery-3.7.1.min.js";
const JQUERY_INTEGRITY = "sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=";
const COUNTDOWN_SRC = "/mobile-assets/js/jquery.countdownTimer.js";

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
    script.async = false; // 순차 로드(jQuery → 플러그인) 보장
    script.dataset.loaded = "false";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(`load fail: ${src}`)));
    document.body.appendChild(script);
  });

/** legacy date('Y-m-d H:i:s') 동형(로컬 tz) — startDate용. */
const formatNow = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

/**
 * 모바일 타임딜 카운트다운 (legacy `#given_date` countdowntimer 초기화 동형).
 * dateAndTime=이벤트 end_dt('Y-m-d H:i:s' 문자열 그대로). H:M:S 3개 `.countdown` span으로 치환.
 */
export function MobileTimedealCountdown({ endDateTime }: { endDateTime: string }) {
  const inited = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadScript(JQUERY_SRC, JQUERY_INTEGRITY);
      await loadScript(COUNTDOWN_SRC);
      if (cancelled || inited.current) return;
      const $ = getJQuery();
      if (!$ || !$.fn.countdowntimer) return;
      inited.current = true;

      // legacy 인라인 스크립트 동형(모바일: $2 $3 $4 = H M S 3 span)
      $("#given_date").countdowntimer({
        regexpMatchFormat: "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})",
        regexpReplaceWith:
          "<span class='countdown'>$2</span> <span class='countdown'>$3</span> <span class='countdown'>$4</span>",
        startDate: formatNow(),
        dateAndTime: endDateTime,
        size: "xl",
      });
    })().catch(() => {
      /* CDN/플러그인 로드 실패 시 무시 — 카운트다운만 미표시 */
    });
    return () => {
      cancelled = true;
    };
  }, [endDateTime]);

  return <span id="given_date"></span>;
}
