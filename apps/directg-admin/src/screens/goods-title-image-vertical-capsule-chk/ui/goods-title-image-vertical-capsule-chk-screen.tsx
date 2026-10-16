import {
  useTitleImageVerticalChkList,
  useHeroCapsuleChk,
  type TitleImageVerticalChkSearch,
  type TitleImageChkListItem,
} from "@entities/goods-title";
import { ServerPagination } from "@shared/ui";
import { useProductViewer } from "@shared/lib/use-product-viewer";

const BASE_URL = "/goods/title_image_vertical_capsule_chk";

const SEARCH_KEYS: { value: string; label: string }[] = [
  { value: "search_name", label: "대표상품명" },
  { value: "search_title_id", label: "대표상품명코드" },
  { value: "search_publisher", label: "퍼블리셔" },
  { value: "search_developer", label: "개발사" },
];

const DOMAINS: { value: string; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "https://directg.net", label: "웹서버" },
  { value: "https://image.directg.net", label: "디스크엔" },
];

const IS_VIEWS: { value: string; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "Y", label: "진열함" },
  { value: "N", label: "진열안함" },
];

// legacy Vertical capsule은 판매상태 C/S만(E 없음).
const SALES_STATUSES: { value: string; label: string }[] = [
  { value: "C", label: "판매예정" },
  { value: "S", label: "판매중" },
];

const IS_HEROES: { value: string; label: string }[] = [
  { value: "200", label: "있음" },
  { value: "404", label: "없음" },
];

const SALES_STATUS_LABEL: Record<string, string> = {
  S: "판매중",
  C: "판매예정",
  E: "판매종료",
};

