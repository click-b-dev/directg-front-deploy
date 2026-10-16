import {
  useSupplyContentList,
  type SupplyContentSearch,
  type SupplyContentItem,
} from "@entities/supply-content";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/goods/supply_content";
const PER_PAGE = 30;

const TYPES: { value: string; label: string }[] = [
  { value: "P", label: "한글패치" },
  { value: "C", label: "컨텐츠" },
];

const ENCODES: { value: string; label: string }[] = [
  { value: "Y", label: "암호화 있음" },
  { value: "N", label: "암호화 없음" },
];

// legacy supply_content.php — 제공컨텐츠 현황.
export const GoodsSupplyContentScreen = (search: SupplyContentSearch) => {
  const { data } = useSupplyContentList(search);
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
                    제공컨텐츠 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">제공컨텐츠 현황</li>
              </ol>
            </div>
            <h4 className="page-title">제공컨텐츠 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 제공컨텐츠 조회 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">제공컨텐츠 조회</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-5">
                  <div className="row">
                    <label
                      htmlFor="search_value"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      제공 컨텐츠명
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_value"
                        name="search_value"
                        placeholder="제공 컨텐츠명"
                        defaultValue={search.search_value}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_supply_content_type"
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      제공 컨텐츠 유형
                    </label>
                    <div className="col-sm-8 pt-1">
                      {TYPES.map((t) => (
                        <div className="form-check form-check-inline" key={t.value}>
                          <input
                            type="radio"
                            id={`search_supply_content_type_${t.value.toLowerCase()}`}
                            name="search_supply_content_type"
                            className="form-check-input"
                            value={t.value}
                            defaultChecked={search.search_supply_content_type === t.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_supply_content_type_${t.value.toLowerCase()}`}
                          >
                            {t.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_is_encode"
                      className="col-sm-4 col-form-label col-form-label-sm bg-light border"
                    >
                      암호화 여부
                    </label>
                    <div className="col-sm-8 pt-1">
                      {ENCODES.map((e) => (
                        <div className="form-check form-check-inline" key={e.value}>
                          <input
                            type="radio"
                            id={`search_is_encode_${e.value.toLowerCase()}`}
                            name="search_is_encode"
                            className="form-check-input"
                            value={e.value}
                            defaultChecked={search.search_is_encode === e.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_is_encode_${e.value.toLowerCase()}`}
                          >
                            {e.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      제공컨텐츠 조회
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
          <div className="float-start">{data.pagination.total_results.toLocaleString()} 개</div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">제공 컨텐츠 현황</h5>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered w-100 nowrap table-sm table-bordered">
                  <colgroup>
                    <col width="3%" />
                    <col width="5%" />
                    <col width="18%" />
                    <col width="*" />
                    <col width="6%" />
                    <col width="34%" />
                  </colgroup>
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">유형</th>
                      <th className="text-center">제공 컨텐츠명</th>
                      <th className="text-center">제공 컨텐츠 URL</th>
                      <th className="text-center">암호화 정보</th>
                      <th className="text-center">제공 상품정보</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {data.items.map((item, i) => (
                      <SupplyContentRow
                        key={item.idx}
                        item={item}
                        rowNo={i + 1 + (page - 1) * PER_PAGE}
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
                    search_value: search.search_value,
                    search_supply_content_type: search.search_supply_content_type,
                    search_is_encode: search.search_is_encode,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const SupplyContentRow = ({ item, rowNo }: { item: SupplyContentItem; rowNo: number }) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">{item.supply_content_type === "P" ? "한글패치" : "컨텐츠"}</td>
    <td className="text-start">{item.supply_content}</td>
    <td className="text-start px-1">{item.supply_content_url}</td>
    <td className="text-center">
      {item.is_encode === "Y" ? "암호화 있음" : "암호화 없음"}
      {item.is_encode === "Y" && (
        <>
          <br />({item.encode_type})
        </>
      )}
    </td>
    <td className="px-1">
      {item.goods.map((g, gi) => (
        <span key={gi}>
          {g.goods_code} / {g.goods_nm} / {g.asset_id}
          {g.is_free === "Y" && (
            <>
              {" "}
              / <span className="label label-info">무료제공</span>
            </>
          )}
          <br />
        </span>
      ))}
    </td>
  </tr>
);
