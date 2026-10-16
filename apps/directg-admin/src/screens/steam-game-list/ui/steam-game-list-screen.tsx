import {
  useSteamGameList,
  useSyncSteamApp,
  useSyncSteamReview,
  type SteamGameSearch,
  type SteamGameItem,
} from "@entities/steam";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/steam/steam_game_list";
const PER_PAGE = 50;

const price100 = (cents: number) => Math.round(cents / 100).toLocaleString();

// legacy steam/steam_game_list.php — 스팀 Game 현황(읽기 뷰).
export const SteamGameListScreen = (search: SteamGameSearch) => {
  const { data } = useSteamGameList(search);
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
                <li className="breadcrumb-item active">스팀 Game 현황</li>
              </ol>
            </div>
            <h4 className="page-title">스팀 Game 현황</h4>
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
                  <th className="text-center">번호</th>
                  <th className="text-center" style={{ width: "90px" }}>
                    스팀
                    <br />
                    APPID
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    스팀유형
                  </th>
                  <th className="text-center">스팀 상품명</th>
                  <th className="text-center" style={{ width: "130px" }}>
                    퍼블리셔
                  </th>
                  <th className="text-center" style={{ width: "130px" }}>
                    출시일
                  </th>
                  <th className="text-center" style={{ width: "130px" }}>
                    관련 Package 수
                  </th>
                  <th className="text-center" style={{ width: "130px" }}>
                    관련 DLC 수
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    스팀
                    <br />
                    가격정보
                  </th>
                  <th className="text-center" style={{ width: "120px" }}>
                    스팀
                    <br />
                    평가정보
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    대표상품코드
                  </th>
                  <th className="text-center" style={{ width: "160px" }}>
                    비고
                  </th>
                </tr>
              </thead>
              <tbody className="font-12">
                {data.items.map((item, i) => (
                  <SteamGameRow
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
              params={{ search_appid: search.search_appid, search_name: search.search_name }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const SteamGameRow = ({ item, rowNo }: { item: SteamGameItem; rowNo: number }) => {
  const syncApp = useSyncSteamApp();
  const syncReview = useSyncSteamReview();
  const langs = item.supported_languages
    .replace(/<[^>]*>/g, "")
    .split(",")
    .map((s) => s.trim());
  return (
    <tr>
      <td className="text-center">{rowNo}</td>
      <td className="text-center">{item.steam_appid}</td>
      <td className="text-center">{item.app_type}</td>
      <td>
        <p>{item.name}</p>
        {langs.includes("한국어") && (
          <span className="badge bg-secondary font-11 fw-normal">인터페이스/자막</span>
        )}
        {langs.includes("한국어*") && (
          <>
            <span className="badge bg-secondary font-11 fw-normal">인터페이스/자막</span>{" "}
            <span className="badge bg-secondary font-11 fw-normal">음성</span>
          </>
        )}
      </td>
      <td className="text-center">{item.publisher}</td>
      <td className="text-center">
        {item.release_date}
        <br />({item.coming_soon_date})
      </td>
      <td className="text-end">{item.package_count}</td>
      <td className="text-end">{item.dlc_count}</td>
      <td className="text-end">
        {price100(item.consumer_price)}
        <br />({price100(item.price)})
      </td>
      <td className="text-center">
        {item.review_score}
        <br />({item.review_score_desc}) {/* legacy: review_score 빈값일 때만 평가 동기화 */}
        {item.review_score === "" && (
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
            평가 동기화
          </button>
        )}
      </td>
      <td className="text-center">{item.title_id}</td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-secondary shadow-none"
          onClick={() =>
            syncApp.mutate(
              { appids: item.steam_appid },
              { onSuccess: (r) => window.alert(r.message) },
            )
          }
        >
          {item.steam_appid} 동기화
        </button>
        <br />({item.batch_date})
      </td>
    </tr>
  );
};
