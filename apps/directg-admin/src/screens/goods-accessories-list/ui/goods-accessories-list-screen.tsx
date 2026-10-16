import { useState } from "react";
import {
  useAccessoriesList,
  type AccessoriesSearch,
  type AccessoriesListItem,
} from "@entities/goods-title";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/accessories_list";

const salesStatusLabel = (status: string) => {
  switch (status) {
    case "C":
      return "[판매예정]";
    case "S":
      return "[판매중]";
    case "E":
      return "[판매종료]";
    default:
      return "";
  }
};

const ACTIONS: { label: string; icon: string; path: (id: number) => string }[] = [
  { label: "자세히보기", icon: "mdi-eye", path: (id) => `/goods/title_view?title_id=${id}` },
  {
    label: "기본정보 설정",
    icon: "mdi-pencil",
    path: (id) => `/goods/title_modify?title_id=${id}`,
  },
  {
    label: "상품정보 제공고시 설정",
    icon: "mdi-pencil",
    path: (id) => `/goods/title_attribute_set_register?title_id=${id}`,
  },
  {
    label: "태그정보 설정",
    icon: "mdi-tag",
    path: (id) => `/goods/title_tag_register?title_id=${id}&title_code=12`,
  },
  {
    label: "동영상 설정",
    icon: "mdi-pencil",
    path: (id) => `/goods/title_media_register?title_id=${id}`,
  },
  {
    label: "스크린샷 설정",
    icon: "mdi-pencil",
    path: (id) => `/goods/title_screenshot_register?title_id=${id}`,
  },
  {
    label: "이미지 설정",
    icon: "mdi-image",
    path: (id) => `/goods/title_image_register?title_id=${id}`,
  },
  {
    label: "상세설명 설정",
    icon: "mdi-alert-box",
    path: (id) => `/goods/title_description_register?mode=modify&title_id=${id}`,
  },
  {
    label: "관련상품 설정",
    icon: "mdi-pencil",
    path: (id) => `/goods/title_option_register?title_id=${id}`,
  },
];

// legacy accessories_list.php — 실물상품 목록(대표상품 레벨, title_code=12).
export const GoodsAccessoriesListScreen = (search: AccessoriesSearch) => {
  const { data } = useAccessoriesList(search);
  if (!data) {
    return null;
  }
  const params: Record<string, string | number> = {
    search_key: search.search_key,
    search_value: search.search_value,
    search_age_limit: search.search_age_limit,
    search_is_view: search.search_is_view,
    search_sales_status: search.search_sales_status,
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
                    대표상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">실물상품 목록</li>
              </ol>
            </div>
            <h4 className="page-title">실물상품 목록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <FilterForm search={search} />

      <div className="row mb-2">
        <div className="col-12">
          <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
          <div className="float-end">
            <a href="/goods/title_register" className="btn btn-danger shadow-none">
              대표상품 등록
            </a>
          </div>
        </div>
      </div>

      {data.items.map((item) => (
        <AccessoryCard key={item.title_id} item={item} />
      ))}

      <div className="text-center mt-3">
        <ServerPagination
          page={data.pagination.current_page}
          totalPages={data.pagination.total_pages}
          baseUrl={BASE_URL}
          params={params}
        />
      </div>
    </>
  );
};

