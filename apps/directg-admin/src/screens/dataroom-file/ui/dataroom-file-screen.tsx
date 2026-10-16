import {
  useDataroomList,
  type DataroomListSearch,
  type DataroomListItem,
} from "@entities/dataroom";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/board/dataroom_file";

// legacy board/dataroom_file.php — 자료실 파일현황.
export const DataroomFileScreen = (search: DataroomListSearch) => {
  const { data } = useDataroomList(search);
  if (!data) {
    return null;
  }

  const baseNum = (data.pagination.current_page - 1) * 30;

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
                <li className="breadcrumb-item active">자료실 파일현황</li>
              </ol>
            </div>
            <h4 className="page-title">자료실 파일현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* legacy: 검색필터 카드(빈 body — 필터 미구현) */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body" />
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-12">
          <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
          <div className="float-end">
            <a href="/board/dataroom_register" className="btn btn-danger shadow-none">
              자료실 파일 등록
            </a>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table
              className="table table-centered w-100 dt-responsive nowrap table-sm table-bordered"
              id=""
            >
              <thead className="table-light font-14">
                <tr>
                  <th className="text-center" style={{ width: "50px" }}>
                    번호
                  </th>
                  <th className="text-center" style={{ width: "130px" }}>
                    파일유형
                  </th>
                  <th className="text-center">제공 파일명</th>
                  <th className="text-center" style={{ width: "90px" }}>
                    암호화 여부
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    암호화 방식
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    제공조건
                  </th>
                  <th className="text-center" style={{ width: "150px" }}>
                    배포일자
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    다운로드 수
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    비고
                  </th>
                </tr>
              </thead>
              <tbody className="font-12">
                {data.items.map((item, i) => (
                  <DataroomRow key={item.idx} item={item} num={baseNum + i + 1} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const DataroomRow = ({ item, num }: { item: DataroomListItem; num: number }) => (
  <tr>
    <td className="text-center px-1">{num}</td>
    <td className="text-center px-1">{item.file_type === "P" ? "한글패치" : "컨텐츠"}</td>
    <td className="text-start px-1">{item.file_name}</td>
    <td className="text-center px-1">{item.is_encode}</td>
    <td className="text-center px-1">{item.encode_type}</td>
    <td className="text-center px-1">{item.is_free === "Y" ? "무료" : "유료"}</td>
    <td className="text-center px-1">{item.deploy_date}</td>
    <td className="text-center px-1">{item.total_download}</td>
    <td className="text-center px-1">
      <a href={`/board/dataroom_view?idx=${item.idx}`} className="action-icon" title="상세보기">
        {" "}
        <i className="mdi mdi-eye" />
      </a>
      <a
        href={`/board/dataroom_register?mode=modify&idx=${item.idx}`}
        className="action-icon"
        title="수정"
      >
        {" "}
        <i className="mdi mdi-square-edit-outline" />
      </a>
      <a
        href={item.file_url}
        target="_blank"
        rel="noreferrer"
        className="action-icon"
        title="다운로드"
      >
        <i className="mdi mdi-download" />
      </a>
    </td>
  </tr>
);
