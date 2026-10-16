import {
  useChinaRequestList,
  useDeleteChinaOrder,
  type ChinaInvoiceListSearch,
  type ChinaInvoiceItem,
} from "@entities/china";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/china/invoice_request";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy china/invoice_request.php — 중국 결제요청 리스트(step='1' 결제대기, 20/page).
export const ChinaInvoiceRequestScreen = (search: ChinaInvoiceListSearch) => {
  // legacy 33~35: search_year 미지정 시 date('Y') 기본.
  const currentYear = new Date().getFullYear();
  const year = search.search_year || String(currentYear);
  const resolved: ChinaInvoiceListSearch = { ...search, search_year: year };
  const { data } = useChinaRequestList(resolved);
  const remove = useDeleteChinaOrder();

  // 페이지네이션은 raw 검색값(page 제외) 유지 = legacy $param.
  const paginationParams: Record<string, string> = {};
  const addP = (key: string, value: string) => {
    if (value !== "") paginationParams[key] = value;
  };
  addP("search_settle_no", search.search_settle_no);
  addP("search_name", search.search_name);
  addP("search_email", search.search_email);
  addP("search_year", search.search_year);

  if (!data) {
    return null;
  }

  const { items, pagination } = data;
  const years: number[] = [];
  for (let y = 2016; y <= currentYear; y++) years.push(y);

  // legacy btn_delete: confirm → invoice_delete → reload(=invalidate)·alert 없음(주석).
  const onDelete = (settleNo: string) => {
    if (!window.confirm(`[${settleNo}] 을(를) 삭제하시겠습니까?`)) {
      return;
    }
    remove.mutate({ settle_no: settleNo });
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
                    중국결제
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    중국 결제 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">중국 결제요청 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">중국 결제요청 리스트</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_settle_no"
                      className="col-sm-4 col-form-label bg-light border"
                    >
                      결제번호
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="search_settle_no"
                        name="search_settle_no"
                        placeholder="결제번호"
                        defaultValue={search.search_settle_no}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_name"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      주문자명
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_name"
                        name="search_name"
                        placeholder="주문자명"
                        defaultValue={search.search_name}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_email"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      주문자이메일
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_email"
                        name="search_email"
                        placeholder="주문자이메일"
                        defaultValue={search.search_email}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-lg-12">
                  <div className="row">
                    <label
                      htmlFor="search_year"
                      className="col-sm-1 col-form-label bg-light border"
                    >
                      연도
                    </label>
                    <div className="col-sm-3">
                      <div className="input-group">
                        <select
                          className="form-select me-2"
                          id="search_year"
                          name="search_year"
                          defaultValue={year}
                        >
                          <option value="">:::년도:::</option>
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}년
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      결제내역 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{nf(pagination.total_results)} 개</div>
        <div className="float-end"></div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <thead className="table-light">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">주문일자</th>
                <th className="text-center">결제번호</th>
                <th className="text-center">주문자명</th>
                <th className="text-center">주문자이메일</th>
                <th className="text-center">결제금액</th>
                <th className="text-center">결제일자</th>
                <th className="text-center">결제상태</th>
                <th className="text-center">수정</th>
                <th className="text-center">삭제</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, index) => (
                <ChinaRequestRow
                  key={item.settle_no}
                  item={item}
                  no={pagination.total_results - (index + (pagination.current_page - 1) * PER_PAGE)}
                  onDelete={onDelete}
                  deleteDisabled={remove.isPending}
                />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={BASE_URL}
              params={paginationParams}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const ChinaRequestRow = ({
  item,
  no,
  onDelete,
  deleteDisabled,
}: {
  item: ChinaInvoiceItem;
  no: number;
  onDelete: (settleNo: string) => void;
  deleteDisabled: boolean;
}) => (
  <tr>
    <td className="text-center">{no}</td>
    <td className="text-center">{item.ord_ymd}</td>
    <td className="text-center">
      {/* legacy invoice_view.php?settle_no= → SPA 라우트(#226 활성화) */}
      <a href={`/china/invoice_view?settle_no=${item.settle_no}`}>{item.settle_no}</a>
    </td>
    <td className="text-center">{item.name}</td>
    <td className="text-center">{item.email}</td>
    <td className="text-end">{nf(item.settle_price)}</td>
    <td className="text-center">{item.cdt}</td>
    <td className="text-center">결제대기</td>
    <td className="text-center">
      {/* legacy invoice_modify.php?settle_no= → SPA 라우트(#227 활성화) */}
      <a
        href={`/china/invoice_modify?settle_no=${item.settle_no}`}
        className="btn btn-outline-secondary btn-sm"
      >
        수정
      </a>
    </td>
    <td className="text-center">
      <button
        type="button"
        className="btn btn-danger btn-sm shadow-none"
        disabled={deleteDisabled}
        onClick={() => onDelete(item.settle_no)}
      >
        삭제
      </button>
    </td>
  </tr>
);
