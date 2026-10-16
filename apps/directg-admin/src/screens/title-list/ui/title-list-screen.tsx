import { useEffect, useState } from "react";
import {
  useGoodsTitleList,
  useSyncSteamTitle,
  type GoodsOptionCounts,
  type GoodsTitleListItem,
} from "@entities/goods-title";
import { ServerPagination } from "@shared/ui";

export type TitleListSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_is_view: string;
  search_sales_status: string;
  search_age_limit: string;
  search_interface_korean: string;
  search_subtitle_korean: string;
  search_spoken_korean: string;
  search_exclusive_korean: string;
};

type TitleListScreenProps = TitleListSearch;

const BASE_URL = "/goods/title_list";

// 관련상품 카운트 6행(옵션구분) — key 접두 + _9/_0/_3.
const COUNT_ROWS = [
  { label: "기본게임", key: "game" },
  { label: "에디션", key: "edition" },
  { label: "DLC", key: "dlc" },
  { label: "홀로모델", key: "holo" },
  { label: "홀로모델 에디션", key: "holo_edition" },
  { label: "홀로모델 DLC", key: "holo_dlc" },
] as const;

const countOf = (counts: GoodsOptionCounts, key: string, status: "9" | "0" | "3") =>
  counts[`${key}_${status}` as keyof GoodsOptionCounts] ?? 0;

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

const ACTION_LINKS = [
  {
    label: "자세히보기",
    icon: "mdi-eye",
    path: (id: number) => `/goods/title_view?title_id=${id}`,
  },
  {
    label: "기본정보 설정",
    icon: "mdi-pencil",
    path: (id: number) => `/goods/title_modify?title_id=${id}`,
  },
  {
    label: "심의정보 설정",
    icon: "mdi-pencil",
    path: (id: number) => `/goods/title_grac_register?title_id=${id}`,
  },
  {
    label: "태그정보 설정",
    icon: "mdi-tag",
    path: (id: number) => `/goods/title_tag_register?title_id=${id}`,
  },
  {
    label: "동영상 설정",
    icon: "mdi-pencil",
    path: (id: number) => `/goods/title_media_register?title_id=${id}`,
  },
  {
    label: "스크린샷 설정",
    icon: "mdi-pencil",
    path: (id: number) => `/goods/title_screenshot_register?title_id=${id}`,
  },
  {
    label: "이미지 설정",
    icon: "mdi-image",
    path: (id: number) => `/goods/title_image_register?title_id=${id}`,
  },
  {
    label: "상세설명 설정",
    icon: "mdi-alert-box",
    path: (id: number) => `/goods/title_description_register?mode=modify&title_id=${id}`,
  },
  {
    label: "관련상품 설정",
    icon: "mdi-pencil",
    path: (id: number) => `/goods/title_option_register?title_id=${id}`,
  },
] as const;

