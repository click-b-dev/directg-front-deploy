import { useRef, type FormEvent } from "react";
import {
  usePromotionReadyList,
  useUploadPromotionFile,
  useConfirmPromotions,
  useDeleteAllPromotions,
  useDeletePromotion,
  type PromotionReadyListSearch,
  type PromotionReadyListItem,
} from "@entities/promotion";
import { ServerPagination } from "@shared/ui";
import { env } from "@shared/config/env";

const BASE_URL = "/promotion/promotion_ready";

// legacy btn_promotion_ready_download — 동적 form POST(승인대기 xls 다운로드, 파라미터 없음).
const downloadReady = () => {
  const form = document.createElement("form");
  form.action = `${env.apiBaseUrl}/admin/promotion/promotion-ready/download`;
  form.method = "post";
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

const won = (n: number) => `${n.toLocaleString()} 원`;

// legacy promotion/promotion_ready.php — 승인대기 할인 프로모션(목록 + 업로드 + 승인/삭제 + 다운로드).
export const PromotionReadyScreen = (search: PromotionReadyListSearch) => {
  const { data } = usePromotionReadyList(search);
  const uploadMutation = useUploadPromotionFile();
  const confirmMutation = useConfirmPromotions();
  const deleteAllMutation = useDeleteAllPromotions();
  const deleteMutation = useDeletePromotion();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return; // required
    // 파일 실체 대신 name+MIME만 전송(확장자 검증·파싱은 백엔드).
    uploadMutation.mutate(
      { file_name: file.name, file_type: file.type },
      {
        onSuccess: (result) => {
          if (!result.success) {
            // legacy: 확장자 검증 실패 시 에러 문자열 출력
            window.alert(result.message ?? "");
            return;
          }
          if (fileRef.current) fileRef.current.value = "";
        },
      },
    );
  };

  // legacy: confirm → AJAX → location.relaod()(오타) → 목록 미갱신(버그 이식, invalidate 안 함).
  const handleConfirm = () => {
    if (window.confirm("승인처리 하시겠습니까?")) {
      confirmMutation.mutate();
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm("전체삭제 하시겠습니까?")) {
      deleteAllMutation.mutate();
    }
  };

  const handleDelete = (idx: number, productName: string) => {
    if (window.confirm(`${productName} 할인 프로모션 일정을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(idx);
    }
  };

  if (!data) {
    return null;
  }

  const hasRows = data.pagination.total_results > 0;

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
                <li className="breadcrumb-item active">승인대기 프로모션</li>
              </ol>
            </div>
            <h4 className="page-title">승인대기 프로모션</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 할인 프로모션 등록(엑셀 업로드) */}
      <div className="row">
        <div className="col-12">
          <form className="form-horizontal" onSubmit={handleUpload}>
            <div className="card">
              <h5 className="card-header bg-secondary text-white">할인 프로모션 등록</h5>
              <div className="card-body">
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="row mb-2">
                      <label
                        htmlFor="promotion_nm"
                        className="col-sm-3 col-form-label bg-light border"
                      >
                        할인 프로모션 파일 업로드
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="file"
                          className="form-control"
                          id="promotion_file"
                          name="promotion_file"
                          placeholder="할인 프로모션 업로드파일"
                          ref={fileRef}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <button type="submit" className="btn btn-primary shadow-none">
                      할인 프로모션 등록
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-2">
          <div className="float-start">
            총{" "}
            <strong id="total" className="text-danger">
              {data.pagination.total_results.toLocaleString()}{" "}
            </strong>{" "}
            개
          </div>
          <div className="float-end">
            {hasRows && (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-sm shadow-none"
                  id="btn_promotion_confirm"
                  onClick={handleConfirm}
                >
                  승인처리
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-danger btn-sm shadow-none"
                  id="btn_promotion_delete"
                  onClick={handleDeleteAll}
                >
                  전체삭제
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-success btn-sm shadow-none"
                  id="btn_promotion_ready_download"
                  onClick={downloadReady}
                >
                  승인대기 프로모션 다운로드
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table
              className="table table-centered dt-responsive nowrap table-sm table-bordered"
              id=""
            >
              <thead className="table-light font-13">
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
                  <th className="text-center">
                    프로모션
                    <br />
                    할인 판매가
                  </th>
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
                {hasRows ? (
                  data.items.map((item) => (
                    <PromotionReadyRow key={item.idx} item={item} onDelete={handleDelete} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center">
                      승인대기중인 할인 프로모션이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={data.pagination.current_page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const PromotionReadyRow = ({
  item,
  onDelete,
}: {
  item: PromotionReadyListItem;
  onDelete: (idx: number, productName: string) => void;
}) => (
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
    <td className="text-center">
      <button
        className="btn btn_delete"
        data-idx={item.idx}
        data-product={item.product_name}
        onClick={() => onDelete(item.idx, item.product_name)}
      >
        <i className="mdi mdi-delete font-18" />
      </button>
    </td>
  </tr>
);
