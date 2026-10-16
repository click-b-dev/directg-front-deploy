import { useEffect, useRef } from "react";
import { useDataroomDetail } from "@entities/dataroom";

export type DataroomViewSearch = { idx: number };

// legacy board/dataroom_view.php — 자료실 파일 상세(read-only).
export const DataroomViewScreen = ({ idx }: DataroomViewSearch) => {
  const { data } = useDataroomDetail(idx);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "자료실 파일 상세보기";
  }, []);

  if (!data) {
    return null;
  }

  // legacy btn_goods_find: 빈값 alert만 재현(검색은 dararoom_ps.php 오타+빈 케이스 dead).
  const handleProductSearch = () => {
    if ((searchRef.current?.value ?? "") === "") {
      window.alert("검색할 대표상품명을 입력해주세요.");
    }
    // 그 외: legacy는 존재하지 않는 dararoom_ps.php로 POST(dead) → no-op.
  };

  return (
    <>
      <style>{`#content img { width: 100%; }`}</style>

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
                <li className="breadcrumb-item active">자료실 파일 상세보기</li>
              </ol>
            </div>
            <h4 className="page-title">자료실 파일 상세보기</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-8">
          <table className="table table-bordered table-centered table-sm">
            <tbody className="bg-white font-14">
              <tr>
                <th className="bg-secondary text-white" scope="row" style={{ width: "15%" }}>
                  파일유형
                </th>
                <td className="">{data.file_type === "P" ? "한글패치" : "컨텐츠"}</td>
              </tr>
              <tr>
                <th className="bg-secondary text-white" scope="row">
                  제공 파일명
                </th>
                <td>{data.file_name}</td>
              </tr>
              <tr>
                <th className="bg-secondary text-white" scope="row">
                  제공 파일 URL
                </th>
                <td>{data.file_url}</td>
              </tr>
              <tr>
                <th className="bg-secondary text-white" scope="row">
                  설명
                </th>
                <td dangerouslySetInnerHTML={{ __html: data.contents_html }} />
              </tr>
              <tr>
                <th className="bg-secondary text-white" scope="row">
                  암호화 여부
                </th>
                <td>{data.is_encode}</td>
              </tr>
              <tr>
                <th className="bg-secondary text-white" scope="row">
                  암호화 방식
                </th>
                <td>{data.encode_type}</td>
              </tr>
              <tr>
                <th className="bg-secondary text-white" scope="row">
                  제공조건
                </th>
                <td>{data.is_free}</td>
              </tr>
              <tr>
                <th className="bg-secondary text-white" scope="row">
                  배포일자
                </th>
                <td>{data.deploy_date}</td>
              </tr>
              <tr>
                <th className="bg-secondary text-white" scope="row">
                  썸네일
                </th>
                <td>
                  <img src={`/upload/dataroom/${data.thumbnail}`} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-4">
          {/* legacy: is_free=="N"(유료)일 때만. 제공상품 목록은 항상 비어있음(데이터 미조회 dead). */}
          {data.is_free === "N" && (
            <div className="card">
              <h5 className="card-header bg-secondary text-white">자료실 제공상품 설정</h5>
              <div className="card-body p-2">
                <div className="card mb-2" />
              </div>
              <div className="card-footer px-2">
                <div className="row g-2 mb-0">
                  <div className="col-9">
                    <input
                      ref={searchRef}
                      type="text"
                      className="form-control form-control-sm"
                      name="search_value"
                      id="search_value"
                      placeholder="검색할 옵션상품명을 입력해 주세요"
                    />
                  </div>
                  <div className="col-3">
                    <button
                      type="button"
                      className="btn btn-dark btn-sm shadow-none"
                      id="btn_goods_find"
                      data-idx={data.idx}
                      onClick={handleProductSearch}
                    >
                      옵션상품 검색
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="card">
            <h5 className="card-header bg-secondary text-white">수정이력</h5>
            <div className="card-body p-1">
              <table className="table table-bordered table-centered mb-0 table-sm">
                <thead className="font-14">
                  <tr>
                    <th className="text-center">수정일자</th>
                    <th className="text-center">수정자</th>
                  </tr>
                </thead>
                <tbody className="font-14">
                  <tr>
                    <td />
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
