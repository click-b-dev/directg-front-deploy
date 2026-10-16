import { useEffect } from "react";
import { useDataroomDownloadList, type DataroomDownloadSearch } from "@entities/dataroom";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/board/dataroom_download";

// legacy board/dataroom_download.php — 자료실 다운로드현황.
export const DataroomDownloadScreen = (search: DataroomDownloadSearch) => {
  const { data } = useDataroomDownloadList(search);

  useEffect(() => {
    // legacy $page_title="공지사항 목록"(복붙 quirk — breadcrumb/h4는 자료실 다운로드현황)
    document.title = "공지사항 목록";
  }, []);

  if (!data) {
    return null;
  }

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    게시판
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    자료실 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">자료실 다운로드현황</li>
              </ol>
            </div>
            <h4 className="page-title">자료실 다운로드현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-5">
                  <div className="row">
                    <label
                      htmlFor="search_title_name"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      제목
                    </label>
                    <div className="col-sm-9">
                      {/* legacy: value=$search_title_name(미정의) → 항상 빈값. 필터도 미적용 quirk. */}
                      <input
                        type="text"
                        className="form-control"
                        id="search_title_name"
                        name="search_title_name"
                        placeholder="제목검색"
                        defaultValue=""
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      다운로드현황 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-row justify-content-between mb-2">
            <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
          </div>

          <div className="table-responsive">
            <table className="table table-centered w-100 dt-responsive nowrap table-sm" id="">
              <thead className="table-light">
                <tr>
                  <th className="text-center" style={{ width: "120px" }}>
                    회원번호
                  </th>
                  <th className="text-center" style={{ width: "200px" }}>
                    ID
                  </th>
                  <th className="text-center">파일명</th>
                  <th className="text-center" style={{ width: "90px" }}>
                    다운로드 수
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => (
                  <tr key={`${item.m_no}-${item.file_name}-${i}`}>
                    <td className="text-center px-1">{item.m_no}</td>
                    <td className=" px-1">{item.m_id}</td>
                    <td className="text-center px-1">{item.file_name}</td>
                    <td className="text-center px-1">{item.download_count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{ search_title_name: search.search_title_name }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
