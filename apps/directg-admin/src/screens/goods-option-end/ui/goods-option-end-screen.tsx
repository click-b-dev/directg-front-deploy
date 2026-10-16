import { useState } from "react";
import {
  useOptionEndList,
  type OptionEndSearch,
  type OptionListItem,
} from "@entities/goods-option";
import { ServerPagination, ProductStatusBadge } from "@shared/ui";

const BASE_URL = "/goods/goods_option_end";

const PLATFORMS = [
  ["1", "Steam"],
  ["34", "Epic"],
  ["30", "Ubisoft Connect"],
  ["35", "Rockstar Games Launcher"],
  ["33", "Bethesda"],
  ["3", "Orgin"],
  ["32", "기타"],
];

// legacy goods_option_end.php — 판매종료 옵션상품 목록(status=3 고정).
export const GoodsOptionEndScreen = (search: OptionEndSearch) => {
  const { data } = useOptionEndList(search);
  if (!data) {
    return null;
  }

  const params: Record<string, string | number> = {
    search_product_code: search.search_product_code,
    search_product_name: search.search_product_name,
    search_product_name_en: search.search_product_name_en,
    search_supplier_code: search.search_supplier_code,
    search_product_platform: search.search_product_platform,
    search_game_type: search.search_game_type,
    search_is_view: search.search_is_view,
    search_status: search.search_status,
    search_is_special: search.search_is_special,
    search_interface_korean: search.search_interface_korean,
    search_spoken_korean: search.search_spoken_korean,
    search_exclusive_korean: search.search_exclusive_korean,
  };

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
                    옵션상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">판매종료 옵션상품</li>
              </ol>
            </div>
            <h4 className="page-title">판매종료 옵션상품</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <FilterForm search={search} suppliers={data.suppliers} />

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
        <div className="float-end">
          {/* legacy 오타 "옵션상품 등록" 그대로 유지. */}
          <a href="/goods/goods_option_register" className="btn btn-danger shadow-none">
            옵션상품 등록
          </a>
        </div>
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
                <th className="text-center" style={{ width: "90px" }}>
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
                <OptionRows key={item.product_code} item={item} page={search.page} />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={params}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const won = (n: number) => `${n.toLocaleString()}원`;

const OptionRows = ({ item, page }: { item: OptionListItem; page: number }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const link = (path: string) => `/goods/${path}?product_code=${item.product_code}&page=${page}`;
  return (
    <>
      <tr className="table-active">
        <td className="text-center">{item.product_code}</td>
        <td className="text-center">
          <span className="font-12">{item.goods_sku}</span>
        </td>
        <td>
          {item.product_name} <br />
          <small>({item.product_name_en})</small>
        </td>
        <td className="text-center">{item.platform_name}</td>
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
              <a href={link("goods_option_view")} className="dropdown-item">
                <i className="mdi mdi-eye mdi-18px me-1" />
                상세보기
              </a>
              <a href={link("goods_option_modify")} className="dropdown-item">
                <i className="mdi mdi-18px mdi-pencil me-1" />
                기본정보 설정
              </a>
              <a href={link("goods_option_image_register")} className="dropdown-item">
                <i className="mdi mdi-18px mdi-image me-1" />
                이미지 설정
              </a>
              <a href={link("goods_option_tag_register")} className="dropdown-item">
                <i className="mdi mdi-18px mdi-tag me-1" />
                태그 설정
              </a>
              <a href={link("goods_option_sales_register")} className="dropdown-item">
                <i className="mdi mdi-18px mdi-store me-1" />
                판매 설정
              </a>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td colSpan={10}>
          <OptionDetail item={item} />
        </td>
      </tr>
    </>
  );
};

const OptionDetail = ({ item }: { item: OptionListItem }) => (
  <table className="table table-sm table-bordered">
    <tbody>
      <tr>
        <th className="text-center bg-light border-bottom">배송정보</th>
        <td colSpan={9} className="bg-white">
          <table className="table table-centered w-100 table-sm table-bordered mb-0">
            <thead className="font-13 table-light">
              <tr>
                <th className="text-center">연동시스템</th>
                <th className="text-center">아이템코드</th>
                <th className="text-center">아이템명</th>
                <th className="text-center">아이템 유형</th>
                <th className="text-center">아이템 플랫폼</th>
                <th className="text-center">아이템 공급처</th>
                <th className="text-center">남은재고</th>
              </tr>
            </thead>
            <tbody className="font-12">
              {item.deliveries.map((d) => (
                <tr key={d.item_id}>
                  <td className="text-center">{d.order_system_name}</td>
                  <td className="text-center">{d.item_id}</td>
                  <td>{d.item_name}</td>
                  <td className="text-center">{d.item_type}</td>
                  <td className="text-center">{d.item_platform}</td>
                  <td>{d.item_publisher}</td>
                  <td className="text-end">{d.stock.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light border-bottom">부가정보</th>
        <td className="bg-white">
          <span className="badge badge-primary-lighten font-13">{item.title_id}</span> Steam Appid{" "}
          <span className="badge badge-info-lighten font-13">{item.steam_appid}</span> Steam
          Packageid: <span className="badge badge-info-lighten font-13">{item.packageid}</span>{" "}
          Steam Bundleid: <span className="badge badge-info-lighten font-13">{item.bundleid}</span>{" "}
          {item.is_view === "Y" ? (
            <span className="badge badge-secondary-lighten font-13">진열함</span>
          ) : (
            <span className="badge badge-secondary-lighten">진열안함</span>
          )}{" "}
          {item.spoken_korean === "Y" && (
            <span className="badge bg-secondary font-11 fw-normal">음성 한국어</span>
          )}{" "}
          {item.interface_korean === "Y" && (
            <span className="badge bg-secondary font-11 fw-normal">인터페이스/자막 한글</span>
          )}{" "}
          {item.exclusive_korean === "Y" && (
            <span className="badge bg-secondary font-11 fw-normal">독점 한국어</span>
          )}{" "}
          {!item.title_id && (
            <a
              href={`/goods/title_register?title_mode=add_title&product_code=${item.product_code}`}
              className="btn btn-warning btn-sm text-white shadow-none"
            >
              대표상품 등록
            </a>
          )}
        </td>
      </tr>
    </tbody>
  </table>
);

const RadioInline = ({
  name,
  value,
  label,
  current,
  badgeClass,
}: {
  name: string;
  value: string;
  label: string;
  current: string;
  badgeClass?: string;
}) => (
  <div className="form-check form-check-inline">
    <input
      type="radio"
      id={`${name}_${value}`}
      name={name}
      className="form-check-input"
      value={value}
      defaultChecked={current === value}
    />
    <label className="form-check-label" htmlFor={`${name}_${value}`}>
      {badgeClass ? <span className={`badge ${badgeClass} font-13`}>{label}</span> : label}
    </label>
  </div>
);

const FilterForm = ({
  search,
  suppliers,
}: {
  search: OptionEndSearch;
  suppliers: { code: string; name: string }[];
}) => (
  <div className="row g-2">
    <div className="card">
      <h5 className="card-header bg-secondary text-white">옵션상품 검색필터</h5>
      <div className="card-body">
        <form className="form-horizontal" method="get" action={BASE_URL}>
          <div className="row">
            <div className="col-lg-2 mb-2">
              <div className="row">
                <label className="col-sm-5 col-form-label col-form-label-sm bg-light border">
                  옵션상품코드
                </label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="search_product_code"
                    placeholder="옵션상품코드"
                    defaultValue={search.search_product_code}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-5 mb-2">
              <div className="row">
                <label className="col-sm-3 col-form-label col-form-label-sm bg-light border">
                  상품옵션명(국문)
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="search_product_name"
                    placeholder="상품옵션명(국문)"
                    defaultValue={search.search_product_name}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-5 mb-2">
              <div className="row">
                <label className="col-sm-3 col-form-label col-form-label-sm bg-light border">
                  상품옵션명(영문)
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="search_product_name_en"
                    placeholder="상품옵션명(영문)"
                    defaultValue={search.search_product_name_en}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-3 mb-2">
              <div className="row">
                <label className="col-sm-4 col-form-label col-form-label-sm bg-light border">
                  공급처
                </label>
                <div className="col-sm-8">
                  <select
                    name="search_supplier_code"
                    className="form-select"
                    defaultValue={search.search_supplier_code}
                  >
                    <option value="">:::선택:::</option>
                    {suppliers.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-lg-3 mb-2">
              <div className="row">
                <label className="col-sm-4 col-form-label col-form-label-sm bg-light border">
                  플랫폼
                </label>
                <div className="col-sm-8">
                  <select
                    name="search_product_platform"
                    className="form-select"
                    defaultValue={search.search_product_platform}
                  >
                    <option value="">:::선택:::</option>
                    {PLATFORMS.map(([v, t]) => (
                      <option key={v} value={v}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-2">
              <div className="row">
                <label className="col-sm-2 col-form-label col-form-label-sm bg-light border">
                  옵션상품 유형
                </label>
                <div className="col-sm-10 pt-1">
                  <RadioInline
                    name="search_game_type"
                    value="game"
                    label="Game"
                    current={search.search_game_type}
                  />
                  <RadioInline
                    name="search_game_type"
                    value="dlc"
                    label="DLC"
                    current={search.search_game_type}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-3">
              <div className="row">
                <label className="col-sm-4 col-form-label col-form-label-sm bg-light border">
                  진열상태
                </label>
                <div className="col-sm-8 pt-1">
                  <RadioInline
                    name="search_is_view"
                    value="Y"
                    label="진열함"
                    current={search.search_is_view}
                  />
                  <RadioInline
                    name="search_is_view"
                    value="N"
                    label="진열안함"
                    current={search.search_is_view}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-2">
              <div className="row">
                <h6 className="col-sm-2 col-form-label col-form-label-sm bg-light border">
                  판매상태
                </h6>
                <div className="col-sm-8 mt-1">
                  <RadioInline
                    name="search_status"
                    value="9"
                    label="승인대기"
                    badgeClass="badge-secondary-lighten"
                    current={search.search_status}
                  />
                  <RadioInline
                    name="search_status"
                    value="0"
                    label="판매중"
                    badgeClass="badge-primary-lighten"
                    current={search.search_status}
                  />
                  <RadioInline
                    name="search_status"
                    value="1"
                    label="판매중지"
                    badgeClass="badge-warning-lighten"
                    current={search.search_status}
                  />
                  <RadioInline
                    name="search_status"
                    value="3"
                    label="판매종료"
                    badgeClass="badge-danger-lighten"
                    current={search.search_status}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="row">
                <h6 className="col-sm-4 col-form-label col-form-label-sm bg-light border">
                  특전제공유무
                </h6>
                <div className="col-sm-8 mt-1">
                  <RadioInline
                    name="search_is_special"
                    value="Y"
                    label="예"
                    current={search.search_is_special}
                  />
                  <RadioInline
                    name="search_is_special"
                    value="N"
                    label="아니오"
                    current={search.search_is_special}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-5">
              <div className="row">
                <label className="col-sm-3 col-form-label col-form-label-sm bg-light border">
                  한국어 지원
                </label>
                <div className="col-sm-9 mt-1">
                  <div className="form-check form-check-inline">
                    <input
                      type="checkbox"
                      id="search_interface_korean_y"
                      name="search_interface_korean"
                      className="form-check-input"
                      value="Y"
                      defaultChecked={search.search_interface_korean === "Y"}
                    />
                    <label className="form-check-label" htmlFor="search_interface_korean_y">
                      인터페이스/자막
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      type="checkbox"
                      id="search_spoken_korean_y"
                      name="search_spoken_korean"
                      className="form-check-input"
                      value="Y"
                      defaultChecked={search.search_spoken_korean === "Y"}
                    />
                    <label className="form-check-label" htmlFor="search_spoken_korean_y">
                      음성
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      type="checkbox"
                      id="search_exclusive_korean_y"
                      name="search_exclusive_korean"
                      className="form-check-input"
                      value="Y"
                      defaultChecked={search.search_exclusive_korean === "Y"}
                    />
                    <label className="form-check-label" htmlFor="search_exclusive_korean_y">
                      독점
                    </label>
                  </div>
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
);
