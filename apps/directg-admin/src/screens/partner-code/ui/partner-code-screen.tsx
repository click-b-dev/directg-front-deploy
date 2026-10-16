import { useEffect, useState, type FormEvent } from "react";
import {
  usePartnerList,
  usePartnerSuppliers,
  useCreatePartner,
  useConfigPartnerSystem,
  useConfigPartnerReportTerm,
  type PartnerListSearch,
  type PartnerListItem,
} from "@entities/partner";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/partner/partner_code";
// legacy 행 번호 오프셋 계수: 실제 페이지 크기는 50이나 번호 계산은 20을 사용(원문 버그 그대로 이식).
const ROW_NO_OFFSET = 20;

const nf = (n: number) => n.toLocaleString("en-US");
const termLabel = (term: string) => (term === "M" ? "월별" : "분기별");

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "modify"; publisher_code: number; publisher_name: string; report_term: string };

// legacy pc/_Admin_/partner/partner_code.php — 파트너 코드 관리(tbl_partner 목록 + 추가/수정 모달 + is_system 토글).
export const PartnerCodeScreen = (search: PartnerListSearch) => {
  const { data } = usePartnerList(search);
  const { data: suppliers } = usePartnerSuppliers();
  const createMutation = useCreatePartner();
  const reportTermMutation = useConfigPartnerReportTerm();

  const [modal, setModal] = useState<ModalState>({ type: "none" });
  // legacy Bootstrap fade: display:block 후 다음 프레임에 .show 추가 → fade-in.
  const [modalShown, setModalShown] = useState(false);
  const [addCode, setAddCode] = useState("");
  const [addTerm, setAddTerm] = useState("");
  const [modifyTerm, setModifyTerm] = useState("");

  useEffect(() => {
    document.title = "파트너 코드 관리";
  }, []);

  useEffect(() => {
    if (modal.type === "none") {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modal.type]);

  if (!data) {
    return null;
  }

  const { items, pagination } = data;

  const openAdd = () => {
    setAddCode("");
    setAddTerm("");
    setModal({ type: "add" });
  };
  const openModify = (item: PartnerListItem) => {
    setModifyTerm(item.report_term);
    setModal({
      type: "modify",
      publisher_code: item.publisher_code,
      publisher_name: item.publisher_name,
      report_term: item.report_term,
    });
  };
  const closeModal = () => {
    setModalShown(false);
    window.setTimeout(() => setModal({ type: "none" }), 200);
  };

  const handleAddSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supplier = (suppliers ?? []).find((s) => String(s.publisher_code) === addCode);
    if (!supplier) {
      return;
    }
    createMutation.mutate(
      {
        publisher_code: supplier.publisher_code,
        publisher_name: supplier.publisher_name,
        report_term: addTerm,
      },
      {
        onSuccess: (res) => {
          window.alert(res.message);
          closeModal();
        },
      },
    );
  };

  const handleModifySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (modal.type !== "modify") {
      return;
    }
    reportTermMutation.mutate(
      { publisher_code: modal.publisher_code, report_term: modifyTerm },
      {
        onSuccess: (res) => {
          window.alert(res.message);
          closeModal();
        },
      },
    );
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
                <li className="breadcrumb-item active">파트너 코드 관리</li>
              </ol>
            </div>
            <h4 className="page-title">파트너 코드 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 카드 (method=get 전체 네비게이션) */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">파트너 검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_publisher_name"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      파트너 이름
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_publisher_name"
                        name="search_publisher_name"
                        placeholder="상품명"
                        defaultValue={search.search_publisher_name}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="report_term"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      리포트 주기
                    </label>
                    <div className="col-sm-9">
                      <div className="form-check form-check-inline mt-2">
                        <input
                          type="radio"
                          id="report_term_m"
                          name="report_term"
                          className="form-check-input"
                          value="M"
                          defaultChecked={search.report_term === "M"}
                        />
                        <label className="form-check-label" htmlFor="report_term_m">
                          월별
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="report_term_t"
                          name="report_term"
                          className="form-check-input"
                          value="T"
                          defaultChecked={search.report_term === "T"}
                        />
                        <label className="form-check-label" htmlFor="report_term_t">
                          분기별
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="row">
                    <label htmlFor="is_system" className="col-sm-5 col-form-label bg-light border">
                      파트너 시스템 사용
                    </label>
                    <div className="col-sm-7">
                      <div className="form-check form-check-inline mt-2">
                        <input
                          type="radio"
                          id="is_system_y"
                          name="is_system"
                          className="form-check-input"
                          value="Y"
                          defaultChecked={search.is_system === "Y"}
                        />
                        <label className="form-check-label" htmlFor="is_system_y">
                          사용
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="is_system_n"
                          name="is_system"
                          className="form-check-input"
                          value="N"
                          defaultChecked={search.is_system === "N"}
                        />
                        <label className="form-check-label" htmlFor="is_system_n">
                          미사용
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
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

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{nf(pagination.total_results)} 개</div>
        <div className="float-end">
          <button type="button" className="btn btn-danger shadow-none" onClick={openAdd}>
            파트너 추가
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table
            className="table table-centered w-100  nowrap table-sm table-bordered border-light"
            cellPadding={0}
          >
            <thead className="table-light">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">파트너 정보</th>
                <th className="text-center">리포트 주기</th>
                <th className="text-center">파트너 시스템 사용</th>
                <th className="text-center">수정</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, num) => (
                <PartnerRow
                  key={item.publisher_code}
                  item={item}
                  num={num}
                  rowNo={
                    pagination.total_results - (num + (pagination.current_page - 1) * ROW_NO_OFFSET)
                  }
                  onModify={openModify}
                />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3 fs-5">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={BASE_URL}
              params={{
                search_publisher_name: search.search_publisher_name,
                report_term: search.report_term,
                is_system: search.is_system,
              }}
            />
          </div>
        </div>
      </div>

      {/* 파트너 추가 모달 (legacy #partner-modal → React 제어) */}
      {modal.type === "add" && (
        <>
          <div
            className={`modal fade${modalShown ? " show" : ""}`}
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header modal-colored-header bg-primary">
                  <h4 className="modal-title">파트너 등록</h4>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <form className="px-2" onSubmit={handleAddSubmit}>
                    <div className="row mb-3">
                      <label
                        htmlFor="search_publisher_code"
                        className="col-sm-3 col-form-label border bg-light"
                      >
                        파트너
                      </label>
                      <div className="col-sm-9">
                        <select
                          id="search_publisher_code"
                          name="search_publisher_code"
                          className="form-select"
                          value={addCode}
                          onChange={(e) => setAddCode(e.target.value)}
                          required
                        >
                          <option value="">:::파트너 선택:::</option>
                          {(suppliers ?? []).map((s) => (
                            <option key={s.publisher_code} value={s.publisher_code}>
                              {s.publisher_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row mb-3 ">
                      <label className="col-sm-3 col-form-label border bg-light">리포트 주기</label>
                      <div className="col-sm-9 border-bottom border-top border-end">
                        <div className="form-check form-check-inline mt-1">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="add_report_term"
                            id="add_report_term_m"
                            value="M"
                            checked={addTerm === "M"}
                            onChange={(e) => setAddTerm(e.target.value)}
                            required
                          />
                          <label className="form-check-label" htmlFor="add_report_term_m">
                            월별
                          </label>
                        </div>
                        <div className="form-check form-check-inline mt-1">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="add_report_term"
                            id="add_report_term_t"
                            value="T"
                            checked={addTerm === "T"}
                            onChange={(e) => setAddTerm(e.target.value)}
                            required
                          />
                          <label className="form-check-label" htmlFor="add_report_term_t">
                            분기별
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 text-center">
                      <button className="btn btn-primary shadow-none" type="submit">
                        파트너 등록
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

      {/* 파트너 수정 모달 (legacy #partner-modify-modal → React 제어) */}
      {modal.type === "modify" && (
        <>
          <div
            className={`modal fade${modalShown ? " show" : ""}`}
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header modal-colored-header bg-primary">
                  <h4 className="modal-title">파트너 수정</h4>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <form className="px-2" onSubmit={handleModifySubmit}>
                    <div className="row mb-3">
                      <label className="col-sm-3 col-form-label border bg-light">파트너</label>
                      <div className="col-sm-9">
                        <span className="form-control-plaintext">{modal.publisher_name}</span>
                      </div>
                    </div>
                    <div className="row mb-3 ">
                      <label className="col-sm-3 col-form-label border bg-light">리포트 주기</label>
                      <div className="col-sm-9 border-bottom border-top border-end">
                        <div className="form-check form-check-inline mt-1">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="modify_report_term"
                            id="modify_report_term_m"
                            value="M"
                            checked={modifyTerm === "M"}
                            onChange={(e) => setModifyTerm(e.target.value)}
                            required
                          />
                          <label className="form-check-label" htmlFor="modify_report_term_m">
                            월별
                          </label>
                        </div>
                        <div className="form-check form-check-inline mt-1">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="modify_report_term"
                            id="modify_report_term_t"
                            value="T"
                            checked={modifyTerm === "T"}
                            onChange={(e) => setModifyTerm(e.target.value)}
                            required
                          />
                          <label className="form-check-label" htmlFor="modify_report_term_t">
                            분기별
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 text-center">
                      <button className="btn btn-primary shadow-none" type="submit">
                        파트너 설정 저장
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

// legacy: is_system 체크박스(switch). 토글 시 partner_config 호출 후 alert.
// location.reload 주석 → 재조회 없음, 체크 상태는 로컬 유지.
const PartnerRow = ({
  item,
  num,
  rowNo,
  onModify,
}: {
  item: PartnerListItem;
  num: number;
  rowNo: number;
  onModify: (item: PartnerListItem) => void;
}) => {
  const [checked, setChecked] = useState(item.is_system === "Y");
  const config = useConfigPartnerSystem();

  const handleChange = (next: boolean) => {
    setChecked(next);
    config.mutate(
      { publisher_code: item.publisher_code, is_system: next ? "Y" : "N" },
      { onSuccess: (res) => window.alert(res.message) },
    );
  };

  const inputId = `publisher${num}`;

  return (
    <tr>
      <td className="text-center">{rowNo}</td>
      <td className="text-start">
        [{item.publisher_code}] {item.publisher_name}
      </td>
      <td className="text-center">{termLabel(item.report_term)}</td>
      <td className="text-center">
        <input
          type="checkbox"
          className="is_system"
          id={inputId}
          name="publisher"
          value={item.publisher_code}
          data-switch="primary"
          checked={checked}
          onChange={(e) => handleChange(e.target.checked)}
        />
        <label htmlFor={inputId} data-on-label="Yes" data-off-label="No" />
      </td>
      <td className="text-center">
        <button className="btn action-icon btn_modify" type="button" onClick={() => onModify(item)}>
          <i className="mdi mdi-square-edit-outline" />
        </button>
      </td>
    </tr>
  );
};
