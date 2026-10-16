import {
  useSteamAppAllList,
  useSyncSteamApp,
  useSyncSteamPackage,
  useDeleteSteamApp,
  type SteamAppAllSearch,
  type SteamAppAllItem,
} from "@entities/steam";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/steam/steam_apps_list_all";

const APP_TYPES: { value: string; label: string; id: string }[] = [
  { value: "all", label: "전체", id: "all" },
  { value: "game", label: "Game", id: "game" },
  { value: "dlc", label: "DLC", id: "dlc" },
  { value: "music", label: "Music", id: "music" },
];

const YEARS: number[] = [];
for (let y = 2005; y <= new Date().getFullYear(); y += 1) {
  YEARS.push(y);
}

const price100 = (cents: number) => Math.round(cents / 100).toLocaleString();
const pad = (n: number) => String(n).padStart(2, "0");
const fmtDateTime = (unix: number) => {
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
// strip_tags + '*음성이 지원되는 언어' 제거
const cleanLangs = (s: string) => s.replace(/<[^>]*>/g, "").replaceAll("*음성이 지원되는 언어", "");

// legacy steam/steam_apps_list_all.php — 스팀 Apps list(읽기 뷰).
export const SteamAppsListAllScreen = (search: SteamAppAllSearch) => {
  const { data } = useSteamAppAllList(search);
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
                <li className="breadcrumb-item active">스팀 Apps 검색</li>
              </ol>
            </div>
            <h4 className="page-title">스팀 Apps 검색</h4>
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
                      className="col-sm-5 col-form-label col-form-label-sm bg-light border"
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
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      퍼블리셔
                    </label>
                    <div className="col-sm-8">
                      <select
                        id="search_publisher"
                        name="search_publisher"
                        className="form-select"
                        defaultValue={search.search_publisher}
                      >
                        <option value="">:::선택:::</option>
                        {data.publishers.map((p) => (
                          <option key={p.publisher} value={p.publisher}>
                            {p.publisher} [{p.cc}]
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-2 mb-2">
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
                <div className="col-md-4 mb-2">
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
              </div>

              <div className="row">
                <div className="col-4 mb-2">
                  <div className="row">
                    <label className="col-sm-3 col-form-label col-form-label-sm bg-light border">
                      스팀 APP TYPE
                    </label>
                    <div className="col-sm-9 mt-1">
                      {APP_TYPES.map((t) => (
                        <div className="form-check form-check-inline" key={t.value}>
                          <input
                            type="radio"
                            id={`search_app_type_${t.id}`}
                            name="search_app_type"
                            className="form-check-input"
                            value={t.value}
                            defaultChecked={search.search_app_type === t.value}
                          />
                          <label className="form-check-label" htmlFor={`search_app_type_${t.id}`}>
                            {t.label}
                          </label>
                        </div>
                      ))}
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
                          무료제공
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-3 mb-2">
                  <div className="row">
                    <label
                      htmlFor="supported_languages"
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      지원언어
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="supported_languages"
                        name="supported_languages"
                        defaultValue={search.supported_languages}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md12">
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

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {data.pagination.total_results.toLocaleString()} 개
              <div className="table-responsive">
                <table className="table table-centered nowrap table-sm table-bordered">
                  <thead className="table-dark font-14">
                    <tr>
                      <th className="text-center" style={{ width: "100px" }}>
                        스팀
                        <br />
                        APPID
                      </th>
                      <th className="text-center">스팀 상품명</th>
                      <th className="text-center" style={{ width: "100px" }}>
                        스팀유형
                      </th>
                      <th className="text-center" style={{ width: "130px" }}>
                        출시일
                      </th>
                      <th className="text-center" style={{ width: "100px" }}>
                        스팀
                        <br />
                        초기가격
                      </th>
                      <th className="text-center" style={{ width: "100px" }}>
                        스팀
                        <br />
                        판매가
                      </th>
                      <th className="text-center" style={{ width: "130px" }}>
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-13">
                    {data.items.map((item) => (
                      <SteamAppAllRows key={item.appid} item={item} />
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
                    search_year: search.search_year,
                    search_publisher: search.search_publisher,
                    search_appid: search.search_appid,
                    search_name: search.search_name,
                    search_app_type: search.search_app_type,
                    is_free: search.is_free,
                    supported_languages: search.supported_languages,
                    search_developer: search.search_developer,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const SteamAppAllRows = ({ item }: { item: SteamAppAllItem }) => {
  const isGame = item.app_type === "game";
  const syncApp = useSyncSteamApp();
  const syncPackage = useSyncSteamPackage();
  const deleteApp = useDeleteSteamApp();
  const langs = cleanLangs(item.supported_languages)
    .split(",")
    .map((s) => s.trim());

  return (
    <>
      <tr>
        <td className="text-center">{item.appid}</td>
        <td>{item.name}</td>
        <td className="text-center">{item.app_type}</td>
        <td className="text-center">
          {item.coming_soon ? item.coming_soon_date : item.release_date}
          <br />({item.release_date})
        </td>
        <td className="text-end">{item.is_free === "1" ? "" : price100(item.consumer_price)}</td>
        <td className="text-end">{item.is_free === "1" ? "무료" : price100(item.price)}</td>
        <td className="text-center">
          <button
            type="button"
            className="btn btn-info btn-sm shadow-none"
            onClick={() =>
              syncApp.mutate({ appids: item.appid }, { onSuccess: (r) => window.alert(r.message) })
            }
          >
            스팀 업데이트
          </button>
        </td>
      </tr>
      {!isGame && (
        <tr>
          <th className="text-center bg-light">기본게임</th>
          <td colSpan={6}>
            [{item.basic_game_appid}] {item.basic_game_name}
          </td>
        </tr>
      )}
      <tr>
        <td colSpan={7}>
          <table className="table table-centered table-sm mb-0">
            <tbody className="font-13">
              <tr>
                <th className="bg-light text-center" style={{ width: "100px" }}>
                  개발사
                </th>
                <td>{item.developer}</td>
                <th className="bg-light text-center">퍼블리셔</th>
                <td>{item.publisher}</td>
                <th className="bg-light text-center">추천수</th>
                <td className="text-end">{item.recommendations.toLocaleString()}</td>
              </tr>
              <tr>
                <th className="bg-light text-center">지원언어</th>
                <td colSpan={3}>{cleanLangs(item.supported_languages)}</td>
                <th className="bg-light text-center">한국어 지원</th>
                <td>
                  {langs.some((l) => l.includes("한국어")) && (
                    <span className="badge bg-info text-light font-12 fw-normal">
                      인터페이스/자막
                    </span>
                  )}{" "}
                  {langs.some((l) => l.includes("한국어*")) && (
                    <span className="badge bg-info text-light font-12 fw-normal">음성</span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center">동기화일자</th>
                <td colSpan={4}>{item.batch_date}</td>
                <td colSpan={2}>{item.last_modified ? fmtDateTime(item.last_modified) : ""}</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light">Package</th>
        <td colSpan={6}>
          {item.packages.map((p) =>
            p.package_name ? (
              <div key={p.packageid}>
                [{p.packageid}] {p.package_name} / {p.package_release} / {p.package_coming_soon} /{" "}
                {price100(p.price_initial)}
              </div>
            ) : (
              <button
                key={p.packageid}
                type="button"
                className="btn btn-sm btn-secondary shadow-none me-1"
                onClick={() => syncPackage.mutate({ packageid: p.packageid, appid: item.appid })}
              >
                {p.packageid} 동기화
              </button>
            ),
          )}
        </td>
      </tr>
      {isGame ? (
        <tr>
          <th className="text-center bg-light">DLC</th>
          <td colSpan={6}>
            {item.dlcs.map((d) =>
              d.name ? (
                <p key={d.dlc_appid}>
                  [{d.dlc_appid}] {d.name}{" "}
                  <button
                    type="button"
                    className="btn btn-sm btn-light btn_dlc_delete shadow-none border"
                    onClick={() => deleteApp.mutate(d.dlc_appid)}
                  >
                    삭제
                  </button>
                </p>
              ) : (
                <button
                  key={d.dlc_appid}
                  type="button"
                  className="btn btn-sm btn-secondary shadow-none me-1"
                  onClick={() => syncApp.mutate({ appids: d.dlc_appid })}
                >
                  {d.dlc_appid} 동기화
                </button>
              ),
            )}
            <button
              type="button"
              className="btn btn-sm btn-light shadow-none border"
              onClick={() => deleteApp.mutate(item.appid)}
            >
              삭제
            </button>
          </td>
        </tr>
      ) : (
        <tr>
          <td>
            <button
              type="button"
              className="btn btn-sm btn-light shadow-none border"
              onClick={() => deleteApp.mutate(item.appid)}
            >
              삭제
            </button>
          </td>
        </tr>
      )}
    </>
  );
};
