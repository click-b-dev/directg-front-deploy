import {
  useOptionScreenshotChkList,
  useDownloadScreenshotChk,
  type OptionScreenshotChkSearch,
  type OptionScreenshotChkItem,
} from "@entities/goods-option";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/goods_option_screenshot_chk";
const PER_PAGE = 10;

const SALES_STATUS_LABEL: Record<string, string> = {
  S: "판매중",
  C: "판매예정",
  E: "판매종료",
};

// legacy goods_option_screenshot_chk.php — DLC 스크린샷 체크.
export const GoodsOptionScreenshotChkScreen = (search: OptionScreenshotChkSearch) => {
  const { data } = useOptionScreenshotChkList(search);
  if (!data) {
    return null;
  }

  const total = data.pagination.total_results;
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
                    옵션상품 이미지 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">DLC 스크린샷 체크</li>
              </ol>
            </div>
            <h4 className="page-title">DLC 스크린샷 체크</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-2">
                  <div className="row">
                    <label
                      htmlFor="search_product_code"
                      className="col-sm-5 col-form-label bg-light border"
                    >
                      옵션상품코드
                    </label>
                    <div className="col-sm-7">
                      <input
                        type="text"
                        className="form-control"
                        id="search_product_code"
                        name="search_product_code"
                        placeholder="옵션상품코드"
                        defaultValue={search.search_product_code}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="row">
                    <label
                      htmlFor="search_product_name"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      옵션상품명(국문)
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_product_name"
                        name="search_product_name"
                        placeholder="옵션상품명(국문)"
                        defaultValue={search.search_product_name}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_appid"
                      className="col-sm-5 col-form-label bg-light border"
                    >
                      Steam APP ID
                    </label>
                    <div className="col-sm-7">
                      <input
                        type="text"
                        className="form-control"
                        id="search_appid"
                        name="search_appid"
                        placeholder="Steam APP ID"
                        defaultValue={search.search_appid}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      옵션상품 검색
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
          <div>{total.toLocaleString()} 개</div>
          <div className="table-responsive">
            <table className="table table-centered nowrap table-sm table-bordered">
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center">번호</th>
                  <th className="text-center" style={{ width: "7%" }}>
                    옵션상품코드
                    <br />
                    <span className="eng">(Steam AppID)</span>
                  </th>
                  <th className="text-center" style={{ width: "20%" }}>
                    옵션상품 sku
                  </th>
                  <th className="text-center">옵션상품명</th>
                  <th className="text-center" style={{ width: "7%" }}>
                    옵션상품 출시일
                  </th>
                  <th className="text-center" style={{ width: "10%" }}>
                    페이지 보기
                  </th>
                </tr>
              </thead>
              <tbody className="font-12">
                {data.items.map((item, i) => (
                  <ScreenshotChkRows
                    key={item.product_code}
                    item={item}
                    rowNo={total - ((page - 1) * PER_PAGE + (i + 1))}
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
                search_product_code: search.search_product_code,
                search_product_name: search.search_product_name,
                search_appid: search.search_appid,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// 상품별 2행: 정보행(번호 rowspan2) + Steam 스크린샷 슬롯행.
const ScreenshotChkRows = ({ item, rowNo }: { item: OptionScreenshotChkItem; rowNo: number }) => {
  const download = useDownloadScreenshotChk();

  return (
    <>
      <tr>
        <td className="text-center" rowSpan={2}>
          {rowNo}
        </td>
        <td className="text-center">
          <span className="eng">{item.product_code}</span>
          <br />
          <span className="num">({item.steam_appid})</span>
          <br />
          {SALES_STATUS_LABEL[item.sales_status] ?? ""}
        </td>
        <td>{item.goods_sku}</td>
        <td>
          {item.product_name}
          <br />
          <small className="eng">{item.product_name_en}</small>
        </td>
        <td className="text-center">
          <span className="num font-12">{item.release_date.slice(0, 10)}</span>
        </td>
        <td className="text-center">
          <a
            href={`/game/dlc_view.html?sku=${item.goods_sku}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-dark shadow-none"
          >
            페이지 이동
          </a>
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light">Steam 스크린샷</th>
        <td colSpan={4}>
          <div className="d-flex flex-wrap">
            {!item.has_json ? (
              <span className="text-danger">스팀 JSON정보 없음</span>
            ) : (
              item.screenshots.map((shot) => {
                const num = shot.id + 1;
                return (
                  <div className="mb-2 px-1" key={shot.id}>
                    {shot.downloaded ? (
                      <span className="font-12">스크린샷 {num} 완료</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm shadow-none btn_screenshot_download font-12"
                        data-productcode={item.product_code}
                        data-type="screenshot"
                        data-url={shot.path_full}
                        data-thumbnail={shot.path_thumbnail}
                        data-num={num}
                        disabled={download.isPending}
                        onClick={() =>
                          download.mutate({
                            productCode: item.product_code,
                            payload: {
                              id: shot.id,
                              path_full: shot.path_full,
                              path_thumbnail: shot.path_thumbnail,
                              num,
                            },
                          })
                        }
                      >
                        스크린샷 {num} <br />
                        다운로드
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </td>
      </tr>
    </>
  );
};
