import { useEffect } from "react";
import { useAssetReserveList, type AssetReserveItem } from "@entities/asset";
import { Pagination } from "@shared/ui";

export type AssetReserveSearchProps = {
  page: number;
  ordno: string;
  owner: string;
  cancelled: string;
};

const BASE_URL = "/goods/asset/asset_reserve_list";

// 미이관 링크(settle_no/m_no 있을 때만).
const orderViewLink = (settleNo: string) =>
  `/order/order_view?settle_no=${encodeURIComponent(settleNo)}`;
const memberViewLink = (mNo: string) => `/member/member_view?m_no=${encodeURIComponent(mNo)}`;

const CANCEL_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "0", label: "취소건 제외" },
  { value: "1", label: "취소건만" },
] as const;

export const AssetReserveListScreen = (search: AssetReserveSearchProps) => {
  useEffect(() => {
    document.title = "Asset 예약현황";
  }, []);

  const cancelled = search.cancelled || "all";
  const { data } = useAssetReserveList({ ...search, cancelled });

  const content = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

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
                    재고
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Asset 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Asset 예약현황</li>
              </ol>
            </div>
            <h4 className="page-title">Asset 예약현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">예약(Reserve) 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              {/* 검색 제출 시 항상 1페이지부터 */}
              <input type="hidden" id="page" name="page" value="1" readOnly />
              <div className="row mb-2">
                <div className="col-lg-4">
                  <div className="row">
                    <label htmlFor="owner" className="col-sm-4 col-form-label bg-light border">
                      회원아이디
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="owner"
                        name="owner"
                        placeholder="회원아이디 (M/ 자동보정)"
                        defaultValue={search.owner}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label htmlFor="ordno" className="col-sm-4 col-form-label bg-light border">
                      주문번호
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="ordno"
                        name="ordno"
                        placeholder="주문번호(po)"
                        defaultValue={search.ordno}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label className="col-sm-4 col-form-label bg-light border">취소여부</label>
                    <div className="col-sm-8 pt-1">
                      {CANCEL_OPTIONS.map((opt) => (
                        <div key={opt.value} className="form-check form-check-inline">
                          <input
                            type="radio"
                            className="form-check-input"
                            id={`cancelled_${opt.value}`}
                            name="cancelled"
                            value={opt.value}
                            defaultChecked={cancelled === opt.value}
                          />
                          <label className="form-check-label" htmlFor={`cancelled_${opt.value}`}>
                            {opt.label}
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
                      예약 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-2">
          총{" "}
          <strong id="total" className="text-danger">
            {totalElements.toLocaleString()}
          </strong>{" "}
          개
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <table
                className="table table-centered nowrap table-sm table-bordered"
                id="reserve_list"
              >
                <thead className="table-dark font-13">
                  <tr>
                    <th className="text-center">Reserve ID</th>
                    <th className="text-center">Asset ID</th>
                    <th className="text-center">Asset 이름</th>
                    <th className="text-center">주문번호(po)</th>
                    <th className="text-center">소유자</th>
                    <th className="text-center">예약일시</th>
                    <th className="text-center">상태</th>
                    <th className="text-center">취소정보</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {content.length > 0 ? (
                    content.map((item: AssetReserveItem) => (
                      <tr key={item.id}>
                        <td className="text-center">{item.id}</td>
                        <td className="text-center">{item.assetId}</td>
                        <td className="text-start">
                          <span className="eng font-12">{item.title}</span>
                        </td>
                        <td className="text-center">
                          {item.settle_no ? (
                            <a
                              href={orderViewLink(item.settle_no)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {item.po}
                            </a>
                          ) : (
                            item.po
                          )}
                        </td>
                        <td>
                          {item.m_no ? (
                            <a
                              href={memberViewLink(item.m_no)}
                              target="_blank"
                              rel="noreferrer"
                              className="eng font-12"
                            >
                              {item.owner}
                            </a>
                          ) : (
                            <span className="eng font-12">{item.owner}</span>
                          )}
                        </td>
                        <td className="text-center">{item.reserveDt}</td>
                        <td className="text-center">{item.cancelled ? "취소" : "정상"}</td>
                        <td className="text-center">
                          {item.cancelled && (
                            <>
                              {item.cancelDt}
                              {item.canceller && (
                                <>
                                  <br />
                                  {item.canceller}
                                </>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-3">
                        조회된 예약이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div id="paging" className="text-center mt-3">
                <Pagination
                  page={search.page}
                  totalPages={totalPages}
                  baseUrl={BASE_URL}
                  params={{
                    ordno: search.ordno,
                    owner: search.owner,
                    cancelled,
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
