import type { EventListResponse } from "@entities/event";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

interface MobileEventListScreenProps {
  data: EventListResponse;
}

/** legacy `mobile/event/event.html` page-specific inline style. */
const MOBILE_EVENT_CSS = `
.event_contents ul{
	padding-left:1rem;
	margin-bottom:0;
}

.event_contents li{
	font-size:12px;
}

.event_contents strong{
	font-size:12px;
	margin-top:10px;
}

.event_contents p{
	font-size:12px;
	margin-bottom:0;
}
`;

/**
 * 모바일 이벤트 목록 (legacy `mobile/event/event.html`).
 * 공개 SSR. PC `entities/event` 계약을 재사용하고 모바일 카드 마크업만 별도 재현한다.
 */
export function MobileEventListScreen({ data }: MobileEventListScreenProps) {
  return (
    <>
      <style>{MOBILE_EVENT_CSS}</style>
      <MobileSubHeader pageTitle="이벤트" />
      <div id="appCapsuleSub" className="full-height">
        <div className="section mt-2 pt-2">
          {data.list.map((value, index) => (
            <div className="card mb-3" key={index}>
              <a href={value.event_link_url} target={value.event_link_target}>
                <img
                  src={value.event_banner}
                  className="card-img-top rounded-0"
                  alt={value.subject}
                />
              </a>
              <div className="card-body p-2">
                <h5 className="card-title font-16">■ {value.subject}</h5>
                <div
                  className="event_contents"
                  dangerouslySetInnerHTML={{ __html: value.contents_html }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
