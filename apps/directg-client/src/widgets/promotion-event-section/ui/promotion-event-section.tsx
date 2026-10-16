import { getPromotionEvents } from "@entities/event";

/**
 * 주말특가 W-4 — 진행중인 이벤트 섹션 (legacy promotion_weekend.html 280–307).
 * getPromotionEvents(show_promotion=Y) + 이벤트 카드(event 목록과 동일 마크업, mb-3).
 * ⚠️ legacy는 이 섹션에 `.event_contents li` inline style 없음(event.html과 차이) — verbatim.
 */
export async function PromotionEventSection() {
  const { list } = await getPromotionEvents();

  return (
    <section className="mb-3">
      <div className="container">
        <div className="d-flex flex-row align-items-start">
          <h2 className="fw-bold">진행중인 이벤트</h2>
          <a
            href="/event/event"
            className="ms-3 text-decoration-none font-14 bg-primary rounded-2 px-3 py-1"
          >
            전체보기
          </a>
        </div>
        {list.map((value, index) => (
          <div className="card mb-3 rounded-0" key={index}>
            <div className="row g-0">
              <div className="col-md-5">
                <a href={value.event_link_url} target={value.event_link_target}>
                  <img
                    src={value.event_banner}
                    className="img-fluid rounded-0 h-100"
                    alt={value.subject}
                  />
                </a>
              </div>
              <div className="col-md-7">
                <div className="card-body">
                  <h4 className="card-title mb-3">■ {value.subject}</h4>
                  <div
                    className="event_contents"
                    dangerouslySetInnerHTML={{ __html: value.contents_html }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="b-example-divider"></div>
    </section>
  );
}
