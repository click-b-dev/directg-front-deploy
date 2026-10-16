import {
  useSteamRanking,
  useSyncSteamApp,
  type SteamRankingSearch,
  type SteamRankingItem,
} from "@entities/steam";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/steam/steam_apps_ranking";
const PER_PAGE = 50;

const YEARS: number[] = [];
for (let y = 2005; y <= new Date().getFullYear(); y += 1) {
  YEARS.push(y);
}

const price100 = (cents: number) => Math.round(cents / 100).toLocaleString();
const cleanLangs = (s: string) => s.replaceAll("*음성이 지원되는 언어", "").replace(/<[^>]*>/g, "");

// legacy steam/steam_apps_ranking.php — 스팀 Apps 평가수 순위(읽기 뷰, 카드 그리드).
export const SteamAppsRankingScreen = (search: SteamRankingSearch) => {
  const { data } = useSteamRanking(search);
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
                <li className="breadcrumb-item active">스팀 Apps 평가수 순위</li>
              </ol>
            </div>
            <h4 className="page-title">스팀 Apps 평가수 순위</h4>
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
                <div className="col-md-4 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_publisher"
                      className="col-sm-3 col-form-labe col-form-label-sm bg-light border"
                    >
                      퍼블리셔
                    </label>
                    <div className="col-sm-9">
                      <select
                        id="search_publisher"
                        name="search_publisher"
                        className="form-select"
                        defaultValue={search.search_publisher}
                      >
                        <option value="">:::선택:::</option>
                        {data.publishers.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-2 mb-2">
                  <div className="row">
                    <label
                      htmlFor="is_free"
                      className="col-sm-5 col-form-label col-form-label-sm bg-light border"
                    >
                      무료여부
                    </label>
                    <div className="col-sm-7">
                      <div className="form-check form-check-inline mt-1">
                        <input
                          type="checkbox"
                          id="is_free"
                          name="is_free"
                          className="form-check-input"
                          value="1"
                          defaultChecked={search.is_free === "1"}
                        />
                        <label className="form-check-label" htmlFor="is_free">
                          무료제외
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="offset-md-2 col-md-2">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      스팀 Apps 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-md-12">
          <span>총 {data.pagination.total_results.toLocaleString()}</span>건
        </div>
      </div>

      <div className="grid">
        {data.items.map((item, i) => (
          <RankingCard key={item.appid} item={item} rank={i + 1 + PER_PAGE * (page - 1)} />
        ))}
      </div>

      <div className="text-center mt-3">
        <ServerPagination
          page={page}
          totalPages={data.pagination.total_pages}
          baseUrl={BASE_URL}
          params={{
            search_year: search.search_year,
            search_publisher: search.search_publisher,
            is_free: search.is_free,
          }}
        />
      </div>
    </>
  );
};

const RankingCard = ({ item, rank }: { item: SteamRankingItem; rank: number }) => {
  const syncApp = useSyncSteamApp();
  // legacy strpos 진위(position 0이면 false) 재현: indexOf > 0.
  const langs = cleanLangs(item.supported_languages).split(",");
  const hasKr = langs.some((l) => l.indexOf("한국어") > 0);
  const hasVoice = langs.some((l) => l.indexOf("한국어*") > 0);

  return (
    <div className="item">
      <div className="card">
        <div className="card-body p-2">
          <h5 className="card-title font-13 ps-3">
            {item.name}
            <span className="position-absolute top-0 start-0 badge bg-danger font-14">{rank}</span>
          </h5>
          <h6 className="card-subtitle text-muted ps-3">APPID: {item.appid}</h6>
        </div>
        <div className="position-relative">
          <img
            className="img-fluid"
            src={`/upload/apps/header/${item.appid}/header.jpg`}
            alt={item.name}
          />
          <div className="position-absolute top-0 start-0">
            {hasKr && (
              <span className="badge bg-success text-light font-12 fw-normal me-1">
                인터페이스/자막 한글
              </span>
            )}
            {hasVoice && (
              <span className="badge bg-primary text-light font-12 fw-normal">음성 한글</span>
            )}
          </div>
        </div>
        <div className="card-body p-1">
          <table className="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
            <tbody className="font-12">
              <tr>
                <th className="table-light" style={{ width: "80px" }}>
                  개발사
                </th>
                <td>
                  <a
                    href={`/steam/steam_apps_list_all?search_developer=${item.developer}&search_app_type=game`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.developer}
                  </a>
                </td>
              </tr>
              <tr>
                <th className="table-light" style={{ width: "80px" }}>
                  퍼블리셔
                </th>
                <td>
                  <a href={`/steam/steam_apps_ranking?search_publisher=${item.publisher}`}>
                    {item.publisher}
                  </a>
                </td>
              </tr>
              <tr>
                <th className="table-light" style={{ width: "80px" }}>
                  출시일
                </th>
                <td>{item.release_date}</td>
              </tr>
              <tr>
                <th className="table-light" style={{ width: "80px" }}>
                  장르
                </th>
                <td>
                  {item.genres.map((g, gi) => (
                    <span className="badge bg-dark text-light font-11 fw-normal me-1 mb-1" key={gi}>
                      {g}
                    </span>
                  ))}
                </td>
              </tr>
              <tr>
                <th className="table-light" style={{ width: "80px" }}>
                  평가수
                </th>
                <td>
                  {item.recommendations.toLocaleString()}
                  <br /> (일평균:{" "}
                  {item.diff_per_day.toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                  )
                </td>
              </tr>
              <tr>
                <th className="table-light" style={{ width: "80px" }}>
                  가격정보
                </th>
                <td>
                  {price100(item.consumer_price)} ({price100(item.price)})
                </td>
              </tr>
              <tr>
                <th className="table-light" style={{ width: "80px" }}>
                  Metacritic
                </th>
                <td>
                  <strong>{item.metacritic_score.toLocaleString()}</strong>
                </td>
              </tr>
              <tr>
                <th className="table-light" style={{ width: "80px" }}>
                  Package
                </th>
                <td>{item.package_count} 개</td>
              </tr>
              <tr>
                <th className="table-light" style={{ width: "80px" }}>
                  DLC
                </th>
                <td>{item.dlc_count} 개</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card-footer p-1">
          <div className="d-flex align-items-center">
            <small>업데이트 일자: {item.batch_date}</small>
            <div className="d-flex ms-auto">
              <button
                type="button"
                className="btn btn-primary shadow-none"
                onClick={() => syncApp.mutate({ appids: item.appid })}
              >
                <i className="uil uil-refresh" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
