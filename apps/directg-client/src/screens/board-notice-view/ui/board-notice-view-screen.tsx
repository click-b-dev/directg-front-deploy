import type { NoticeView } from "@entities/board-notice";

interface BoardNoticeViewScreenProps {
  data: NoticeView;
}

/**
 * 공지사항 상세 (legacy `pc/board/notice_view.html`). SSR, aside 없음.
 * 본문은 백엔드 렌더 HTML(contents_html: Parsedown + br)을 그대로 출력. 페이지 CSS 로드.
 */
export function BoardNoticeViewScreen({ data }: BoardNoticeViewScreenProps) {
  return (
    <>
      <link rel="stylesheet" href="/assets/css/page/notice-view-inline.css" />
      <div className="container my-3 pb-5">
        <main>
          <div className="row">
            <div className="col-12">
              <article className="blog-post">
                <h2 className="h2 mb-3">{data.subject}</h2>
                <p className="blog-post-meta font-12">
                  {data.deploy_date} by <span>다이렉트 게임즈</span>
                </p>
                <hr />
                <div
                  className="blog-contents font-14"
                  dangerouslySetInnerHTML={{ __html: data.contents_html }}
                />
              </article>

              <hr className="mb-3" />

              <nav className="blog-pagination" aria-label="Pagination">
                {/* 이전글/다음글은 legacy에서 주석처리 */}
                <a
                  href="notice"
                  className="btn btn-lg btn-outline-light rounded-0 "
                  aria-disabled="true"
                >
                  목록
                </a>
              </nav>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
