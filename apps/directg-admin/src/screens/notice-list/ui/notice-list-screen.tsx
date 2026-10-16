import {
  useNoticeList,
  useDeleteNotice,
  type NoticeListSearch,
  type NoticeListItem,
} from "@entities/notice";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/board/notice_list";

// 테이블 셀 구분 라벨($gubun_array). 필터 radio 라벨과 2번이 상이(legacy quirk).
const GUBUN_LABELS: Record<string, string> = {
  "1": "제품코드(키) 발송",
  "2": "프로모션/이벤트",
  "3": "상품 출시/판매",
  "4": "기타",
};

// 검색필터 radio 라벨(2=프로모션 — 테이블 셀의 프로모션/이벤트와 상이, legacy 원문 유지).
const NOTICE_TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "1", label: "제품코드(키) 발송" },
  { value: "2", label: "프로모션" },
  { value: "3", label: "상품 출시/판매" },
  { value: "4", label: "기타" },
];

// legacy board/notice_list.php — 공지사항 목록(+삭제).
export const NoticeListScreen = (search: NoticeListSearch) => {
  const { data } = useNoticeList(search);
  const deleteMutation = useDeleteNotice();

  const handleDelete = (idx: number) => {
    // legacy: confirm("정말로 삭제하시겠습니까?") → notice_ps.php mode=delete → location.reload()
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      deleteMutation.mutate(idx);
    }
  };

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
                    공지사항 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">공지사항 목록</li>
              </ol>
            </div>
            <h4 className="page-title">공지사항 목록</h4>
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
                    {/* legacy: 구분 label의 for="search_title_id"(존재하지 않는 id, 복붙 quirk) 유지 */}
                    <label
                      htmlFor="search_title_id"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      구분
                    </label>
                    <div className="col-sm-9">
                      {NOTICE_TYPE_FILTERS.map((f) => (
                        <div className="form-check form-check-inline mt-2" key={f.value}>
                          <input
                            type="radio"
                            id={`search_notice_type_${f.value}`}
                            name="search_notice_type"
                            className="form-check-input"
                            value={f.value}
                            defaultChecked={search.search_notice_type === f.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_notice_type_${f.value}`}
                          >
                            {f.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="row">
                    <label
                      htmlFor="search_title"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      제목
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_title"
                        name="search_title"
                        placeholder="제목검색"
                        defaultValue={search.search_title}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      공지사항 검색
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
            <table
              className="table table-centered w-100 dt-responsive nowrap table-sm table-bordered"
              id=""
            >
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center all" style={{ width: "20px" }}>
                    <div className="form-check text-center">
                      <input type="checkbox" className="form-check-input" id="customCheck1" />
                      <label className="form-check-label" htmlFor="customCheck1">
                        &nbsp;
                      </label>
                    </div>
                  </th>
                  <th className="text-center" style={{ width: "70px" }}>
                    고유번호
                  </th>
                  <th className="text-center" style={{ width: "130px" }}>
                    구분
                  </th>
                  <th className="text-center">제목</th>
                  <th className="text-center" style={{ width: "150px" }}>
                    작성일자
                    <br />
                    (수정일자)
                  </th>
                  <th className="text-center" style={{ width: "150px" }}>
                    배포일자
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    노출
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    조회수
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    비고
                  </th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {data.items.map((item) => (
                  <NoticeRow key={item.idx} item={item} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{
                search_title: search.search_title,
                search_notice_type: search.search_notice_type,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const NoticeRow = ({
  item,
  onDelete,
}: {
  item: NoticeListItem;
  onDelete: (idx: number) => void;
}) => (
  <tr>
    <td className="text-center">
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id={`idx${item.idx}`}
          name="idx"
          value={item.idx}
        />
        <label className="form-check-label" htmlFor="idx">
          &nbsp;
        </label>
      </div>
    </td>
    <td className="text-center px-1">{item.idx}</td>
    <td className="text-center px-1">{GUBUN_LABELS[item.notice_type]}</td>
    <td className="text-start px-1">
      {item.is_notice === "Y" && <span className="badge badge-outline-danger">공지</span>}{" "}
      {item.subject}
    </td>
    <td className="text-center px-1">{item.reg_date}</td>
    <td className="text-center px-1">{item.deploy_date}</td>
    <td className="text-center px-1">{item.is_view === "Y" ? "O" : "X"}</td>
    <td className="text-center px-1">{item.hit.toLocaleString()}</td>
    <td className="text-center px-1">
      <a href={`/board/notice_view?idx=${item.idx}`} className="action-icon">
        {" "}
        <i className="mdi mdi-eye" />
      </a>
      <a href={`/board/notice_register?mode=modify&idx=${item.idx}`} className="action-icon">
        {" "}
        <i className="mdi mdi-square-edit-outline" />
      </a>
      <a
        href="#"
        className="action-icon btn_delete"
        data-idx={item.idx}
        onClick={(e) => {
          e.preventDefault();
          onDelete(item.idx);
        }}
      >
        <i className="mdi mdi-delete" />
      </a>
    </td>
  </tr>
);
