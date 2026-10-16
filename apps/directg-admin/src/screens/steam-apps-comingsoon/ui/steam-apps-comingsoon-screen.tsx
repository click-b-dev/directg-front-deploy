import {
  useSteamComingSoon,
  useSyncSteamApp,
  useSyncSteamPackage,
  type SteamComingSoonSearch,
  type SteamAppAllItem,
} from "@entities/steam";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/steam/steam_apps_comingsoon";

const price100 = (cents: number) => Math.round(cents / 100).toLocaleString();
const cleanLangs = (s: string) => s.replace(/<[^>]*>/g, "").replaceAll("*음성이 지원되는 언어", "");

// legacy steam/steam_apps_comingsoon.php — 스팀 출시예정 App(읽기 뷰).
export const SteamAppsComingsoonScreen = (search: SteamComingSoonSearch) => {
  const { data } = useSteamComingSoon(search);
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
                <li className="breadcrumb-item active">스팀 출시예정 App</li>
              </ol>
            </div>
            <h4 className="page-title">스팀 출시예정 App</h4>
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
                <div className="col-lg-2 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_appid"
                      className="col-sm-5 col-form-labe col-form-label-sm bg-light border"
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
                <div className="col-lg-5 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_name"
                      className="col-sm-3 col-form-labe col-form-label-sm bg-light border"
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
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary">
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
                  <thead className="table-dark">
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
                        출시예정일
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
                      <ComingSoonRows key={item.appid} item={item} />
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
                    search_title_id: search.search_title_id,
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

const ComingSoonRows = ({ item }: { item: SteamAppAllItem }) => {
  const isGame = item.app_type === "game";
  const syncApp = useSyncSteamApp();
  const syncPackage = useSyncSteamPackage();
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
        </td>
        <td className="text-end">{price100(item.consumer_price)}</td>
        <td className="text-end">{price100(item.price)}</td>
        <td className="text-center">
          <button
            type="button"
            className="btn btn-info btn-sm shadow-none"
            onClick={() => syncApp.mutate({ appids: item.appid })}
          >
            스팀 업데이트
          </button>
        </td>
      </tr>
      <tr>
        <td colSpan={7}>
          <table className="table table-centered table-sm mb-0">
            <tbody className="font-13">
              <tr>
                <th className="bg-light">개발사</th>
                <td>{item.developer}</td>
                <th className="bg-light">퍼블리셔</th>
                <td>{item.publisher}</td>
                <th className="bg-light">추천수</th>
                {/* legacy: raw echo(콤마 없음) */}
                <td>{item.recommendations}</td>
              </tr>
              <tr>
                <th className="bg-light">지원언어</th>
                <td colSpan={5}>{cleanLangs(item.supported_languages)}</td>
              </tr>
              <tr>
                <th className="bg-light">한국어 지원</th>
                <td colSpan={3}>
                  {langs.some((l) => l.includes("한국어")) && (
                    <span className="badge bg-info text-light font-12 fw-normal">
                      인터페이스/자막
                    </span>
                  )}{" "}
                  {langs.some((l) => l.includes("한국어*")) && (
                    <span className="badge bg-info text-light font-12 fw-normal">음성</span>
                  )}
                </td>
                <th className="bg-light">업데이트 날짜</th>
                <td>{item.batch_date}</td>
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
              // ⚠️ legacy 오타(package_comming_soon)로 3번째 필드 항상 빈값
              <div key={p.packageid}>
                [{p.packageid}] {p.package_name} / {p.package_release} /{" "}
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
      {isGame && (
        <tr>
          <th className="text-center bg-light">DLC</th>
          <td colSpan={6}>
            {item.dlcs.map((d) =>
              d.name ? (
                <div key={d.dlc_appid}>
                  [{d.dlc_appid}] {d.name}
                </div>
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
          </td>
        </tr>
      )}
    </>
  );
};
