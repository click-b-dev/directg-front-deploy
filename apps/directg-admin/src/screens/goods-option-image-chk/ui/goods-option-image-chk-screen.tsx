import { useState } from "react";
import {
  useOptionImageChkList,
  useDisknUploadChk,
  type OptionImageChkSearch,
  type OptionListItem,
} from "@entities/goods-option";
import { ServerPagination, ProductStatusBadge } from "@shared/ui";

const BASE_URL = "/goods/goods_option_image_chk";

const SEARCH_KEYS: { value: string; label: string }[] = [
  { value: "search_product_name", label: "옵션상품명" },
  { value: "search_product_code", label: "옵션상품코드" },
];

const DOMAINS: { value: string; label: string; id: string }[] = [
  { value: "all", label: "전체", id: "all" },
  { value: "https://directg.net", label: "웹서버", id: "1" },
  { value: "https://image.directg.net", label: "디스크엔", id: "2" },
  { value: "Null", label: "이미지 없음", id: "null" },
];

const IS_VIEWS: { value: string; label: string; id: string }[] = [
  { value: "all", label: "전체", id: "all" },
  { value: "Y", label: "진열함", id: "y" },
  { value: "N", label: "진열안함", id: "n" },
];

const STATUSES: { value: string; label: string }[] = [
  { value: "1", label: "승인대기" },
  { value: "0", label: "판매중" },
  { value: "3", label: "판매종료" },
];

const won = (n: number) => `${n.toLocaleString()}원`;

