import { useState } from "react";
import { useGoodsOptionList, type OptionListItem, type OptionTag } from "@entities/goods-option";
import { ServerPagination, ProductStatusBadge } from "@shared/ui";

const BASE_URL = "/goods/goods_option_list";

export type OptionListSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_status: string;
  search_product_platform: string;
  search_supplier_code: string;
  search_game_type: string;
  search_is_view: string;
  search_display_type: string;
  search_interface_korean: string;
  search_subtitle_korean: string;
  search_spoken_korean: string;
  search_exclusive_korean: string;
  search_is_preorder: string;
  search_is_bonus: string;
  search_is_naverpay_coupon: string;
  search_is_auth: string;
  search_soldout: string;
};

const PLATFORMS = [
  ["1", "Steam"],
  ["34", "Epic"],
  ["30", "Ubisoft Connect"],
  ["35", "Rockstar Games Launcher"],
  ["33", "Bethesda"],
  ["3", "Orgin"],
  ["32", "기타"],
];
const GAME_TYPES = [
  ["game", "게임"],
  ["dlc", "DLC"],
  ["music", "사운드트랙"],
  ["bundle", "번들"],
];
const DISPLAY_TYPES = [
  ["basic", "기본게임"],
  ["edition", "에디션"],
  ["multi", "멀티팩"],
  ["dlc", "DLC"],
  ["game_bundle", "기본게임번들"],
  ["dlc_bundle", "DLC번들"],
  ["etc_bundle", "기타번들"],
];

