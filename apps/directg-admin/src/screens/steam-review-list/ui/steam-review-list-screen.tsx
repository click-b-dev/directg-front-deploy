import {
  useSteamReviewList,
  useSyncSteamReview,
  type SteamReviewSearch,
  type SteamReviewListItem,
} from "@entities/steam";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/steam/steam_review_list";
const PER_PAGE = 50;

// 2005~현재연도 (legacy: for i=2005; i<=date('Y'))
const YEARS: number[] = [];
for (let y = 2005; y <= new Date().getFullYear(); y += 1) {
  YEARS.push(y);
}

const pctReview = (n: number, total: number) =>
  total > 0 ? Math.round((n * 10000) / total) / 100 : 0;

// legacy steam/steam_review_list.php — 스팀 평가 현황(읽기 뷰).
export const SteamReviewListScreen = (search: SteamReviewSearch) => {
  const { data } = useSteamReviewList(search);
  if (!data) {
    return null;
  }

  const page = data.pagination.current_page;

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
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    스팀 동기화
                  </a>
                </li>
                <li className="breadcrumb-item active">스팀 평가 현황</li>
              </ol>
            </div>
            <h4 className="page-title">스팀 평가 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 스팀 Apps 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">스팀 Apps 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row">
                <div className="col-md-2">
                  <div className="row">
                    <label
                      htmlFor="search_year"
                      className="col-sm-5 col-form-labe col-form-label-sm bg-light border"
                    >
                      스팀 출시연도
                    </label>
                    <div className="col-sm-7">
                      <select
                        className="form-select"
                        id="search_year"
                        name="search_year"
                        defaultValue={search.search_year}
                      >
                        <option value="">::선택::</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-2 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_appid"
                      className="col-sm-5 col-form-label col-form-label-sm bg-light border"
                    >
                      스팀 APPID
                    </label>
                    <div className="col-sm-7">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_appid"
                        name="search_appid"
                        placeholder="스팀 APPID"
                        defaultValue={search.search_appid}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-4 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_name"
                      className="col-sm-3 col-form-label col-form-label-sm bg-light border"
                    >
                      스팀 상품명
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_name"
                        name="search_name"
                        placeholder="스팀 상품명"
                        defaultValue={search.search_name}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-2 mb-2">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="float-end">
                        <button type="submit" className="btn btn-primary shadow-none">
                          스팀 Apps 검색
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="mb-2">{data.pagination.total_results.toLocaleString()} 개</div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-centered nowrap table-sm table-bordered">
              <thead className="table-dark font-13">
                <tr>
                  <th className="text-center" style={{ width: "60px" }}>
                    번호
                  </th>
                  <th className="text-center" style={{ width: "80px" }}>
                    스팀
                    <br />
                    APPID
                  </th>
                  <th className="text-center" style={{ width: "80px" }}>
                    스팀유형
                  </th>
                  <th className="text-center">스팀 상품명</th>
                  <th className="text-center" style={{ width: "220px" }}>
                    퍼블리셔
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    출시일
                  </th>
                  <th className="text-center" style={{ width: "120px" }}>
                    review_score
                  </th>
                  <th className="text-center" style={{ width: "130px" }}>
                    긍정 평가수
                  </th>
                  <th className="text-center" style={{ width: "130px" }}>
                    부정평가수
                  </th>
                  <th className="text-center" style={{ width: "130px" }}>
                    동기화
                  </th>
                </tr>
              </thead>
              <tbody className="font-12">
                {data.items.map((item, i) => (
                  <SteamReviewRow
                    key={item.steam_appid}
                    item={item}
                    rowNo={(page - 1) * PER_PAGE + i + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-3">
            <ServerPagination
              page={page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{
                search_appid: search.search_appid,
                search_name: search.search_name,
                search_year: search.search_year,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const SteamReviewRow = ({ item, rowNo }: { item: SteamReviewListItem; rowNo: number }) => {
  const syncReview = useSyncSteamReview();
  return (
    <tr>
      <td className="text-center">{rowNo}</td>
      <td className="text-center">{item.steam_appid}</td>
      <td className="text-center">{item.app_type}</td>
      <td>
        <span className="font-13">{item.name}</span>
        <div className="mt-1">
          {item.genre.split(",").map((g, i) => (
            <span className="badge bg-secondary font-11 fw-normal" key={i}>
              {g}{" "}
            </span>
          ))}
        </div>
      </td>
      <td className="text-center">{item.publisher}</td>
      <td className="text-center">{item.release_date}</td>
      <td className="text-center">
        {item.review_score}
        <br />({item.review_score_desc})
      </td>
      <td className="text-end">
        {item.total_positive.toLocaleString()}
        <br />({pctReview(item.total_positive, item.total_reviews)}%)
      </td>
      <td className="text-end">
        {item.total_negative.toLocaleString()}
        <br />({pctReview(item.total_negative, item.total_reviews)}%)
      </td>
      <td className="text-center">
        {item.batch_date}{" "}
        <button
          type="button"
          className="btn btn-sm btn-secondary shadow-none"
          onClick={() =>
            syncReview.mutate(
              { appid: item.steam_appid, purchase_type: "all", language: "all" },
              { onSuccess: (r) => window.alert(r.message) },
            )
          }
        >
          <i className="uil uil-refresh" />
        </button>
      </td>
    </tr>
  );
};