// legacy goods_option_image_chk.php — 옵션상품 Header 이미지 확인.
export const GoodsOptionImageChkScreen = (search: OptionImageChkSearch) => {
  const { data } = useOptionImageChkList(search);
  if (!data) {
    return null;
  }

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
                <li className="breadcrumb-item active">옵션상품 Header 관리</li>
              </ol>
            </div>
            <h4 className="page-title">옵션상품 Header 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 옵션상품 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">옵션상품 검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="input-group row">
                    <select
                      className="form-select col-sm-3"
                      name="search_key"
                      id="search_key"
                      defaultValue={search.search_key}
                    >
                      {SEARCH_KEYS.map((k) => (
                        <option key={k.value} value={k.value}>
                          {k.label}
                        </option>
                      ))}
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
                <div className="col-lg-6">
                  <div className="row">
                    <label
                      htmlFor="search_domain"
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      업로드 도메인
                    </label>
                    <div className="col-sm-8 pt-1">
                      {DOMAINS.map((d) => (
                        <div className="form-check form-check-inline" key={d.value}>
                          <input
                            type="radio"
                            id={`search_domain_${d.id}`}
                            name="search_domain"
                            className="form-check-input"
                            value={d.value}
                            defaultChecked={search.search_domain === d.value}
                          />
                          <label className="form-check-label" htmlFor={`search_domain_${d.id}`}>
                            {d.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_is_view"
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      옵션상품 진열
                    </label>
                    <div className="col-sm-8 pt-1">
                      {IS_VIEWS.map((v) => (
                        <div className="form-check form-check-inline" key={v.value}>
                          <input
                            type="radio"
                            id={`search_is_view_${v.id}`}
                            name="search_is_view"
                            className="form-check-input"
                            value={v.value}
                            defaultChecked={search.search_is_view === v.value}
                          />
                          <label className="form-check-label" htmlFor={`search_is_view_${v.id}`}>
                            {v.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_status"
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      판매상태
                    </label>
                    <div className="col-sm-8 pt-1">
                      {STATUSES.map((s) => (
                        <div className="form-check form-check-inline" key={s.value}>
                          <input
                            type="radio"
                            id={`search_status_${s.value}`}
                            name="search_status"
                            className="form-check-input"
                            value={s.value}
                            defaultChecked={search.search_status === s.value}
                          />
                          <label className="form-check-label" htmlFor={`search_status_${s.value}`}>
                            {s.label}
                          </label>
                        </div>
                      ))}
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

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100 nowrap table-sm table-bordered border-light table-striped">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{ width: "100px" }}>
                  옵션상품코드
                </th>
                <th className="text-center" style={{ width: "260px" }}>
                  SKU
                </th>
                <th className="text-center">옵션상품명</th>
                <th className="text-center" style={{ width: "150px" }}>
                  플랫폼
                </th>
                <th className="text-center" style={{ width: "90px" }}>
                  출시일
                </th>
                <th className="text-center" style={{ width: "80px" }}>
                  판매상태
                </th>
                <th className="text-center" style={{ width: "80px" }}>
                  할인율
                </th>
                <th className="text-center" style={{ width: "100px" }}>
                  가격
                </th>
                <th className="text-center" style={{ width: "100px" }}>
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <OptionImageRows key={item.product_code} item={item} />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{
                search_key: search.search_key,
                search_value: search.search_value,
                search_status: search.search_status,
                search_domain: search.search_domain,
                search_is_view: search.search_is_view,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// 상품별 2행: 정보행(비고 드롭다운) + header 이미지 프리뷰행(도메인/디스크엔버튼/웹서버/디스크엔).
const OptionImageRows = ({ item }: { item: OptionListItem }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const disknUpload = useDisknUploadChk();
  const headerPath = `/upload/product/${item.product_code}/header/header.jpg`;
  // legacy: file_exists(웹서버 header) && (domain=="" || domain=="https://directg.net"). null/undefined는 ""로 취급.
  const showDiskn =
    item.header_web_exists && (!item.domain || item.domain === "https://directg.net");

  return (
    <>
      <tr className="table-active">
        <td className="text-center">
          {item.product_code}
          <br />({item.steam_appid})
        </td>
        <td className="text-center">
          <span className="font-12">{item.goods_sku}</span>
        </td>
        <td>
          {item.product_name}{" "}
          <span className="badge bg-secondary text-light">{item.game_type}</span>{" "}
          <span className="badge bg-secondary text-light">{item.display_type}</span>
          <br />
          <small>({item.product_name_en})</small>
        </td>
        <td className="text-centertbl">{item.platform_name}</td>
        <td className="text-center">{item.release_date.slice(0, 10)}</td>
        <td className="text-center">
          <ProductStatusBadge status={item.status} />
        </td>
        <td className="text-end">{item.is_free === "N" ? `${item.discount}%` : ""}</td>
        <td className="text-end">
          {item.is_free === "Y" ? (
            "무료"
          ) : (
            <>
              <s className="text-muted">{won(item.consumer_price)}</s>
              <br />
              <span className="fs-5">{won(item.price)}</span>
            </>
          )}
        </td>
        <td className="text-center">
          <div className={`dropdown card-widgets float-none${menuOpen ? " show" : ""}`}>
            <a
              href="#"
              className="dropdown-toggle arrow-none"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen((v) => !v);
              }}
            >
              <i className="dripicons-dots-3" />
            </a>
            <div
              className={`dropdown-menu dropdown-menu-end${menuOpen ? " show" : ""}`}
              data-bs-popper="static"
            >
              <a
                href={`/goods/goods_option_view?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-eye mdi-18px me-1" />
                상세보기
              </a>
              <a
                href={`/goods/goods_option_modify?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-18px mdi-pencil me-1" />
                기본정보 설정
              </a>
              <a
                href={`/goods/goods_option_image_register?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-18px mdi-image me-1" />
                이미지 설정
              </a>
              <a
                href={`/goods/goods_option_tag_register?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-18px mdi-tag me-1" />
                태그 설정
              </a>
              <a
                href={`/goods/goods_option_sales_register?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-18px mdi-store me-1" />
                판매 설정
              </a>
              <a
                href={`/goods/goods_option_bonus_register?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-18px mdi-store me-1" />
                특전제공 설정
              </a>
              <a
                href={`/goods/timedeal_register?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-sale mdi-18px me-1" />
                타임딜 설정
              </a>
              <a
                href={`/goods/goods_option_repay_register?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-sale mdi-18px me-1" />
                적립금 설정
              </a>
            </div>
          </div>
        </td>
      </tr>
      {/* legacy colspan=8 그대로(9컬럼 중 8만 span — legacy quirk). */}
      <tr>
        <td colSpan={8}>
          <table className="table table-sm">
            <colgroup>
              <col width="5%" />
              <col width="10%" />
              <col width="5%" />
              <col width="15%" />
              <col width="5%" />
              <col width="15%" />
            </colgroup>
            <tbody>
              <tr>
                <th className="text-center bg-light">도메인</th>
                <td>
                  {item.domain}
                  {showDiskn && (
                    <button
                      type="button"
                      className="btn btn-light btn-sm border btn_image_diskn"
                      data-productcode={item.product_code}
                      disabled={disknUpload.isPending}
                      onClick={() => disknUpload.mutate({ product_code: item.product_code })}
                    >
                      디스크엔 등록
                    </button>
                  )}
                </td>
                <th className="text-center bg-light">웹서버</th>
                <td>
                  <img src={headerPath} className="w-50" alt="" />
                </td>
                <th className="text-center bg-light">디스크엔</th>
                <td>
                  <img src={`https://image.directg.net${headerPath}`} className="w-50" alt="" />
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </>
  );
};
