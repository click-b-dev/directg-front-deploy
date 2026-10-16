import { useRef } from "react";
import {
  useGenbaPromotionSchedule,
  useSyncGenbaPromotion,
  type GenbaPromotionSearch,
} from "@entities/genba";
import { ServerPagination } from "@shared/ui";
import { env } from "@shared/config/env";

const BASE_URL = "/goods/genba/genba_promotion_sync";
const DOWNLOAD_URL = `${env.apiBaseUrl.replace(/\/$/, "")}/admin/genba/promotion-download`;

const PROMOTION_STATUS: { value: string; label: string }[] = [
  { value: "Scheduled", label: "진행예정" },
  { value: "Live", label: "진행중" },
  { value: "Completed", label: "종료" },
];

// legacy genba_promotion_sync.php — Genba 프로모션 조회.
export const GenbaPromotionSyncScreen = (search: GenbaPromotionSearch) => {
  const { data } = useGenbaPromotionSchedule(search);
  const syncPromotion = useSyncGenbaPromotion();
  const downloadFormRef = useRef<HTMLFormElement>(null);

  if (!data) {
    return null;
  }

  const { total_results, current_page, total_pages, results_per_page } = data.pagination;

  const onPromotionSync = () => {
    syncPromotion.mutate(undefined, { onSuccess: (res) => window.alert(res.message) });
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
                    Genba 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Genba 프로모션 조회</li>
              </ol>
            </div>
            <h4 className="page-title">Genba 프로모션 조회</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-0">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row g-2">
                <div className="col-8">
                  <div className="row">
                    <label
                      htmlFor="promotion_status"
                      className="col-3 col-form-label bg-light border"
                    >
                      프로모션 상태
                    </label>
                    <div className="col-9">
                      {PROMOTION_STATUS.map((s, i) => (
                        <div className="form-check form-check-inline mt-1" key={s.value}>
                          <input
                            type="radio"
                            id={`promotion_status_${i + 1}`}
                            name="promotion_status"
                            className="form-check-input"
                            value={s.value}
                            defaultChecked={search.promotion_status === s.value}
                          />
                          <label className="form-check-label" htmlFor={`promotion_status_${i + 1}`}>
                            {s.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      Genba 프로모션 검색
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
          <div className="float-start">{total_results.toLocaleString()} 개</div>
          <div className="float-end">
            <button
              type="button"
              className="btn btn-info btn-sm shadow-none"
              onClick={onPromotionSync}
            >
              Genba 프로모션 동기화
            </button>{" "}
            <button
              type="button"
              className="btn btn-success btn-sm shadow-none"
              onClick={() => downloadFormRef.current?.submit()}
            >
              Genba 프로모션 다운로드
            </button>
          </div>
        </div>
      </div>

      <form
        id="downloadFrm"
        name="downloadFrm"
        method="post"
        action={DOWNLOAD_URL}
        target="_blank"
        ref={downloadFormRef}
      >
        <input type="hidden" name="mode" value="download" />
      </form>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">Genba 프로모션 일정</h5>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered w-100 nowrap table-sm table-bordered">
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">Promotion ID</th>
                      <th className="text-center">Promotion Name</th>
                      <th className="text-center">From</th>
                      <th className="text-center">To</th>
                      <th className="text-center">Products</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {data.items.map((item, index) => (
                      <tr key={`${item.PromotionId}-${index}`}>
                        <td className="text-center">
                          {index + 1 + (current_page - 1) * results_per_page}
                        </td>
                        <td className="text-center">{item.PromotionId}</td>
                        <td className="text-start">{item.Name}</td>
                        <td className="text-center">{item.fromDate}</td>
                        <td className="text-center">{item.toDate}</td>
                        <td className="text-center">{item.cc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-center mt-3">
                <ServerPagination
                  page={current_page}
                  totalPages={total_pages}
                  baseUrl={BASE_URL}
                  params={{ promotion_status: search.promotion_status }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
