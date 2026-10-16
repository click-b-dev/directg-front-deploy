import { useEffect } from "react";
import {
  useDeleteMainRecommand,
  useMainRecommandList,
  useSortMainRecommand,
  type MainRecommandListItem,
} from "@entities/main-recommand";
import { ServerPagination } from "@shared/ui";
import { formatDateTime } from "@shared/lib/datetime";

type RecommandListScreenProps = {
  page: number;
  // 검색: legacy 파라미터 불일치 버그를 개발자 지시로 수정 — recommand_name 필터.
  searchRecommandName: string;
};

const BASE_URL = "/site/main_recommand";

// legacy 상태 컬럼: is_view=="Y"일 때만 표시(독립 if). 배너와 달리 상시노출 없음.
const StatusCell = ({ item }: { item: MainRecommandListItem }) => {
  const now = Math.floor(Date.now() / 1000);
  if (item.is_view !== "Y") {
    return null;
  }
  return (
    <>
      {item.recommand_start - now > 0 && <>게시예정</>}
      {item.recommand_start < now && item.recommand_end > now && (
        <span className="badge bg-success font-12">게시중</span>
      )}
      {item.recommand_end < now && <span className="badge bg-secondary font-12">게시종료</span>}
    </>
  );
};

export const RecommandListScreen = ({ page, searchRecommandName }: RecommandListScreenProps) => {
  useEffect(() => {
    document.title = "추천 및 특집 관리";
  }, []);

  const { data } = useMainRecommandList({ page, search_recommand_name: searchRecommandName });
  const sortMutation = useSortMainRecommand();
  const deleteMutation = useDeleteMainRecommand();

  const items = data?.items ?? [];
  const totalResults = data?.pagination.total_results ?? 0;
  const totalPages = data?.pagination.total_pages ?? 0;

  const handleSort = (idx: number, direction: "up" | "down") => {
    sortMutation.mutate({ idx, direction });
  };

  const handleDelete = (idx: number) => {
    // legacy: confirm("해당 추천 및 특집을 삭제하시겠습니까?")
    if (window.confirm("해당 추천 및 특집을 삭제하시겠습니까?")) {
      deleteMutation.mutate(idx);
    }
  };

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                {/* legacy: 3번째 항목이 "배너 관리"(복붙 잔재) — 그대로 이식 */}
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    사이트
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    배너 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">추천 및 특집 관리</li>
              </ol>
            </div>
            <h4 className="page-title">추천 및 특집 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 (검색: recommand_name — legacy 파라미터 불일치 버그를 개발자 지시로 수정) */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="row">
                    <label
                      htmlFor="search_recommand_name"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      추천 및 특집 제목
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_recommand_name"
                        name="search_recommand_name"
                        placeholder="추천 및 특집 제목"
                        defaultValue={searchRecommandName}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4" />
                <div className="col-lg-2">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      추천 및 특집 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{totalResults.toLocaleString()} 개</div>
        <div className="float-end">
          <div className="float-end">
            <a href="/site/main_recommand_register" className="btn btn-danger shadow-none">
              추천 및 특집 등록
            </a>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
              <colgroup>
                <col width="5%" />
                <col width="15%" />
                <col width="*" />
                <col width="30%" />
                <col width="16%" />
                <col width="6%" />
                <col width="6%" />
                <col width="8%" />
              </colgroup>
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center">순서</th>
                  <th className="text-center">추천 및 특집 배너</th>
                  <th className="text-center">추천 및 특집 제목</th>
                  <th className="text-center">추천 및 특집 상품</th>
                  <th className="text-center">기간</th>
                  <th className="text-center">상태</th>
                  <th className="text-center">노출여부</th>
                  <th className="text-center">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white font-12">
                {items.map((item) => (
                  <tr key={item.idx}>
                    <td className="text-center">
                      <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="me-2">{item.recommand_sort}</div>
                        <div className="d-flex flex-column">
                          <button
                            type="button"
                            className="btn btn-sm p-0 btn_sort_up"
                            data-idx={item.idx}
                            onClick={() => handleSort(item.idx, "up")}
                          >
                            <i className="mdi mdi-chevron-up-box mdi-24px" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm p-0 btn_sort_down"
                            data-idx={item.idx}
                            onClick={() => handleSort(item.idx, "down")}
                          >
                            <i className="mdi mdi-chevron-down-box mdi-24px" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-1">
                      <a href={item.recommand_banner_link} target="_blank" rel="noreferrer">
                        {/* legacy: alt="{recommand_title} 배너 이미지" — recommand_title은 tbl_main_recommand에 없는 컬럼 → 항상 빈값. 그대로 이식(" 배너 이미지"). */}
                        <img src={item.recommand_banner} alt=" 배너 이미지" className="img-fluid" />
                      </a>
                    </td>
                    <td>{item.recommand_name}</td>
                    <td className="text-start px-1">
                      <ul className="list-group list-group-numbered">
                        {item.goods.map((goods, goodsIndex) => (
                          <li key={goodsIndex} className="list-group-item text-start">
                            {goods.product_code} / {goods.product_name} / {goods.game_type}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="text-center px-1">
                      {formatDateTime(item.recommand_start)} ~ {formatDateTime(item.recommand_end)}
                    </td>
                    <td className="text-center px-1">
                      <StatusCell item={item} />
                    </td>
                    <td className="text-center px-1">{item.is_view}</td>
                    <td className="text-center">
                      <a
                        href={`/site/main_recommand_modify?idx=${item.idx}`}
                        className="btn btn-info btn-sm shadow-none"
                      >
                        수정
                      </a>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm shadow-none btn_delete"
                        data-idx={item.idx}
                        onClick={() => handleDelete(item.idx)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={page}
              totalPages={totalPages}
              baseUrl={BASE_URL}
              params={{ search_recommand_name: searchRecommandName }}
            />
          </div>
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};
