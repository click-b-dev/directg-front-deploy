import {
  usePromotionWeekendList,
  type PromotionWeekendListSearch,
  type PromotionWeekendListItem,
  type WeekendGoodsItem,
} from "@entities/promotion";
import { ServerPagination } from "@shared/ui";
import { formatDateTime } from "@shared/lib/datetime";

const BASE_URL = "/promotion/promotion_weekend";

// legacy promotion/promotion_weekend.php — 주말특가 프로모션 목록(이름검색 + 추천/인기게임 렌더).
export const PromotionWeekendScreen = (search: PromotionWeekendListSearch) => {
  const { data } = usePromotionWeekendList(search);

  if (!data) {
    return null;
  }

  const { total_results: total, current_page: page } = data.pagination;

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
                    프로모션
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    주말특가 프로모션 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">주말특가 프로모션 목록</li>
              </ol>
            </div>
            <h4 className="page-title">주말특가 프로모션 목록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 주말 프로모션 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">주말 프로모션 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row">
                <div className="col-lg-6 mb-2">
                  <div className="input-group row">
                    <select
                      className="form-select col-sm-3"
                      name="search_key"
                      id="search_key"
                      defaultValue={search.search_key}
                    >
                      <option value="search_name">주말 프로모션 이름</option>
                    </select>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_value"
                        name="search_value"
                        placeholder="검색어"
                        defaultValue={search.search_value}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="mb-2">{total.toLocaleString()} 개</div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table
              className="table table-centered dt-responsive nowrap table-sm table-bordered"
              id=""
            >
              <thead className="table-light">
                <tr>
                  <th className="text-center">번호</th>
                  <th className="text-center">주말특가 프로모션 이름</th>
                  <th className="text-center">주말특가 프로모션 기간</th>
                  <th className="text-center">주말특가 추천게임</th>
                  <th className="text-center">주말특가 인기게임</th>
                  <th className="text-center">노출여부</th>
                  <th className="text-center">비고</th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {total === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-3 font-14">
                      등록된 주말 프로모션이 없습니다.
                    </td>
                  </tr>
                ) : (
                  data.items.map((item, index) => (
                    <PromotionWeekendRow
                      key={item.idx}
                      item={item}
                      // legacy 번호 버그: 페이지크기 30인데 ×10로 계산(내림차순) — 원본 이식
                      no={total - (page - 1) * 10 - index}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{
                search_key: search.search_key,
                search_value: search.search_value,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// legacy: 코드/이름/게임타입 li (getGoodsOptionSearch resolve). 빈 코드도 li 렌더(quirk).
const GoodsList = ({ goods }: { goods: WeekendGoodsItem[] }) => (
  <ol className="list-group list-group-numbered">
    {goods.map((g, i) => (
      <li key={`${g.product_code}-${i}`} className="list-group-item text-start">
        {g.product_code} / {g.product_name} / {g.game_type}
      </li>
    ))}
  </ol>
);

const PromotionWeekendRow = ({ item, no }: { item: PromotionWeekendListItem; no: number }) => (
  <tr>
    <td className="text-center">{no}</td>
    <td className="text-center">
      <a href={`/promotion/promotion_weekend_view?idx=${item.idx}`}>{item.promotion_week_name}</a>
    </td>
    <td className="text-center">
      {formatDateTime(item.promotion_week_start)} ~ {formatDateTime(item.promotion_week_end)}
    </td>
    {/* 추천게임: wrapper div + align-top (legacy 비대칭) */}
    <td className="text-center align-top">
      <div className="d-flex flex-column align-items-stretch justify-content-start align-content-start">
        <GoodsList goods={item.recommand_goods} />
      </div>
    </td>
    {/* 인기게임: wrapper div·align-top 없음 (legacy 비대칭) */}
    <td className="text-center">
      <GoodsList goods={item.best_goods} />
    </td>
    <td className="text-center">{item.is_view}</td>
    <td className="text-center">
      <a
        href={`/promotion/promotion_weekend_register?mode=modify&idx=${item.idx}`}
        className="action-icon text-secondary font-14"
      >
        {" "}
        <i className="mdi mdi-square-edit-outline font-16" /> 수정
      </a>
    </td>
  </tr>
);
