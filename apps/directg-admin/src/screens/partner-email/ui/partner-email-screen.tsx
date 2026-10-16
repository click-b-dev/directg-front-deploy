import { useEffect, useState } from "react";
import {
  usePartnerEmailList,
  usePartnerEmailCandidates,
  type PartnerEmailSearch,
} from "@entities/partner";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/partner/partner_email";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy pc/_Admin_/partner/partner_email.php — 파트너 알림 주소록 관리.
// legacy 미완성 화면: 목록 표시만 실제 동작, 등록/수정/삭제 UI는 핸들러 없이 죽어있음(그대로 이식).
export const PartnerEmailScreen = (search: PartnerEmailSearch) => {
  const { data } = usePartnerEmailList(search);
  const { data: candidates } = usePartnerEmailCandidates();

  const [modalOpen, setModalOpen] = useState(false);
  // legacy Bootstrap fade: display:block 후 다음 프레임에 .show 추가 → fade-in.
  const [modalShown, setModalShown] = useState(false);

  useEffect(() => {
    document.title = "파트너 알림 주소록 관리";
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modalOpen]);

  if (!data) {
    return null;
  }

  const { items, pagination } = data;

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalShown(false);
    window.setTimeout(() => setModalOpen(false), 200);
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
                    파트너
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    파트너 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">파트너 알림 주소록 관리</li>
              </ol>
            </div>
            <h4 className="page-title">파트너 알림 주소록 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{nf(pagination.total_results)} 개</div>
        <div className="float-end">
          {/* legacy 오타 "일림" 그대로 이식 */}
          <button type="button" className="btn btn-danger shadow-none" onClick={openModal}>
            파트너 일림 주소록 등록
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <form className="align-items-center">
            <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
              <colgroup>
                <col width="10%" />
                <col width="30%" />
                <col width="*" />
                <col width="10%" />
                <col width="10%" />
              </colgroup>
              <thead className="table-light">
                <tr>
                  <th className="text-center">번호</th>
                  <th className="text-center">파트너정보</th>
                  <th className="text-center">알림이메일 주소</th>
                  <th className="text-center">수정</th>
                  <th className="text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="bg-white font-12">
                {items.map((item, num) => (
                  <tr key={item.publisher_code}>
                    <td className="text-center">
                      {pagination.total_results - (num + (pagination.current_page - 1) * PER_PAGE)}
                    </td>
                    <td className="text-start">{item.publisher_name}</td>
                    <td className="text-center">
                      {/* legacy: json_decode(email) 요소를 줄바꿈으로. 편집 가능하나 저장 수단 없음(수정 버튼 죽음). */}
                      <textarea
                        name="email[]"
                        className="form-control font-12"
                        rows={4}
                        defaultValue={item.email.join("\n")}
                      />
                    </td>
                    {/* legacy: btn action-icon만, 핸들러 없음 → 클릭 무동작(죽은 UI) */}
                    <td className="text-center">
                      <button type="button" className="btn action-icon">
                        <i className="mdi mdi-square-edit-outline" />
                      </button>
                    </td>
                    <td className="text-center">
                      <button type="button" className="btn action-icon">
                        <i className="mdi mdi-delete" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
          <div className="text-center mt-3 fs-5">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={BASE_URL}
              params={{}}
            />
          </div>
        </div>
      </div>

      {/* 파트너 알림 주소록 등록 모달 (legacy #partner-email-modal → React 제어).
          legacy: 등록 버튼(id btn_pg_fee_add) 핸들러 없음 → 등록 동작 없음(죽은 UI). */}
      {modalOpen && (
        <>
          <div
            className={`modal fade${modalShown ? " show" : ""}`}
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header modal-colored-header bg-primary">
                  <h4 className="modal-title">파트너 알림 주소록 등록</h4>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  {/* legacy form action=partner_pg_fee_ps.php(복붙 잔재). 등록 버튼 무동작이라 submit 없음. */}
                  <form className="px-3" onSubmit={(e) => e.preventDefault()}>
                    <div className="row mb-2">
                      <label
                        htmlFor="publisher_code"
                        className="col-sm-4 col-form-label border bg-light"
                      >
                        파트너
                      </label>
                      <div className="col-sm-8">
                        <select
                          id="publisher_code"
                          name="publisher_code"
                          className="form-select"
                          defaultValue=""
                          required
                        >
                          <option value="">:::파트너 선택:::</option>
                          {(candidates ?? []).map((c) => (
                            <option key={c.publisher_code} value={c.publisher_code}>
                              {c.publisher_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row mb-2">
                      <label
                        htmlFor="partner_email"
                        className="col-sm-4 col-form-label border bg-light"
                      >
                        알림이메일 주소
                      </label>
                      <div className="col-sm-8">
                        <textarea
                          id="partner_email"
                          name="partner_email"
                          className="form-control"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      {/* legacy 버튼 텍스트 "파트너 PG 수수료 등록"(복붙), 핸들러 없음 → 무동작 */}
                      <button className="btn btn-primary shadow-none" type="button">
                        파트너 PG 수수료 등록
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className={`modal-backdrop fade${modalShown ? " show" : ""}`} onClick={closeModal} />
        </>
      )}
    </>
  );
};