// legacy title_image_vertical_capsule_chk.php — Vertical capsule(hero) 이미지 확인 + 완료 체크.
export const GoodsTitleImageVerticalCapsuleChkScreen = (search: TitleImageVerticalChkSearch) => {
  const { data } = useTitleImageVerticalChkList(search);
  const productViewer = useProductViewer();
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
                    대표상품 이미지 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Vertical capsule 관리</li>
              </ol>
            </div>
            <h4 className="page-title">Vertical capsule 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 대표상품 검색필터 */}
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
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_domain"
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      업로드 도메인
                    </label>
                    <div className="col-sm-8 pt-1">
                      {DOMAINS.map((d, i) => (
                        <div className="form-check form-check-inline" key={d.value}>
                          <input
                            type="radio"
                            id={`search_domain_${i === 0 ? "all" : i}`}
                            name="search_domain"
                            className="form-check-input"
                            value={d.value}
                            defaultChecked={search.search_domain === d.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_domain_${i === 0 ? "all" : i}`}
                          >
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
                      게임 페이지 노출
                    </label>
                    <div className="col-sm-8 pt-1">
                      {IS_VIEWS.map((v) => (
                        <div className="form-check form-check-inline" key={v.value}>
                          <input
                            type="radio"
                            id={`search_is_view_${v.value === "all" ? "all" : v.value.toLowerCase()}`}
                            name="search_is_view"
                            className="form-check-input"
                            value={v.value}
                            defaultChecked={search.search_is_view === v.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_is_view_${v.value === "all" ? "all" : v.value.toLowerCase()}`}
                          >
                            {v.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_sales_status"
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      판매상태
                    </label>
                    <div className="col-sm-8 pt-1">
                      {SALES_STATUSES.map((s) => (
                        <div className="form-check form-check-inline" key={s.value}>
                          <input
                            type="radio"
                            id={`search_sales_status_${s.value.toLowerCase()}`}
                            name="search_sales_status"
                            className="form-check-input"
                            value={s.value}
                            defaultChecked={search.search_sales_status === s.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_sales_status_${s.value.toLowerCase()}`}
                          >
                            {s.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-lg-5">
                  <div className="row">
                    <label
                      htmlFor="search_is_hero"
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      Vertical capsule 이미지
                    </label>
                    <div className="col-sm-8 pt-1">
                      {IS_HEROES.map((h) => (
                        <div className="form-check form-check-inline" key={h.value}>
                          <input
                            type="radio"
                            id={`search_is_hero_${h.value}`}
                            name="search_is_hero"
                            className="form-check-input"
                            value={h.value}
                            defaultChecked={search.search_is_hero === h.value}
                          />
                          <label className="form-check-label" htmlFor={`search_is_hero_${h.value}`}>
                            {h.label}
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
                      대표상품 검색
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
          <div>{data.pagination.total_results.toLocaleString()} 개</div>
          <div className="table-responsive">
            <table className="table table-centered nowrap table-sm table-bordered">
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center" style={{ width: "7%" }}>
                    대표상품코드
                    <br />
                    <span className="eng">(Steam AppID)</span>
                  </th>
                  <th className="text-center" style={{ width: "20%" }}>
                    대표상품 sku
                  </th>
                  <th className="text-center">대표상품명</th>
                  <th className="text-center" style={{ width: "7%" }}>
                    대표상품 출시일
                  </th>
                  <th className="text-center" style={{ width: "10%" }}>
                    페이지 보기
                  </th>
                </tr>
              </thead>
              <tbody className="font-12">
                {data.items.map((item) => (
                  <VerticalChkRows key={item.title_id} item={item} productViewer={productViewer} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{
                search_key: search.search_key,
                search_value: search.search_value,
                search_is_view: search.search_is_view,
                search_sales_status: search.search_sales_status,
                search_domain: search.search_domain,
                search_is_hero: search.search_is_hero,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// 상품별 2행: 정보행 + hero_capsule 프리뷰행(웹서버/디스크엔 + 완료 버튼).
const VerticalChkRows = ({
  item,
  productViewer,
}: {
  item: TitleImageChkListItem;
  productViewer: boolean;
}) => {
  const heroPath = `/upload/title/${item.title_id}/hero/hero_capsule.jpg`;
  const heroCapsuleChk = useHeroCapsuleChk();

  const onHeroChk = () => {
    heroCapsuleChk.mutate(
      { steam_appid: item.steam_appid },
      { onSuccess: (res) => window.alert(res.message) },
    );
  };

  return (
    <>
      <tr>
        <td className="text-center">
          <span className="eng">{item.title_id}</span>
          <br />
          <span className="num">({item.steam_appid})</span>
          <br />
          {SALES_STATUS_LABEL[item.sales_status] ?? ""}
        </td>
        <td>{item.sku}</td>
        <td>
          {item.title_name}
          <br />
          <small className="eng">{item.title_name_en}</small>
        </td>
        <td className="text-center">
          <span className="num font-13">{item.release_date}</span>
        </td>
        <td className="text-center">
          <a
            href={`/goods/title_image_register.php?title_id=${item.title_id}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-dark shadow-none"
          >
            이미지 설정
          </a>
        </td>
      </tr>
      <tr>
        <td colSpan={5}>
          <table className="table table-sm">
            <colgroup>
              <col width="5%" />
              <col width="10%" />
              <col width="5%" />
              <col width="15%" />
              <col width="5%" />
              <col width="15%" />
              <col width="5%" />
            </colgroup>
            <tbody>
              <tr>
                <th className="text-center bg-light">도메인</th>
                <td>{item.domain}</td>
                <th className="text-center bg-light">웹서버</th>
                <td>
                  <img src={heroPath} className="w-50" alt="" />
                </td>
                <th className="text-center bg-light">디스크엔</th>
                <td>
                  <img src={`https://image.directg.net${heroPath}`} className="w-50" alt="" />
                </td>
                <td>
                  {item.hero_web_exists && !productViewer && (
                    <button
                      type="button"
                      className="btn btn-dark shadow-none btn_hero_chk"
                      data-appid={item.steam_appid}
                      onClick={onHeroChk}
                      disabled={heroCapsuleChk.isPending}
                    >
                      완료
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </>
  );
};
