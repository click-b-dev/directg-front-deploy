"use client";

import { useSplide } from "@shared/lib/use-splide";
import type { Notice } from "@entities/notice";

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
  height: "56px",
  focus: "center",
  pagination: false,
  autoplay: true,
  interval: 3000,
};

export function NoticeTicker({ notices }: { notices: Notice[] }) {
  const ref = useSplide<HTMLDivElement>(NOTICE_OPTIONS);

  return (
    <section id="notice_section">
      <div className="container">
        <div className="col-12 border-primary d-flex border-1 border-solid">
          <div className="splide-title col-2 text-primary fw-600 d-flex align-items-center justify-content-center gap-2">
            <a href="/board/notice" className="text-decoration-none" title="공지사항">
              <img src="/assets/images/icon/mingcute_notification-fill.svg" /> 공지사항
            </a>
          </div>
          <div id="notice" className="splide col-10" ref={ref}>
            <div className="splide__track">
              <ul className="splide__list">
                {notices.map((notice) => (
                  <li key={notice.idx} className="splide__slide">
                    <div className="splide__slide__container news-item font-16 align-content-center text-white">
                      <a href={`/board/notice_view?idx=${notice.idx}`} title={notice.subject}>
                        <span className="pe-2">{notice.deploy_date.substring(0, 10)}</span>
                        <span>{notice.subject}</span>
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
