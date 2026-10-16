import {
  usePromotionEndList,
  type PromotionEndListSearch,
  type PromotionReadyListItem,
} from "@entities/promotion";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/promotion/promotion_end";

const won = (n: number) => `${n.toLocaleString()} 원`;

// legacy promotion/promotion_end.php — 종료된 할인 프로모션(읽기전용 목록 + 검색필터).
export const PromotionEndScreen = (search: PromotionEndListSearch) => {
  const { data } = usePromotionEndList(search);

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
                    프로모션
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    할인 프로모션 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">종료된 할인 프로모션</li>
              </ol>
            </div>
            <h4 className="page-title">종료된 할인 프로모션</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 프로모션 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">프로모션 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row">
                <div className="col-lg-6 mb-2">
                  <div className="input-group row">
                    <select
                      className="form-select col-sm-3"
                      name="search_key"
                      id="search_key"
                      defaultValue={search.search_key}
                    >
                      <option value="search_name">옵션상품명</option>
                      <option value="search_product_code">옵션상품명코드</option>
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
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_confirm"
                      className="col-sm-4 col-form-label-sm bg-light border font-14 px-1"
                    >
                      승인여부
                    </label>
                    <div className="col-sm-8">
                      <div className="form-check form-check-inline mt-1">
                        <input
                          type="radio"
                          id="search_confirm_y"
                          name="search_confirm"
                          className="form-check-input"
                          value="Y"
                          defaultChecked={search.search_confirm === "Y"}
                        />
                        <label className="form-check-label font-14" htmlFor="search_confirm_y">
                          예
                        </label>
                      </div>
                      <div className="form-check form-check-inline mt-1">
                        <input
                          type="radio"
                          id="search_confirm_n"
                          name="search_confirm"
                          className="form-check-input"
                          value="N"
                          defaultChecked={search.search_confirm === "N"}
                        />
                        <label className="form-check-label font-14" htmlFor="search_confirm_n">
                          아니오
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
                      검색
                    </button>
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
            <table
              className="table table-centered dt-responsive nowrap table-sm table-bordered"
              id=""
            >
              {/* legacy quirk: 종료 화면 thead는 table-light만(다른 목록의 font-13 없음) */}
              <thead className="table-light">
                <tr>
                  <th className="text-center">공급처</th>
                  <th className="text-center">옵션상품코드</th>
                  <th className="text-center">옵션상품명</th>
                  <th className="text-center">
                    할인률
                    <br />
                    (승인할인률)
                  </th>
                  <th className="text-center">
                    SRP
                    <br />
                    (승인SRP)
                  </th>
                  <th className="text-center">프로모션 할인 판매가</th>
                  <th className="text-center" style={{ width: "150px" }}>
                    시작일자
                  </th>
                  <th className="text-center" style={{ width: "150px" }}>
                    종료일자
                  </th>
                  <th className="text-center" style={{ width: "80px" }}>
                    승인상태
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    비고
                  </th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {data.items.map((item) => (
                  <PromotionEndRow key={item.idx} item={item} />
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
                search_confirm: search.search_confirm,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const PromotionEndRow = ({ item }: { item: PromotionReadyListItem }) => (
  <tr>
    <td className="text-center">{item.publisher_name}</td>
    <td className="text-center">{item.product_code}</td>
    <td>
      {item.product_name}
      <br />({item.product_name_en})
    </td>
    <td className="text-end">
      {item.discount_rate}%<br />({item.p_discount_rate}%)
    </td>
    <td className="text-end">
      {won(item.consumer_price)}
      <br />({won(item.promotion_srp)})
    </td>
    <td className="text-end">{won(item.sale_price)}</td>
    <td className="text-center p-0">
      <span className="num">{item.promotion_start}</span>
    </td>
    <td className="text-center p-0">
      <span className="num">{item.promotion_end}</span>
    </td>
    <td className="text-center">{item.confirm}</td>
    {/* legacy: 비고 셀 빈칸(읽기전용, 삭제 버튼 없음) */}
    <td className="text-center" />
  </tr>
);
