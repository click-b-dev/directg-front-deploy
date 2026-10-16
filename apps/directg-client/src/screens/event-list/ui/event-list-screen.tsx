import type { EventListResponse } from "@entities/event";

interface EventListScreenProps {
  data: EventListResponse;
}

/** legacy breadcrumb divider SVG(회색 chevron) — event.html `--bs-breadcrumb-divider` 인라인. */
const BREADCRUMB_DIVIDER =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%236c757d'/%3E%3C/svg%3E\")";

/**
 * 이벤트 목록 (legacy `pc/event/event.html`). 공개 SSR.
 * breadcrumb + 진행중 이벤트 카드 반복(배너 링크 + Parsedown 본문). 인터랙션 없음.
 */
export function EventListScreen({ data }: EventListScreenProps) {
  const { list } = data;

  return (
    <>
      {/* legacy page-specific inline: Parsedown이 생성하는 목록 li 간격 */}
      <style>{`.event_contents li{margin-bottom:5px;}`}</style>

      <div className="container mt-3">
        <nav
          style={{ ["--bs-breadcrumb-divider" as string]: BREADCRUMB_DIVIDER }}
          aria-label="breadcrumb"
        >
          <ol className="breadcrumb font-14">
            <li className="breadcrumb-item">
              <a href="/" className="text-decoration-none" title="다이렉트 게임즈">
                다이렉트 게임즈
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              이벤트
            </li>
          </ol>
        </nav>
      </div>

      <div className="container my-3 pb-5">
        <main>
          <section id="content" className="content rounded-0">
            {list.map((value, index) => (
              <div className="card mb-4 rounded-0" key={index}>
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
          </section>
        </main>
      </div>
    </>
  );
}
