import {
  useSteamPackageList,
  useSyncSteamPackage,
  useDeleteSteamPackage,
  type SteamPackageSearch,
  type SteamPackageListItem,
} from "@entities/steam";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/steam/steam_package_list";
const PER_PAGE = 50;

const price100 = (cents: number) => Math.round(cents / 100).toLocaleString();

// getGoodsOptionPackageInfo.display_type → 라벨.
const DISPLAY_TYPE_LABEL: Record<string, string> = {
  basic: "기본게임",
  dlc: "DLC",
  music: "DLC",
  edition: "에디션",
};

const pad = (n: number) => String(n).padStart(2, "0");
const fmtDateTime = (unix: number) => {
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// legacy steam/steam_package_list.php — 스팀 Package 현황(읽기 뷰).
export const SteamPackageListScreen = (search: SteamPackageSearch) => {
  const { data } = useSteamPackageList(search);
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
                <li className="breadcrumb-item active">스팀 Package 현황</li>
              </ol>
            </div>
            <h4 className="page-title">스팀 Package 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 스팀 Package 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">스팀 Package 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row">
                <div className="col-3 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_packageid"
                      className="col-sm-5 col-form-label col-form-label-sm bg-light border"
                    >
                      스팀 packageid
                    </label>
                    <div className="col-sm-7">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_packageid"
                        name="search_packageid"
                        placeholder="스팀 packageid"
                        defaultValue={search.search_packageid}
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
                  <th className="text-center" style={{ width: "100px" }}>
                    Package ID
                    <br />
                    (App ID)
                  </th>
                  <th className="text-center">Package Name</th>
                  <th className="text-center" style={{ width: "100px" }}>
                    출시일
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    판매구분
                  </th>
                  <th className="text-center" style={{ width: "130px" }}>
                    포함된 APP수
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    initial
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    final
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    옵션상품코드
                  </th>
                  <th className="text-center" style={{ width: "160px" }}>
                    비고
                  </th>
                  <th className="text-center" style={{ width: "100px" }}>
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="font-12">
                {data.items.map((item, i) => (
                  <SteamPackageRow
                    key={item.packageid}
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
                search_packageid: search.search_packageid,
                search_name: search.search_name,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const SteamPackageRow = ({ item, rowNo }: { item: SteamPackageListItem; rowNo: number }) => {
  const syncPackage = useSyncSteamPackage();
  const deletePackage = useDeleteSteamPackage();
  return (
    <tr>
      <td className="text-center">{rowNo}</td>
      <td className="text-center">
        {item.packageid}
        <br />({item.appid})
      </td>
      <td>{item.package_name}</td>
      <td className="text-center">{item.package_release}</td>
      <td className="text-center">
        {item.package_coming_soon === "1" ? (
          <span className="text-danger">예약판매</span>
        ) : (
          "일반판매"
        )}
      </td>
      <td className="text-end">{item.cc.toLocaleString()}</td>
      <td className="text-end">{price100(item.price_initial)}</td>
      <td className="text-end">{price100(item.price_final)}</td>
      <td className="text-center">{DISPLAY_TYPE_LABEL[item.display_type] ?? ""}</td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-secondary shadow-none"
          onClick={() => syncPackage.mutate({ packageid: item.packageid, appid: item.appid })}
        >
          {item.packageid} 동기화
        </button>
        <br />
        {item.batch_date ? (
          `(${fmtDateTime(item.batch_date)})`
        ) : (
          <strong className="text-danger">업데이트 필요</strong>
        )}
      </td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-danger shadow-none"
          onClick={() => deletePackage.mutate(item.packageid)}
        >
          삭제
        </button>
      </td>
    </tr>
  );
};
