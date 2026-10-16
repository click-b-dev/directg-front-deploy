import {
  useSteamDlcList,
  useSyncSteamApp,
  useDeleteSteamApp,
  type SteamDlcSearch,
  type SteamDlcListItem,
} from "@entities/steam";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/steam/steam_dlc_list";
const PER_PAGE = 50;

const price100 = (cents: number) => Math.round(cents / 100).toLocaleString();

// legacy steam/steam_dlc_list.php — 스팀 DLC 현황(읽기 뷰).
export const SteamDlcListScreen = (search: SteamDlcSearch) => {
  const { data } = useSteamDlcList(search);
  if (!data) {
    return null;
  }

  const page = data.pagination.current_page;
  // 번호: consumer_price>0 행만 (page-1)*50 기준으로 증가.
  let num = 0;

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
                <li className="breadcrumb-item active">스팀 DLC 현황</li>
              </ol>
            </div>
            <h4 className="page-title">스팀 DLC 현황</h4>
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
                  <th className="text-center" style={{ width: "100px" }}>
                    스팀
                    <br />
                    APPID
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    스팀유형
                  </th>
                  <th className="text-center">스팀 상품명</th>
                  <th className="text-center" style={{ width: "100px" }}>
                    출시여부
                  </th>
                  <th className="text-center" style={{ width: "120px" }}>
                    출시일
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    관련
                    <br />
                    Package 수
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
                  <th className="text-center" style={{ width: "100px" }}>
                    옵션상품코드
                  </th>
                  <th className="text-center" style={{ width: "160px" }}>
                    비고
                  </th>
                  <th className="text-center" style={{ width: "80px" }}>
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="font-12">
                {data.items.map((item) => {
                  const rowNo =
                    item.consumer_price > 0 ? String((page - 1) * PER_PAGE + ++num) : "-";
                  return <SteamDlcRow key={item.steam_appid} item={item} rowNo={rowNo} />;
                })}
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
                is_free: search.is_free,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const SteamDlcRow = ({ item, rowNo }: { item: SteamDlcListItem; rowNo: string }) => {
  const syncApp = useSyncSteamApp();
  const deleteApp = useDeleteSteamApp();
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
        <br />
        <span className="badge bg-info font-11">기본게임</span>{" "}
        <span>
          {item.basic_game_name} [{item.basic_game_appid}]{" "}
        </span>
      </td>
      <td className="text-center">
        {item.coming_soon === "1" ? <span className="text-danger">출시예정</span> : "출시"}
      </td>
      <td className="text-center">
        {item.release_date}
        <br />({item.coming_soon_date})
      </td>
      <td className="text-end">{item.package_count === 0 ? "판매종료" : item.package_count}</td>
      <td className="text-end">{item.is_free === "1" ? "무료" : price100(item.consumer_price)}</td>
      <td className="text-end">{item.is_free === "1" ? "-" : price100(item.price)}</td>
      <td className="text-center">{item.product_code}</td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-secondary shadow-none"
          onClick={() => syncApp.mutate({ appids: item.steam_appid, mode: "dlc_sync" })}
        >
          {item.steam_appid} 동기화
        </button>
        <br />({item.batch_date})
      </td>
      <td className="text-center">
        {/* legacy: product_code 없을 때만 삭제 */}
        {item.product_code === "" && (
          <button
            type="button"
            className="btn btn-sm btn-danger shadow-none"
            onClick={() => deleteApp.mutate(item.steam_appid)}
          >
            삭제
          </button>
        )}
      </td>
    </tr>
  );
};