const AccessoryCard = ({ item }: { item: AccessoriesListItem }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const a = item.attribute;
  return (
    <div className="card">
      <div className="card-header p-2">
        <div className={`dropdown card-widgets${menuOpen ? " show" : ""}`}>
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
          {/* Bootstrap JS(Popper) 미로드 → data-bs-popper 정적 부여로 top:100%/right:0 위치 재현. */}
          <div
            className={`dropdown-menu dropdown-menu-end${menuOpen ? " show" : ""}`}
            data-bs-popper="static"
          >
            {ACTIONS.map((act) => (
              <a key={act.label} href={act.path(item.title_id)} className="dropdown-item">
                <i className={`mdi mdi-18px ${act.icon} me-1`} />
                {act.label}
              </a>
            ))}
          </div>
        </div>
        <div className="d-flex align-items-start">
          <div className="w-100 overflow-hidden">
            <h5 className="card-title">
              {item.title_name}{" "}
              <small className="card-subtitle text-muted fw-normal">({item.title_name_en})</small>{" "}
              <span className="text-muted">[{item.sku}]</span>
            </h5>
          </div>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="title-container">
          <div className="title-a">
            <div className="p-2">
              <table className="table table-centered table-sm table-bordered border caption-top mb-1">
                <caption className="py-1">대표상품 기본정보</caption>
                <tbody className="font-12">
                  <tr>
                    <th className="table-light font-13" style={{ width: "100px" }}>
                      대표상품번호
                    </th>
                    <td>{item.title_id}</td>
                  </tr>
                  <tr>
                    <th className="table-light font-13" style={{ width: "80px" }}>
                      퍼블리셔
                    </th>
                    <td>{item.publisher}</td>
                  </tr>
                  <tr>
                    <th className="table-light font-13" style={{ width: "80px" }}>
                      제조사
                    </th>
                    <td>{item.developer}</td>
                  </tr>
                </tbody>
              </table>

              <table className="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
                <caption className="py-1">대표상품 진열정보</caption>
                <tbody className="font-13">
                  <tr>
                    <th className="table-light" style={{ width: "100px" }}>
                      진열상태
                    </th>
                    <td>{item.is_view}</td>
                  </tr>
                  <tr>
                    <th className="table-light">판매상태</th>
                    <td>{salesStatusLabel(item.sales_status)}</td>
                  </tr>
                </tbody>
              </table>

              <table className="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
                <caption className="py-1">대표상품 태그정보</caption>
                <tbody className="font-13">
                  <tr>
                    <th className="table-light" style={{ width: "100px" }}>
                      카테고리
                    </th>
                    <td>
                      {item.categories.map((c) => (
                        <span key={c.code} className="badge bg-info font-12 fw-normal me-2 mb-1">
                          {c.name}
                        </span>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="table table-centered w-100 nowrap table-sm table-bordered border caption-top mb-1">
                <caption className="py-1">관련옵션상품</caption>
                <thead className="table-secondary font-13">
                  <tr>
                    <th className="text-center" style={{ width: "100px" }}>
                      옵션구분
                    </th>
                    <th className="text-center">판매예정</th>
                    <th className="text-center">판매중</th>
                    <th className="text-center">판매종료</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  <tr>
                    <th className="bg-light">택배발송</th>
                    <td className="text-center">{item.counts.taekbae_9.toLocaleString()}</td>
                    <td className="text-center">{item.counts.taekbae_0.toLocaleString()}</td>
                    <td className="text-center">{item.counts.taekbae_3.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">코드+택배발송</th>
                    <td className="text-center">{item.counts.code_9.toLocaleString()}</td>
                    <td className="text-center">{item.counts.code_0.toLocaleString()}</td>
                    <td className="text-center">{item.counts.code_3.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="title-b">
            <div className="p-2">
              <table className="table table-centered w-100 nowrap table-sm table-bordered border caption-top mb-1">
                <caption className="py-1">상품정보제공고시</caption>
                <colgroup>
                  <col width="20%" />
                  <col width="*" />
                </colgroup>
                <tbody className="font-12">
                  <tr>
                    <th className="bg-light">모델명</th>
                    <td>{a.model_name}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">품명</th>
                    <td>{a.product_name}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">KC 인증정보</th>
                    <td>
                      {a.kc_safety_infomartion}{" "}
                      <a
                        href={`https://www.rra.go.kr/ko/license/A_b_popup_keyno.do?key_no=${a.kc_safety_infomartion}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-light font-12 shadow-none border"
                      >
                        인증정보 확인
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-light">정격전압</th>
                    <td>{a.rated_voltage}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">소비전력</th>
                    <td>{a.power}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">크기(mm)</th>
                    <td>{a.size}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">무게(kg)</th>
                    <td>{a.weight}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">동일모델의 출시년월</th>
                    <td>{a.manufacturing_date}</td>
                  </tr>
                  <tr>
                    <th className="bg-light"> 제조자/수입자</th>
                    <td>{a.manufacturer}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">제조국</th>
                    <td>{a.manufacture_country}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">주요사양</th>
                    <td>{a.main_requirements}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">품질보증기준</th>
                    <td>{a.warranty_service}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">A/S 책임자(전화번호)</th>
                    <td>{a.as_information}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      {badgeClass ? (
        <span className={`badge ${badgeClass} font-13 fw-normal`}>{label}</span>
      ) : (
        label
      )}
    </label>
  </div>
);

const FilterForm = ({ search }: { search: AccessoriesSearch }) => (
  <div className="row g-2">
    <div className="card">
      <h5 className="card-header bg-secondary text-white">대표상품 검색필터</h5>
      <div className="card-body py-2">
        <form className="form-horizontal" method="get" action={BASE_URL}>
          <div className="row mb-2">
            <div className="col-lg-6">
              <div className="input-group row">
                <select
                  className="form-select col-sm-3"
                  name="search_key"
                  defaultValue={search.search_key || "search_name"}
                >
                  <option value="search_name">대표상품명</option>
                  <option value="search_title_id">대표상품명코드</option>
                  <option value="search_publisher">퍼블리셔</option>
                  <option value="search_developer">개발사</option>
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
                  심의등급
                </h6>
                <div className="col-sm-10 mt-1">
                  <RadioInline
                    name="search_age_limit"
                    value="10"
                    label="전체이용가"
                    badgeClass="bg-success"
                    current={search.search_age_limit}
                  />
                  <RadioInline
                    name="search_age_limit"
                    value="12"
                    label="12세이용가"
                    badgeClass="bg-primary"
                    current={search.search_age_limit}
                  />
                  <RadioInline
                    name="search_age_limit"
                    value="15"
                    label="15세이용가"
                    badgeClass="bg-warning"
                    current={search.search_age_limit}
                  />
                  <RadioInline
                    name="search_age_limit"
                    value="19"
                    label="청소년이용불가"
                    badgeClass="bg-danger"
                    current={search.search_age_limit}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-lg-4">
              <div className="row">
                <label className="col-sm-4 col-form-label col-form-label-sm bg-light border">
                  게임 페이지 노출
                </label>
                <div className="col-sm-8 pt-1">
                  <RadioInline
                    name="search_is_view"
                    value="all"
                    label="전체"
                    current={search.search_is_view || "all"}
                  />
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
            <div className="col-lg-4">
              <div className="row">
                <label className="col-sm-4 col-form-label col-form-label-sm bg-light border">
                  판매상태
                </label>
                <div className="col-sm-8 pt-1">
                  <RadioInline
                    name="search_sales_status"
                    value="C"
                    label="판매예정"
                    current={search.search_sales_status}
                  />
                  <RadioInline
                    name="search_sales_status"
                    value="S"
                    label="판매중"
                    current={search.search_sales_status}
                  />
                  <RadioInline
                    name="search_sales_status"
                    value="E"
                    label="판매종료"
                    current={search.search_sales_status}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="float-end">
                <button type="submit" className="btn btn-primary shadow-none">
                  대표상품 검색
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
);
