import { useState } from "react";
import {
  useHolomodelsList,
  type HolomodelsSearch,
  type OptionListItem,
} from "@entities/goods-option";
import { ServerPagination, ProductStatusBadge } from "@shared/ui";

const BASE_URL = "/goods/goods_holomodels_list";

// legacy goods_holomodels_list.php — 홀로모델 옵션상품 목록(#32 변형).
export const GoodsHolomodelsListScreen = (search: HolomodelsSearch) => {
  const { data } = useHolomodelsList(search);
  if (!data) {
    return null;
  }

  const params: Record<string, string | number> = {
    search_key: search.search_key,
    search_value: search.search_value,
    search_status: search.search_status,
    search_supplier_code: search.search_supplier_code,
    search_product_platform: search.search_product_platform,
    search_game_type: search.search_game_type,
    search_display_type: search.search_display_type,
    search_is_view: search.search_is_view,
    search_soldout: search.search_soldout,
    search_is_bonus: search.search_is_bonus,
    search_is_preorder: search.search_is_preorder,
    search_is_naverpay_coupon: search.search_is_naverpay_coupon,
    search_interface_korean: search.search_interface_korean,
    search_subtitle_korean: search.search_subtitle_korean,
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
                <li className="breadcrumb-item active">옵션상품 목록</li>
              </ol>
            </div>
            <h4 className="page-title">옵션상품 목록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <FilterForm search={search} suppliers={data.suppliers} />

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
        <div className="float-end">
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
                <th className="text-center">옵션상품정보</th>
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
          <div>
            <span className="badge bg-secondary font-11 fw-normal">
              {item.option_type === "digital"
                ? "디지털상품"
                : item.option_type === "retail"
                  ? "실물상품"
                  : ""}
            </span>{" "}
            <span className="badge bg-secondary font-11 fw-normal">{item.game_type_name}</span>{" "}
            <span className="badge bg-secondary font-11 fw-normal">{item.display_type_name}</span>{" "}
            <span className="badge bg-secondary font-11 fw-normal">{item.supplier_name}</span>
          </div>
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
              {item.display_type === "edition" && (
                <a href={link("goods_option_package_register")} className="dropdown-item">
                  <i className="mdi mdi-18px mdi-store me-1" />
                  구성정보 설정
                </a>
              )}
              <a href={link("goods_option_description_register")} className="dropdown-item">
                <i className="mdi mdi-18px mdi-pencil me-1" />
                상세설명 설정
              </a>
              <a href={link("goods_option_genre_register")} className="dropdown-item">
                <i className="mdi mdi-18px mdi-tag me-1" />
                장르 설정
              </a>
              <a href={link("goods_option_category_register")} className="dropdown-item">
                <i className="mdi mdi-18px mdi-tag me-1" />
                카테고리 설정
              </a>
              <a href={link("goods_option_tag_register")} className="dropdown-item">
                <i className="mdi mdi-18px mdi-tag me-1" />
                태그 설정
              </a>
              <a href={link("goods_option_sales_register")} className="dropdown-item">
                <i className="mdi mdi-18px mdi-store me-1" />
                판매 설정
              </a>
              <a
                href={`/goods/goods_option_repay_register?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-sale mdi-18px me-1" />
                포인트 설정
              </a>
              <a href={item.view_url} className="dropdown-item" target="_blank" rel="noreferrer">
                <i className="mdi mdi-link mdi-18px me-1" />
                페이지 미리보기
              </a>
              {item.is_package_view === "Y" && (
                <a
                  href={item.package_view_url}
                  className="dropdown-item"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="mdi mdi-link mdi-18px me-1" />
                  구성안내 미리보기
                </a>
              )}
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
              <tr>
                <th className="bg-light text-center">코드수령제한</th>
                <td colSpan={6}>
                  {item.delivery_date > 0
                    ? `${new Date(item.delivery_date * 1000).toLocaleString()} 이후부터 수령가능`
                    : "미설정"}
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light border-bottom">디지털상품 장르정보</th>
        <td className="bg-white">
          {item.genres.map((g) => (
            <span key={g.code} className="badge bg-secondary font-12 fw-normal me-2 mb-1">
              {g.name}
            </span>
          ))}
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light border-bottom">디지털상품 카테고리정보</th>
        <td className="bg-white">
          {item.categories.map((c) => (
            <span key={c.code} className="badge bg-secondary font-12 fw-normal me-2 mb-1">
              {c.name}
            </span>
          ))}
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light border-bottom">부가정보</th>
        <td className="bg-white">
          Steam Appid <span className="badge badge-info-lighten font-13">{item.steam_appid}</span>{" "}
          Steam Packageid:{" "}
          <span className="badge badge-info-lighten font-13">{item.packageid}</span>{" "}
          {item.bundleid && (
            <>
              Steam Bundleid:{" "}
              <span className="badge badge-info-lighten font-13">{item.bundleid}</span>{" "}
            </>
          )}
          {item.is_view === "Y" ? (
            <span className="badge badge-secondary-lighten font-13">진열함</span>
          ) : (
            <span className="badge badge-secondary-lighten">진열안함</span>
          )}{" "}
          {item.spoken_korean === "Y" && (
            <span className="badge bg-secondary font-11 fw-normal">음성 한국어</span>
          )}{" "}
          {item.interface_korean === "Y" && (
            <span className="badge bg-secondary font-11 fw-normal">인터페이스 한국어</span>
          )}{" "}
          {item.subtitle_korean === "Y" && (
            <span className="badge bg-secondary font-11 fw-normal">자막 한국어</span>
          )}{" "}
          {item.exclusive_korean === "Y" && (
            <span className="badge bg-secondary font-11 fw-normal">독점 한국어</span>
          )}{" "}
          {item.is_bonus === "Y" && (
            <span className="badge bg-info font-12 fw-normal">구매특전</span>
          )}{" "}
          {item.soldout === "Y" && <span className="badge bg-success font-12 fw-normal">품절</span>}{" "}
          {item.is_preorder === "Y" && (
            <span className="badge bg-success font-12 fw-normal">예약판매</span>
          )}{" "}
          {item.is_naverpay_coupon === "Y" && (
            <span className="badge bg-info font-12 fw-normal">네이버페이 포인트 쿠폰</span>
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

const YesNoFilter = ({
  name,
  label,
  current,
  labelColClass = "col-sm-4",
  valueColClass = "col-sm-8",
}: {
  name: string;
  label: string;
  current: string;
  labelColClass?: string;
  valueColClass?: string;
}) => (
  <div className="col-lg-3">
    <div className="row">
      <label className={`${labelColClass} col-form-label col-form-label-sm bg-light border`}>
        {label}
      </label>
      <div className={`${valueColClass} pt-1`}>
        <RadioInline name={name} value="Y" label="예" current={current} />
        <RadioInline name={name} value="N" label="아니오" current={current} />
      </div>
    </div>
  </div>
);

const FilterForm = ({
  search,
  suppliers,
}: {
  search: HolomodelsSearch;
  suppliers: { code: string; name: string }[];
}) => (
  <div className="row g-2">
    <div className="card">
      <h5 className="card-header bg-secondary text-white">옵션상품 검색필터</h5>
      <div className="card-body">
        <form className="form-horizontal" method="get" action={BASE_URL}>
          <div className="row">
            <div className="col-lg-6 mb-2">
              <div className="input-group row">
                <select
                  className="form-select col-sm-3"
                  name="search_key"
                  defaultValue={search.search_key || "search_name"}
                >
                  <option value="search_name">옵션상품명</option>
                  <option value="search_product_code">옵션상품명코드</option>
                  <option value="search_goods_sku">옵션상품sku</option>
                </select>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    name="search_value"
                    placeholder="검색어"
                    defaultValue={search.search_value}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row">
                <h6 className="col-sm-2 col-form-label col-form-label-sm bg-light border">
                  판매상태
                </h6>
                <div className="col-sm-10 mt-1">
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
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 mb-2">
              <div className="row">
                <label className="col-sm-3 col-form-label col-form-label-sm bg-light border">
                  공급처
                </label>
                <div className="col-sm-9">
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
            <div className="col-lg-2">
              <div className="row mb-2">
                <label className="col-sm-5 col-form-label col-form-label-sm bg-light border">
                  옵션상품 구분
                </label>
                <div className="col-sm-7 pt-1">
                  <RadioInline
                    name="search_game_type"
                    value="holomodels"
                    label="홀로모델"
                    current={search.search_game_type}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row">
                <label className="col-sm-2 col-form-label col-form-label-sm bg-light border">
                  진열그룹
                </label>
                <div className="col-sm-10 pt-1">
                  <RadioInline
                    name="search_display_type"
                    value="holomodels"
                    label="홀로모델"
                    current={search.search_display_type}
                  />
                  <RadioInline
                    name="search_display_type"
                    value="holomodelsedition"
                    label="홀로모델 에디션"
                    current={search.search_display_type}
                  />
                  <RadioInline
                    name="search_display_type"
                    value="holomodeldlc"
                    label="홀로모델 DLC"
                    current={search.search_display_type}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-3">
              <div className="row mb-2">
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
            <div className="col-lg-2">
              <div className="row">
                <label className="col-sm-4 col-form-label col-form-label-sm bg-light border">
                  품절여부
                </label>
                <div className="col-sm-8 pt-1">
                  <div className="form-check form-check-inline">
                    <input
                      type="checkbox"
                      id="search_soldout_y"
                      name="search_soldout"
                      className="form-check-input"
                      value="Y"
                      defaultChecked={search.search_soldout === "Y"}
                    />
                    <label className="form-check-label" htmlFor="search_soldout_y">
                      품절
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-3 mb-2">
              <div className="row">
                <label className="col-sm-5 col-form-label col-form-label-sm bg-light border">
                  인터페이스 한국어
                </label>
                <div className="col-sm-7 mt-1">
                  <RadioInline
                    name="search_interface_korean"
                    value="Y"
                    label="예"
                    current={search.search_interface_korean}
                  />
                  <RadioInline
                    name="search_interface_korean"
                    value="N"
                    label="아니오"
                    current={search.search_interface_korean}
                  />
                </div>
              </div>
            </div>
            <YesNoFilter
              name="search_subtitle_korean"
              label="자막 한국어"
              current={search.search_subtitle_korean}
            />
            <YesNoFilter
              name="search_spoken_korean"
              label="음성 한국어"
              current={search.search_spoken_korean}
            />
            <YesNoFilter
              name="search_exclusive_korean"
              label="독점 한국어"
              current={search.search_exclusive_korean}
            />
          </div>

          <div className="row">
            <YesNoFilter name="search_is_bonus" label="구매특전" current={search.search_is_bonus} />
            <YesNoFilter
              name="search_is_preorder"
              label="예약판매"
              current={search.search_is_preorder}
            />
            <div className="col-lg-4">
              <div className="row">
                <label className="col-sm-5 col-form-label col-form-label-sm bg-light border">
                  네이버페이 포인트 쿠폰제공
                </label>
                <div className="col-sm-7 pt-1">
                  <RadioInline
                    name="search_is_naverpay_coupon"
                    value="Y"
                    label="예"
                    current={search.search_is_naverpay_coupon}
                  />
                  <RadioInline
                    name="search_is_naverpay_coupon"
                    value="N"
                    label="아니오"
                    current={search.search_is_naverpay_coupon}
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
);
