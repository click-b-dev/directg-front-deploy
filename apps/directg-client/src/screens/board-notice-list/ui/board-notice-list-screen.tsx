import type { NoticeListResponse } from "@entities/board-notice";
import { ServerPagination } from "@shared/ui/server-pagination";

interface BoardNoticeListScreenProps {
  data: NoticeListResponse;
  /** 검색어(legacy `$searchValue`) — 검색 input value 유지용. */
  searchValue: string;
}

/**
 * 공지사항 목록 (legacy `pc/board/notice.html`). 정적 SSR, aside 없음.
 * 제목 검색(GET) + 서버 페이지네이션. 페이지네이션 링크는 검색어 미포함(legacy quirk: `$param` 미정의).
 */
export function BoardNoticeListScreen({ data, searchValue }: BoardNoticeListScreenProps) {
  const { list, page, totalPages } = data;

  return (
    <div className="container my-3 pb-5">
      <main>
        <h2 className="page-title mb-4">공지사항</h2>

        <div className="row g-0">
          <div className="col-12">
            <table className="table table-bordered table-centered mb-0 text-center align-middle text-nowrap">
              <thead className="table-light font-14">
                <tr>
                  {/* 구분 컬럼은 legacy에서 주석처리 */}
                  <th className="text-center table-light">제목</th>
                  <th className="text-center table-light">작성일자</th>
                  <th className="text-center table-light">조회수</th>
                </tr>
              </thead>
              <tbody className="font-14 table-dark">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center">
                      등록된 게시물이 없습니다.
                    </td>
                  </tr>
                ) : (
                  list.map((value) => (
                    <tr key={value.idx}>
                      <td className="text-start py-2">
                        <a
                          href={`/board/notice_view?idx=${value.idx}`}
                          className="text-white link-underline link-underline-opacity-0"
                        >
                          {value.subject}
                        </a>
                      </td>
                      <td className="text-center py-2">{value.deploy_date.slice(0, 10)}</td>
                      <td className="text-center py-2">{value.hit.toLocaleString("en-US")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="row g-0">
          <div className="my-3">
            <div id="pagination" className="mt-4">
              <ServerPagination page={page} totalPages={totalPages} baseUrl="/board/notice" />
            </div>
          </div>
        </div>

        <div className="row g-0">
          <div className="offset-4 col-4">
            <form method="GET" action="">
              <div className="row g-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="searchValue"
                    placeholder="제목"
                    aria-label=""
                    defaultValue={searchValue}
                  />
                  <button className="btn btn-dark btn-lg shadow-none" type="submit">
                    검색
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
