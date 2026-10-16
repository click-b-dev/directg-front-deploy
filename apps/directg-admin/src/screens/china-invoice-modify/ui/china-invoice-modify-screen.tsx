import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useChinaOrderDetail,
  useChinaMemberAll,
  useModifyChinaOrder,
  type ChinaOrderModifySearch,
} from "@entities/china";

const nf = (n: number) => n.toLocaleString("en-US");

// legacy china/invoice_modify.php — 중국 결제 주문서 수정(헤더 편집 중심, 개발자 승인 스코프).
export const ChinaInvoiceModifyScreen = (search: ChinaOrderModifySearch) => {
  const settleNo = search.settle_no;
  const { data } = useChinaOrderDetail(settleNo);
  const memberAll = useChinaMemberAll();
  const modify = useModifyChinaOrder();

  const [orderName, setOrderName] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [settleCount, setSettleCount] = useState("");
  const [ordYmd, setOrdYmd] = useState("");
  const [settlePrice, setSettlePrice] = useState("");
  const [initialized, setInitialized] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  // 프리필: order detail 로드 시 1회. name/email은 legacy 버그 수정(실 컬럼) 반영.
  useEffect(() => {
    if (data?.order && !initialized) {
      setOrderName(data.order.name);
      setOrderEmail(data.order.email);
      setSettleCount(data.order.settle_count);
      setOrdYmd(data.order.ord_ymd);
      setSettlePrice(String(data.order.settle_price));
      setInitialized(true);
    }
  }, [data, initialized]);

  // legacy Bootstrap fade.
  useEffect(() => {
    if (!modalOpen) return;
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modalOpen]);

  const items = data?.items ?? [];

  const closeModal = () => {
    setModalShown(false);
    setModalOpen(false);
  };

  const onMemberChoice = () => {
    if (selectedMember === null) {
      window.alert("중국 결제자를 선택해 주세요.");
      return;
    }
    const m = (memberAll.data?.items ?? []).find((x) => x.idx === selectedMember);
    if (m) {
      setOrderName(m.name);
      setOrderEmail(m.email);
    }
    closeModal();
  };

  // legacy btn_invoice_save: 검증 후 modify → invoice_request 이동(개발자 승인, =버그 이탈).
  const onSave = () => {
    if (orderName === "") {
      window.alert("주문자명을 입력해 주세요.");
      return;
    }
    if (orderEmail === "") {
      window.alert("주문자이메일을 입력해 주세요.");
      return;
    }
    if (settlePrice === "0" || settlePrice === "") {
      window.alert("주문상품을 설정해 주세요.");
      return;
    }
    modify.mutate(
      {
        settle_no: settleNo,
        settle_price: Number(settlePrice) || 0,
        orderName,
        orderEmail,
        ord_ymd: ordYmd,
        settle_count: settleCount,
      },
      { onSuccess: () => (window.location.href = "/china/invoice_request") },
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
                    중국결제
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    중국 결제 관리
                  </a>
                </li>
                {/* legacy page_title은 "중국 결제 주문서 작성"(수정 화면이나 원문 유지) */}
                <li className="breadcrumb-item active">중국 결제 주문서 작성</li>
              </ol>
            </div>
            <h4 className="page-title">중국 결제 주문서 작성</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="d-flex flex-row justify-content-end mb-2">
        <button
          type="button"
          className="btn btn-danger shadow-none"
          disabled={modify.isPending}
          onClick={onSave}
        >
          주문서 저장
        </button>
      </div>

      <div className="row">
        {/* 좌 col-6 */}
        <div className="col-6">
          <div className="card border mb-3">
            <h5 className="card-header bg-light">주문자 정보</h5>
            <div className="card-body p-2">
              <div className="mb-2 row">
                <label className="col-sm-2 col-form-label">중국 결제자 조회</label>
                <div className="col-sm-10">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm shadow-none"
                    onClick={() => {
                      setSelectedMember(null);
                      setModalOpen(true);
                    }}
                  >
                    결제자 조회
                  </button>
                </div>
              </div>
              <div className="mb-2 row">
                <label htmlFor="orderName" className="col-sm-2 col-form-label">
                  주문자명
                </label>
                <div className="col-sm-4">
                  <input
                    type="text"
                    className="form-control"
                    id="orderName"
                    autoComplete="off"
                    required
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-2 row">
                <label htmlFor="orderEmail" className="col-sm-2 col-form-label">
                  이메일
                </label>
                <div className="col-sm-6">
                  <input
                    type="email"
                    className="form-control"
                    id="orderEmail"
                    autoComplete="off"
                    required
                    value={orderEmail}
                    onChange={(e) => setOrderEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card border mb-3">
            <h5 className="card-header bg-light">결제설정</h5>
            <div className="card-body p-2">
              <div className="mb-2 row">
                <label htmlFor="settle_count" className="col-sm-2 col-form-label">
                  결제분할
                </label>
                <div className="col-sm-2">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="settle_count"
                      value={settleCount}
                      onChange={(e) => setSettleCount(e.target.value)}
                    />
                    <div className="input-group-text">회</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 결제이력: legacy 정적 빈 테이블 */}
          <div className="card border mb-3">
            <h5 className="card-header bg-light">결제이력</h5>
            <div className="table-responsive mt-3">
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">회차</th>
                    <th className="text-center">결제일</th>
                    <th className="text-center">PG사</th>
                    <th className="text-center">PG주문번호</th>
                    <th className="text-center">결제수단</th>
                    <th className="text-center">결제금액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={2} className="text-center">
                      잔금합계
                    </th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* 우 col-6 */}
        <div className="col-6">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">주문상품 설정</h5>
            <div className="card-body p-0">
              {/* legacy: 기존 주문상품 읽기전용 표시(삭제 컬럼 빈칸)·상품검색 footer는 제외(개발자 승인) */}
              <table className="table table-bordered table-centered mb-0 table-sm">
                <colgroup>
                  <col width="7%" />
                  <col width="*" />
                  <col width="8%" />
                  <col width="10%" />
                  <col width="15%" />
                  <col width="10%" />
                </colgroup>
                <thead className="table-light font-13">
                  <tr>
                    <th className="text-center">플랫폼</th>
                    <th className="text-center">상품명</th>
                    <th className="text-center">수량</th>
                    <th className="text-center">판매가</th>
                    <th className="text-center">합계</th>
                    <th className="text-center">삭제</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="text-center">{it.platform}</td>
                      <td>{it.product_nm}</td>
                      <td>{it.qty}</td>
                      <td className="text-end">{nf(it.price)}</td>
                      <td className="text-end">{nf(it.qty * it.price)}</td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card border mb-3">
            <h5 className="card-header bg-light">주문정보</h5>
            <div className="card-body p-2">
              <div className="mb-2 row">
                <label htmlFor="settle_no" className="col-sm-2 col-form-label">
                  결제번호
                </label>
                <div className="col-sm-4">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="settle_no"
                      value={settleNo}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="mb-2 row">
                <label htmlFor="ord_ymd" className="col-sm-2 col-form-label">
                  주문일자
                </label>
                <div className="col-sm-4">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="ord_ymd"
                      value={ordYmd}
                      onChange={(e) => setOrdYmd(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-2 row">
                <label htmlFor="settle_price" className="col-sm-2 col-form-label">
                  결제금액
                </label>
                <div className="col-sm-4">
                  <div className="input-group">
                    {/* legacy readonly → 헤더 편집 위해 해제(개발자 승인) */}
                    <input
                      type="text"
                      className="form-control"
                      id="settle_price"
                      value={settlePrice}
                      onChange={(e) => setSettlePrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 배송지: legacy 정적 빈 테이블 */}
          <div className="card border mb-3">
            <h5 className="card-header bg-light">배송지 정보</h5>
            <div className="table-responsive mt-3">
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">번호</th>
                    <th className="text-center">이름</th>
                    <th className="text-center">우편번호</th>
                    <th className="text-center">주소</th>
                    <th className="text-center">전화번호</th>
                    <th className="text-center">수정</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 결제자 선택 모달 */}
      {modalOpen &&
        createPortal(
          <>
            <div
              className={`modal fade${modalShown ? " show" : ""}`}
              tabIndex={-1}
              role="dialog"
              style={{ display: "block" }}
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header modal-colored-header bg-primary">
                    <h4 className="modal-title">중국 결제자 현황</h4>
                    <button type="button" className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12">
                        <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
                          <colgroup>
                            <col width="10%" />
                            <col width="20%" />
                            <col width="*" />
                          </colgroup>
                          <thead className="table-light">
                            <tr>
                              <th className="text-center">선택</th>
                              <th className="text-center">이름</th>
                              <th className="text-center">이메일</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white font-12">
                            {(memberAll.data?.items ?? []).map((m) => (
                              <tr key={m.idx}>
                                <td className="text-center">
                                  <input
                                    type="radio"
                                    name="member_idx"
                                    checked={selectedMember === m.idx}
                                    onChange={() => setSelectedMember(m.idx)}
                                  />
                                </td>
                                <td className="text-start">{m.name}</td>
                                <td className="text-start">{m.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-dark shadow-none"
                      onClick={onMemberChoice}
                    >
                      선택완료
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal-backdrop fade${modalShown ? " show" : ""}`}
              onClick={closeModal}
            />
          </>,
          document.body,
        )}
    </>
  );
};