const TitleCard = ({
  item,
  onSteamSync,
}: {
  item: GoodsTitleListItem;
  onSteamSync: (titleId: number, appid: number) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const grac = item.grac;

  return (
    <div className="card">
      <div className="card-header p-2">
        <div className={`dropdown card-widgets${menuOpen ? " show" : ""}`}>
          <a
            href="#"
            className="dropdown-toggle arrow-none"
            aria-expanded={menuOpen}
            onClick={(event) => {
              event.preventDefault();
              setMenuOpen((open) => !open);
            }}
          >
            <i className="dripicons-dots-3" />
          </a>
          {/* Bootstrap JS(Popper) 미로드 → 위치 규칙(.dropdown-menu[data-bs-popper])이 안 걸림.
              JS가 열 때 붙이는 data-bs-popper를 정적으로 부여해 top:100%/right:0(end) 위치를 재현. */}
          <div
            className={`dropdown-menu dropdown-menu-end${menuOpen ? " show" : ""}`}
            data-bs-popper="static"
          >
            {ACTION_LINKS.map((action) => (
              <a key={action.label} href={action.path(item.title_id)} className="dropdown-item">
                <i className={`mdi mdi-18px ${action.icon} me-1`} />
                {action.label}
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
          {/* title-a: 이미지 + 기본정보 + 진열정보 */}
          <div className="title-a">
            <img
              src={`/upload/title/${item.title_id}/header/${item.title_id}.jpg`}
              alt=""
              className=""
            />
            <div className="p-2">
              <table className="table table-centered table-sm table-bordered border caption-top mb-1">
                <caption className="py-1">대표상품 기본정보</caption>
                <tbody className="font-13">
                  <tr>
                    <th className="table-light" style={{ width: "100px" }}>
                      대표상품번호
                    </th>
                    <td>{item.title_id}</td>
                  </tr>
                  <tr>
                    <th className="table-light">퍼블리셔</th>
                    <td>{item.publisher}</td>
                  </tr>
                  <tr>
                    <th className="table-light" style={{ width: "80px" }}>
                      개발사
                    </th>
                    <td>{item.developer}</td>
                  </tr>
                  <tr>
                    <th className="table-light">출시일</th>
                    <td>{item.release_date}</td>
                  </tr>
                  <tr>
                    <th className="table-light" style={{ width: "80px" }}>
                      한국어지원
                    </th>
                    <td>
                      {item.interface_korean === "Y" && (
                        <span className="badge bg-secondary text-light font-12 fw-normal mb-1">
                          인터페이스
                        </span>
                      )}{" "}
                      {item.subtitle_korean === "Y" && (
                        <span className="badge bg-secondary text-light font-12 fw-normal mb-1">
                          자막
                        </span>
                      )}{" "}
                      {item.spoken_korean === "Y" && (
                        <span className="badge bg-secondary text-light font-12 fw-normal mb-1">
                          음성
                        </span>
                      )}{" "}
                      {item.exclusive_korean === "Y" && (
                        <span className="badge bg-info text-light font-12 fw-normal mb-1">
                          독점 한국어
                        </span>
                      )}
                    </td>
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
            </div>
          </div>

          {/* title-b: 관련상품정보 카운트 */}
          <div className="title-b">
            <div className="p-2">
              <table className="table table-centered w-100 nowrap table-sm table-bordered border caption-top mb-1">
                <caption className="py-1">관련상품정보</caption>
                <thead className="table-secondary font-13">
                  <tr>
                    <th className="text-center">옵션구분</th>
                    <th className="text-center">판매예정</th>
                    <th className="text-center">판매중</th>
                    <th className="text-center">판매종료</th>
                  </tr>
                </thead>
                <tbody>
                  {COUNT_ROWS.map((row) => (
                    <tr key={row.key}>
                      <th className="bg-light">{row.label}</th>
                      <td className="text-center">
                        {countOf(item.counts, row.key, "9").toLocaleString()}
                      </td>
                      <td className="text-center">
                        {countOf(item.counts, row.key, "0").toLocaleString()}
                      </td>
                      <td className="text-center">
                        {countOf(item.counts, row.key, "3").toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* title-c: 심의정보 */}
          <div className="title-c">
            <div className="p-2">
              <table className="table table-centered nowrap table-sm table-bordered border caption-top">
                <caption className="py-1">대표상품 심의정보</caption>
                <tbody className="font-13">
                  <tr>
                    <th className="table-light" style={{ width: "100px" }}>
                      등급분류기관
                    </th>
                    <td>{grac?.orgname ?? ""}</td>
                  </tr>
                  <tr>
                    <th className="table-light">심의업체명</th>
                    <td>{grac?.entname ?? ""}</td>
                  </tr>
                  <tr>
                    <th className="table-light">등급분류일자</th>
                    <td>{grac?.rateddate ?? ""}</td>
                  </tr>
                  <tr>
                    <th className="table-light">결정등급</th>
                    <td>{grac?.givenrate ?? ""}</td>
                  </tr>
                  <tr>
                    <th className="table-light">내용정보표시</th>
                    <td>{grac?.descriptors ?? ""}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* title-d: 부가정보 */}
          <div className="title-d">
            <div className="p-2">
              <table className="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
                <caption className="py-1">대표상품 부가정보</caption>
                <tbody className="font-13">
                  <tr>
                    <th className="table-light" style={{ width: "100px" }}>
                      Steam Appid
                    </th>
                    <td>
                      {item.steam_appid || ""}{" "}
                      {item.steam_appid > 0 && !item.steam_synced && (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary shadow-none btn_steam_sync"
                          data-appid={item.steam_appid}
                          data-titleid={item.title_id}
                          onClick={() => onSteamSync(item.title_id, item.steam_appid)}
                        >
                          스팀 동기화
                        </button>
                      )}
                    </td>
                  </tr>
                  {item.franchise_idx > 0 && (
                    <tr>
                      <th className="table-light" style={{ width: "80px" }}>
                        프랜차이즈
                      </th>
                      <td>{item.franchise_name}</td>
                    </tr>
                  )}
                  <tr>
                    <th className="table-light" style={{ width: "80px" }}>
                      제 3자 DRM
                    </th>
                    <td>{item.drm_notice}</td>
                  </tr>
                  <tr>
                    <th className="table-light" style={{ width: "80px" }}>
                      타사 계정
                    </th>
                    <td>{item.ext_user_account_notice}</td>
                  </tr>
                  <tr>
                    <th className="table-light" style={{ width: "80px" }}>
                      조회수
                    </th>
                    <td>{item.hit.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* title-tag: 태그정보 */}
          <div className="title-tag">
            <div className="p-2">
              <table className="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
                <caption className="py-1">대표상품 태그정보</caption>
                <tbody className="font-13">
                  <tr>
                    <th className="table-light">대표장르</th>
                    <td>
                      {item.genres.map((genre) => (
                        <span
                          key={genre.code}
                          className="badge bg-primary font-13 fw-normal me-2 mb-1"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </td>
                  </tr>
                  <tr>
                    <th className="table-light">카테고리</th>
                    <td>
                      {item.categories.map((category) => (
                        <span
                          key={category.code}
                          className="badge bg-info font-13 fw-normal me-2 mb-1"
                        >
                          {category.name}
                        </span>
                      ))}
                    </td>
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

export const TitleListScreen = (search: TitleListScreenProps) => {
  useEffect(() => {
    document.title = "디지털상품 목록";
  }, []);

  const { data } = useGoodsTitleList(search);
  const steamSyncMutation = useSyncSteamTitle();

  const items = data?.items ?? [];
  const totalResults = data?.pagination.total_results ?? 0;
  const totalPages = data?.pagination.total_pages ?? 0;

  const handleSteamSync = (titleId: number, appid: number) => {
    steamSyncMutation.mutate({ titleId, payload: { steam_appid: appid } });
  };

  const isChecked = (field: keyof TitleListSearch, value: string) => search[field] === value;

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    대표상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">디지털상품 목록</li>
              </ol>
            </div>
            <h4 className="page-title">디지털상품 목록</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
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
                      id="search_key"
                      defaultValue={search.search_key || "search_name"}
                    >
                      <option value="search_name">대표상품명</option>
                      <option value="search_title_id">대표상품코드</option>
                      <option value="search_title_sku">대표상품sku</option>
                      <option value="search_publisher">퍼블리셔</option>
                      <option value="search_developer">개발사</option>
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
                    <h6 className="col-sm-2 col-form-label col-form-label-sm bg-light border">
                      심의등급
                    </h6>
                    <div className="col-sm-10 mt-1">
                      {[
                        { value: "10", label: "전체이용가", badge: "bg-success" },
                        { value: "12", label: "12세이용가", badge: "bg-primary" },
                        { value: "15", label: "15세이용가", badge: "bg-warning" },
                        { value: "19", label: "청소년이용불가", badge: "bg-danger" },
                      ].map((age) => (
                        <div key={age.value} className="form-check form-check-inline">
                          <input
                            type="radio"
                            id={`search_age_limit_${age.value}`}
                            name="search_age_limit"
                            className="form-check-input"
                            value={age.value}
                            defaultChecked={isChecked("search_age_limit", age.value)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_age_limit_${age.value}`}
                          >
                            <span className={`badge ${age.badge} font-13 fw-normal`}>
                              {age.label}
                            </span>
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
                      게임 페이지 노출
                    </label>
                    <div className="col-sm-8 pt-1">
                      {[
                        { value: "all", label: "전체" },
                        { value: "Y", label: "진열함" },
                        { value: "N", label: "진열안함" },
                      ].map((view) => (
                        <div key={view.value} className="form-check form-check-inline">
                          <input
                            type="radio"
                            id={`search_is_view_${view.value}`}
                            name="search_is_view"
                            className="form-check-input"
                            value={view.value}
                            defaultChecked={(search.search_is_view || "all") === view.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_is_view_${view.value}`}
                          >
                            {view.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_sales_status"
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      판매상태
                    </label>
                    <div className="col-sm-8 pt-1">
                      {[
                        { value: "C", label: "판매예정" },
                        { value: "S", label: "판매중" },
                        { value: "E", label: "판매종료" },
                      ].map((status) => (
                        <div key={status.value} className="form-check form-check-inline">
                          <input
                            type="radio"
                            id={`search_sales_status_${status.value.toLowerCase()}`}
                            name="search_sales_status"
                            className="form-check-input"
                            value={status.value}
                            defaultChecked={isChecked("search_sales_status", status.value)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_sales_status_${status.value.toLowerCase()}`}
                          >
                            {status.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                {[
                  {
                    name: "search_interface_korean",
                    label: "인터페이스 한국어",
                    labelCol: "col-sm-5",
                    valueCol: "col-sm-7",
                  },
                  {
                    name: "search_subtitle_korean",
                    label: "자막 한국어",
                    labelCol: "col-sm-4",
                    valueCol: "col-sm-8",
                  },
                  {
                    name: "search_spoken_korean",
                    label: "음성 한글",
                    labelCol: "col-sm-3",
                    valueCol: "col-sm-9",
                  },
                  {
                    name: "search_exclusive_korean",
                    label: "독점 한국어",
                    labelCol: "col-sm-3",
                    valueCol: "col-sm-9",
                  },
                ].map((field) => (
                  <div key={field.name} className="col-lg-3">
                    <div className="row">
                      <label
                        htmlFor={field.name}
                        className={`${field.labelCol} col-form-label col-form-label-sm bg-light border`}
                      >
                        {field.label}
                      </label>
                      <div className={`${field.valueCol} mt-1`}>
                        {[
                          { value: "Y", label: "지원" },
                          { value: "N", label: "미지원" },
                        ].map((opt) => (
                          <div key={opt.value} className="form-check form-check-inline">
                            <input
                              type="checkbox"
                              id={`${field.name}_${opt.value.toLowerCase()}`}
                              name={field.name}
                              className="form-check-input"
                              value={opt.value}
                              defaultChecked={
                                search[field.name as keyof TitleListSearch] === opt.value
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`${field.name}_${opt.value.toLowerCase()}`}
                            >
                              {opt.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
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

      <div className="row mb-2">
        <div className="col-12">
          <div className="float-start">{totalResults.toLocaleString()} 개</div>
          <div className="float-end">
            <a href="/goods/title_register" className="btn btn-danger shadow-none">
              대표상품 등록
            </a>
          </div>
        </div>
      </div>

      {items.map((item) => (
        <TitleCard key={item.title_id} item={item} onSteamSync={handleSteamSync} />
      ))}

      <div className="text-center mt-3">
        <ServerPagination
          page={search.page}
          totalPages={totalPages}
          baseUrl={BASE_URL}
          params={{
            search_key: search.search_key,
            search_value: search.search_value,
            search_is_view: search.search_is_view,
            search_sales_status: search.search_sales_status,
            search_age_limit: search.search_age_limit,
            search_interface_korean: search.search_interface_korean,
            search_subtitle_korean: search.search_subtitle_korean,
            search_spoken_korean: search.search_spoken_korean,
            search_exclusive_korean: search.search_exclusive_korean,
          }}
        />
      </div>
    </>
  );
};
