import { useEffect, useState, type FormEvent } from "react";
import {
  usePartnerPgFeeList,
  usePartnerPgFeeCandidates,
  useRegisterPartnerPgFee,
  useModifyPartnerPgFee,
  useDeletePartnerPgFee,
  type PartnerPgFeeSearch,
  type PartnerPgFeeItem,
} from "@entities/partner";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/partner/partner_pg_fee";
const PER_PAGE = 30;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy pc/_Admin_/partner/partner_pg_fee.php — 파트너 PG수수료 관리(인라인 편집 + 등록 모달).
export const PartnerPgFeeScreen = (search: PartnerPgFeeSearch) => {
  const { data } = usePartnerPgFeeList(search);
  const { data: candidates } = usePartnerPgFeeCandidates();
  const registerMutation = useRegisterPartnerPgFee();

  const [modalOpen, setModalOpen] = useState(false);
  // legacy Bootstrap fade: display:block 후 다음 프레임에 .show 추가 → fade-in.
  const [modalShown, setModalShown] = useState(false);
  const [addCode, setAddCode] = useState("");
  const [addAccount, setAddAccount] = useState("");
  const [addCredit, setAddCredit] = useState("");
  const [addMobile, setAddMobile] = useState("");

  useEffect(() => {
    document.title = "파트너 PG수수료 관리";
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

  const openModal = () => {
    setAddCode("");
    setAddAccount("");
    setAddCredit("");
    setAddMobile("");
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalShown(false);
    window.setTimeout(() => setModalOpen(false), 200);
  };

  const handleRegisterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    registerMutation.mutate(
      {
        publisher_code: Number(addCode),
        account: addAccount,
        credit_card: addCredit,
        mobile_payment: addMobile,
      },
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
                <li className="breadcrumb-item active">파트너 PG수수료 관리</li>
              </ol>
            </div>
            <h4 className="page-title">파트너 PG수수료 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 카드 */}
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
                        placeholder="파트너 이름"
                        defaultValue={search.search_publisher_name}
                      />
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
          <button type="button" className="btn btn-danger shadow-none" onClick={openModal}>
            파트너 PG 수수료 등록
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <form className="align-items-center">
            <table className="table table-centered  nowrap table-sm table-bordered border-light">
              <colgroup>
                <col width="5%" />
                <col width="*" />
                <col width="10%" />
                <col width="10%" />
                <col width="10%" />
                <col width="5%" />
                <col width="5%" />
              </colgroup>
              <thead className="table-light">
                <tr>
                  <th className="text-center">번호</th>
                  <th className="text-center">파트너정보</th>
                  <th className="text-center">Account</th>
                  <th className="text-center">Credit Card</th>
                  <th className="text-center">Mobile Payment</th>
                  <th className="text-center">수정</th>
                  <th className="text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="bg-white font-12">
                {items.map((item, num) => (
                  <PgFeeRow
                    key={item.publisher_code}
                    item={item}
                    rowNo={
                      pagination.total_results - (num + (pagination.current_page - 1) * PER_PAGE)
                    }
                  />
                ))}
              </tbody>
            </table>
          </form>
          <div className="text-center mt-3 fs-5">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={BASE_URL}
              params={{ search_publisher_name: search.search_publisher_name }}
            />
          </div>
        </div>
      </div>

      {/* 파트너 PG 수수료 등록 모달 (legacy #partner-pg-modal → React 제어) */}
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
                  <h4 className="modal-title">파트너 PG 수수료 등록</h4>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <form className="px-3" onSubmit={handleRegisterSubmit}>
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
                          value={addCode}
                          onChange={(e) => setAddCode(e.target.value)}
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
                      <label htmlFor="account" className="col-sm-4 col-form-label border bg-light">
                        Account
                      </label>
                      <div className="col-sm-4">
                        <div className="input-group">
                          <input
                            type="text"
                            name="account"
                            value={addAccount}
                            onChange={(e) => setAddAccount(e.target.value)}
                            className="form-control font-12 text-end"
                          />
                          <div className="input-group-text font-12">%</div>
                        </div>
                      </div>
                    </div>
                    <div className="row mb-2 ">
                      <label
                        htmlFor="credit_card"
                        className="col-sm-4 col-form-label border bg-light"
                      >
                        Credit Card
                      </label>
                      <div className="col-sm-4">
                        <div className="input-group">
                          <input
                            type="text"
                            name="credit_card"
                            value={addCredit}
                            onChange={(e) => setAddCredit(e.target.value)}
                            className="form-control font-12 text-end"
                          />
                          <div className="input-group-text font-12">%</div>
                        </div>
                      </div>
                    </div>
                    <div className="row mb-2">
                      <label
                        htmlFor="mobile_payment"
                        className="col-sm-4 col-form-label border bg-light"
                      >
                        Mobile Payment
                      </label>
                      <div className="col-sm-4">
                        <div className="input-group">
                          <input
                            type="text"
                            name="mobile_payment"
                            value={addMobile}
                            onChange={(e) => setAddMobile(e.target.value)}
                            className="form-control font-12 text-end"
                          />
                          <div className="input-group-text font-12">%</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <button className="btn btn-primary shadow-none" type="submit">
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

// legacy: 각 행의 수수료 3종은 인라인 편집 인풋(초기값=DB). 수정 시 현재 인풋값으로 update,
// reload 없음(주석) → 인풋 값 유지. 삭제는 reload(invalidate).
const PgFeeRow = ({ item, rowNo }: { item: PartnerPgFeeItem; rowNo: number }) => {
  const [account, setAccount] = useState(item.account);
  const [creditCard, setCreditCard] = useState(item.credit_card);
  const [mobilePayment, setMobilePayment] = useState(item.mobile_payment);
  const modifyMutation = useModifyPartnerPgFee();
  const deleteMutation = useDeletePartnerPgFee();

  const handleModify = () => {
    modifyMutation.mutate(
      {
        publisher_code: item.publisher_code,
        account,
        credit_card: creditCard,
        mobile_payment: mobilePayment,
      },
      { onSuccess: (res) => window.alert(res.message) },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { publisher_code: item.publisher_code },
      { onSuccess: (res) => window.alert(res.message) },
    );
  };

  return (
    <tr>
      <td className="text-center">{rowNo}</td>
      <td className="text-start">{item.publisher_name}</td>
      <td className="text-center">
        <div className="input-group">
          <input
            type="text"
            name="account[]"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="form-control form-control-sm font-12 text-end"
          />
          <div className="input-group-text font-12">%</div>
        </div>
      </td>
      <td className="text-center px-1">
        <div className="input-group">
          <input
            type="text"
            name="credit_card[]"
            value={creditCard}
            onChange={(e) => setCreditCard(e.target.value)}
            className="form-control form-control-sm font-12 text-end"
          />
          <div className="input-group-text font-12">%</div>
        </div>
      </td>
      <td className="text-center">
        <div className="input-group">
          <input
            type="text"
            name="mobile_payment[]"
            value={mobilePayment}
            onChange={(e) => setMobilePayment(e.target.value)}
            className="form-control form-control-sm font-12 text-end"
          />
          <div className="input-group-text font-12">%</div>
        </div>
      </td>
      <td className="text-center">
        <button type="button" className="btn action-icon btn_modify" onClick={handleModify}>
          <i className="mdi mdi-square-edit-outline" />
        </button>
      </td>
      <td className="text-center">
        <button type="button" className="btn action-icon btn_delete" onClick={handleDelete}>
          <i className="mdi mdi-delete" />
        </button>
      </td>
    </tr>
  );
};
