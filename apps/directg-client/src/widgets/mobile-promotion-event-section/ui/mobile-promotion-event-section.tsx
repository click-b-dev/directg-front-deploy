import type { EventItem } from "@entities/event";

/** legacy head `.event_contents` 인라인 스타일(ul padding / li font-size). */
const EVENT_CONTENTS_CSS = `
.event_contents ul{
	padding-left:1rem;
	margin-bottom:0;
}
.event_contents li{
	font-size:12px;
}
`;

/**
 * 모바일 프로모션 "진행중인 이벤트" 섹션 (weekend W-4 / season S-4 공유).
 * legacy `mobile/promotion/promotion_weekend.html`·`promotion_season.html` 진행중인 이벤트 블록 — 동일 마크업.
 * `getPromotionEvents`(show_promotion=Y) 재사용. 이벤트 카드(배너 링크 + subject + contents_html) + 전체보기.
 * contents_html은 백엔드 Parsedown 렌더 결과 → dangerouslySetInnerHTML. server 컴포넌트.
 */
export function MobilePromotionEventSection({ events }: { events: EventItem[] }) {
  return (
    <div className="section full mb-3">
      <style dangerouslySetInnerHTML={{ __html: EVENT_CONTENTS_CSS }} />
      <div className="section-title py-2 px-2">
        <div className="d-flex justify-content-between align-items-center w-100">
          <h2 className="mb-0 font-16">진행중인 이벤트</h2>
          <a href="/event/event" className="btn btn-outline-primary btn-allview">
            전체보기
          </a>
        </div>
      </div>
      <div className="wide-block full px-2 bg-transparent border-0">
        {events.map((event, index) => (
          <div className="card product-card mb-2 bg-transparent" key={index}>
            <a href={event.event_link_url} target={event.event_link_target}>
              <img
                src={event.event_banner}
                className="card-img-top rounded-0"
                alt={event.subject}
              />
            </a>
            <div className="card-body p-1">
              <h5 className="card-title font-14">■ {event.subject}</h5>
              <div
                className="event_contents"
                dangerouslySetInnerHTML={{ __html: event.contents_html }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
