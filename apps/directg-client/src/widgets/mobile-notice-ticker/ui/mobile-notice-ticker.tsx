"use client";

import { useSplide } from "@shared/lib/use-splide";
import type { Notice } from "@entities/notice";

/** legacy index.php notice splide 옵션(ttb loop autoplay 3s). extension 없이 mount. */
const NOTICE_OPTIONS = {
  type: "loop",
  perPage: 1,
  rewind: true,
  arrows: false,
  direction: "ttb",
  drag: true,
  dragMinThreshold: { mouse: 0, touch: 10 },
  wheel: true,
  releaseWheel: true,
  wheelSleep: 100,
  height: "2rem",
  focus: "center",
  pagination: false,
  autoplay: true,
  interval: 3000,
};

/**
 * 모바일 공지 티커 (legacy index.php `#notice_section`). `getNotices(3)` 재사용.
 * 세로(ttb) 루프 티커 — 날짜(0,10) + 제목 + notice_view 링크.
 */
export function MobileNoticeTicker({ notices }: { notices: Notice[] }) {
  const ref = useSplide<HTMLDivElement>(NOTICE_OPTIONS);

  return (
    <section id="notice_section">
      <div className="container">
        <div className="col-12 border-primary d-flex border-1 border-solid notice_div">
          <div className="notice_icon align-content-center">
            <img src="/mobile-assets/img/icon/mingcute_notification-fill.svg" className="h-75" />
          </div>
          <div id="notice" className="splide h-100 text-truncate" ref={ref}>
            <div className="splide__track">
              <ul className="splide__list">
                {notices.map((notice) => (
                  <li className="splide__slide" key={notice.idx}>
                    <div className="splide__slide__container news-item align-content-center text-truncate">
                      <a href={`/board/notice_view?idx=${notice.idx}`}>
                        <span className="notice_date">{notice.deploy_date.substring(0, 10)}</span>
                        <span className="notice_subject">{notice.subject}</span>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