// legacy goods_option_list.php — 옵션상품 목록.
// variant(선택): goods_timedeal_list.php 재사용 — display_type 고정 + 제목/URL 대체(미전달 시 option_list 동작).
export const GoodsOptionListScreen = (
  props: OptionListSearch & {
    lockedDisplayType?: string;
    variantTitle?: string;
    variantBaseUrl?: string;
  },
) => {
  const { lockedDisplayType, variantTitle, variantBaseUrl, ...rest } = props;
  const search: OptionListSearch = lockedDisplayType
    ? { ...rest, search_display_type: lockedDisplayType }
    : rest;
  const baseUrl = variantBaseUrl ?? BASE_URL;
  const title = variantTitle ?? "옵션상품 목록";
  const { data } = useGoodsOptionList(search);
  if (!data) {
    return null;
  }

  const params: Record<string, string | number> = {
    search_key: search.search_key,
    search_value: search.search_value,
    search_status: search.search_status,
    search_product_platform: search.search_product_platform,
    search_supplier_code: search.search_supplier_code,
    search_game_type: search.search_game_type,
    search_is_view: search.search_is_view,
    search_display_type: search.search_display_type,
    search_interface_korean: search.search_interface_korean,
    search_subtitle_korean: search.search_subtitle_korean,
    search_spoken_korean: search.search_spoken_korean,
    search_exclusive_korean: search.search_exclusive_korean,
    search_is_preorder: search.search_is_preorder,
    search_is_bonus: search.search_is_bonus,
    search_is_naverpay_coupon: search.search_is_naverpay_coupon,
    search_is_auth: search.search_is_auth,
    search_soldout: search.search_soldout,
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
                <li className="breadcrumb-item active">{title}</li>
              </ol>
            </div>
            <h4 className="page-title">{title}</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <FilterForm
        search={search}
        suppliers={data.suppliers}
        baseUrl={baseUrl}
        lockedDisplayType={lockedDisplayType}
      />

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
                <OptionRows key={item.product_code} item={item} />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={baseUrl}
              params={params}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const won = (n: number) => `${n.toLocaleString()}원`;

const OptionRows = ({ item }: { item: OptionListItem }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <tr className="table-active">
        <td className="text-center">
          <a
            href={`/statistics/order/order_goods_count?search_product_code=${item.product_code}`}
            target="_blank"
            rel="noreferrer"
            title="주문통계 보기"
          >
            {item.product_code}
          </a>
        </td>
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
              {item.display_type === "edition" && (
                <a
                  href={`/goods/goods_option_package_register?product_code=${item.product_code}`}
                  className="dropdown-item"
                >
                  <i className="mdi mdi-18px mdi-store me-1" />
                  구성정보 설정
                </a>
              )}
              <a
                href={`/goods/goods_option_description_register?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-18px mdi-pencil me-1" />
                상세설명 설정
              </a>
              <a
                href={`/goods/goods_option_genre_register?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-18px mdi-tag me-1" />
                장르 설정
              </a>
              <a
                href={`/goods/goods_option_category_register?product_code=${item.product_code}`}
                className="dropdown-item"
              >
                <i className="mdi mdi-18px mdi-tag me-1" />
                카테고리 설정
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
        <th className="text-center bg-light border-bottom">게임 장르정보</th>
        <td className="bg-white">
          {item.genres.map((g: OptionTag) => (
            <span key={g.code} className="badge bg-secondary font-12 fw-normal me-2 mb-1">
              {g.name}
            </span>
          ))}
        </td>
      </tr>
      <tr>
        <th className="text-center bg-light border-bottom">게임 카테고리정보</th>
        <td className="bg-white">
          {item.categories.map((c: OptionTag) => (
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
          {item.is_auth === "Y" && (
            <span className="badge bg-warning font-12 fw-normal">본인인증 필수</span>
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

const FilterForm = ({
  search,
  suppliers,
  baseUrl,
  lockedDisplayType,
}: {
  search: OptionListSearch;
  suppliers: OptionTag[];
  baseUrl: string;
  lockedDisplayType?: string;
}) => (
  <div className="row g-2">
    <div className="card">
      <h5 className="card-header bg-secondary text-white">옵션상품 검색필터</h5>
      <div className="card-body">
        <form className="form-horizontal" method="get" action={baseUrl}>
          <div className="row">
            <div className="col-6 mb-2">
              <div className="input-group row">
                <select
                  className="form-select col-3"
                  name="search_key"
                  defaultValue={search.search_key || "search_name"}
                >
                  <option value="search_name">옵션상품명</option>
                  <option value="search_product_code">옵션상품명코드</option>
                  <option value="search_goods_sku">옵션상품sku</option>
                </select>
                <div className="col-9">
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
            <div className="col-6">
              <div className="row">
                <h6 className="col-2 col-form-label col-form-label-sm bg-light border">판매상태</h6>
                <div className="col-10 mt-1">
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
            <div className="col-4 mb-2">
              <div className="row">
                <label className="col-4 col-form-labe col-form-label-sm bg-light border">
                  플랫폼
                </label>
                <div className="col-8">
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
            <div className="col-4 mb-2">
              <div className="row">
                <label className="col-4 col-form-labe col-form-label-sm bg-light border">
                  공급처
                </label>
                <div className="col-8">
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
            <div className="col-4">
              <div className="row mb-2">
                <label className="col-4 col-form-label col-form-label-sm bg-light border">
                  옵션상품 구분
                </label>
                <div className="col-8 pt-1">
                  {GAME_TYPES.map(([v, t]) => (
                    <RadioInline
                      key={v}
                      name="search_game_type"
                      value={v}
                      label={t}
                      current={search.search_game_type}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-4">
              <div className="row mb-2">
                <label className="col-4 col-form-label col-form-label-sm bg-light border">
                  진열상태
                </label>
                <div className="col-8 pt-1">
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
            {!lockedDisplayType && (
              <div className="col-8">
                <div className="row">
                  <label className="col-2 col-form-label col-form-label-sm bg-light border">
                    진열그룹
                  </label>
                  <div className="col-10 pt-1">
                    {DISPLAY_TYPES.map(([v, t]) => (
                      <RadioInline
                        key={v}
                        name="search_display_type"
                        value={v}
                        label={t}
                        current={search.search_display_type}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="row">
            <KoreanFilter
              name="search_interface_korean"
              label="인터페이스 한국어"
              current={search.search_interface_korean}
            />
            <KoreanFilter
              name="search_subtitle_korean"
              label="자막 한국어"
              current={search.search_subtitle_korean}
            />
            <KoreanFilter
              name="search_spoken_korean"
              label="음성 한국어"
              current={search.search_spoken_korean}
            />
            <KoreanFilter
              name="search_exclusive_korean"
              label="독점 한국어"
              current={search.search_exclusive_korean}
            />
          </div>

          <div className="row">
            <YesNoFilter
              name="search_is_preorder"
              label="예약판매"
              current={search.search_is_preorder}
            />
            <YesNoFilter name="search_is_bonus" label="구매특전" current={search.search_is_bonus} />
            <YesNoFilter
              name="search_is_naverpay_coupon"
              label="네이버페이 포인트 쿠폰제공"
              labelColClass="col-6"
              valueColClass="col-6"
              current={search.search_is_naverpay_coupon}
            />
            <YesNoFilter
              name="search_is_auth"
              label="본인인증 필수"
              current={search.search_is_auth}
            />
          </div>
          <div className="row">
            <div className="col-3 mb-2">
              <div className="row">
                <label className="col-5 col-form-label col-form-label-sm bg-light border">
                  품절여부
                </label>
                <div className="col-7 pt-1">
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
            <div className="col-12">
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
  badgeClass?: string; // legacy 판매상태: 라벨을 색상 뱃지로 렌더
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

const KoreanFilter = ({
  name,
  label,
  current,
}: {
  name: string;
  label: string;
  current: string;
}) => (
  <div className="col-3 mb-2">
    <div className="row">
      <label className="col-5 col-form-label col-form-label-sm bg-light border">{label}</label>
      <div className="col-7 mt-1">
        <RadioInline name={name} value="Y" label="예" current={current} />
        <RadioInline name={name} value="N" label="아니오" current={current} />
      </div>
    </div>
  </div>
);

const YesNoFilter = ({
  name,
  label,
  current,
  labelColClass = "col-5",
  valueColClass = "col-7",
}: {
  name: string;
  label: string;
  current: string;
  labelColClass?: string;
  valueColClass?: string;
}) => (
  <div className="col-3 mb-2">
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
