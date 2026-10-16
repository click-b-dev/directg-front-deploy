import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  useChinaMemberAll,
  useChinaGoodsSearch,
  useCreateChinaOrder,
  CHINA_GOODS_PLATFORM_OPTIONS,
  type ChinaOrderLineItem,
  type ChinaGoodsSearchItem,
} from "@entities/china";

const nf = (n: number) => n.toLocaleString("en-US");

// legacy date('Y-m-d') — 오늘.
const todayYmd = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

type SearchRow = ChinaGoodsSearchItem & { qty: string };

// legacy china/invoice_register.php — 중국 결제 주문서 작성(register 전용).
export const ChinaInvoiceRegisterScreen = () => {
  // legacy: settle_no = China::settleNo() = round(microtime*1000) = epoch millis.
  const [settleNo, setSettleNo] = useState(() => String(Date.now()));
  const [ordYmd, setOrdYmd] = useState(todayYmd);
  const [orderName, setOrderName] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [settleCount, setSettleCount] = useState("1");
  const [lineItems, setLineItems] = useState<ChinaOrderLineItem[]>([]);

  const [searchPlatform, setSearchPlatform] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [searchRows, setSearchRows] = useState<SearchRow[]>([]);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberModalShown, setMemberModalShown] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  const [goodsModalOpen, setGoodsModalOpen] = useState(false);
  const [goodsModalShown, setGoodsModalShown] = useState(false);

  const memberAll = useChinaMemberAll();
  const goodsSearch = useChinaGoodsSearch();
  const createOrder = useCreateChinaOrder();

  // legacy settlePrice(): Σ(qty×price).
  const settlePrice = useMemo(
    () => lineItems.reduce((sum, it) => sum + (Number(it.qty) || 0) * it.price, 0),
    [lineItems],
  );

  // legacy Bootstrap fade.
  useEffect(() => {
    if (!memberModalOpen) return;
    const id = requestAnimationFrame(() => setMemberModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [memberModalOpen]);
  useEffect(() => {
    if (!goodsModalOpen) return;
    const id = requestAnimationFrame(() => setGoodsModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [goodsModalOpen]);

  const closeMemberModal = () => {
    setMemberModalShown(false);
    setMemberModalOpen(false);
  };
  const closeGoodsModal = () => {
    setGoodsModalShown(false);
    setGoodsModalOpen(false);
  };

  // legacy: 선택완료 → 미선택 alert / 선택 시 orderName·orderEmail 세팅 후 닫기.
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
    closeMemberModal();
  };

  // legacy btn_goods_search: 플랫폼/검색어 검증 → 검색 → 모달.
  const onGoodsSearch = () => {
    if (searchPlatform === "") {
      window.alert("플랫폼을 선택해주세요.");
      return;
    }
    if (searchValue === "") {
      window.alert("검색할 상품명을 입력해주세요.");
      return;
    }
    goodsSearch.mutate(
      { search_platform: searchPlatform, search_value: searchValue },
      {
        onSuccess: (res) => {
          setSearchRows(res.items.map((it) => ({ ...it, qty: "" })));
          setGoodsModalOpen(true);
        },
      },
    );
  };

  // legacy btn_goods_add: 검색행 → 주문상품 라인 추가 + settlePrice 재계산 + 모달 닫기.
  const onGoodsAdd = (row: SearchRow) => {
    setLineItems((prev) => [
      ...prev,
      { platform: row.platform, goods_nm: row.goods_nm, qty: row.qty, price: row.price },
    ]);
    closeGoodsModal();
  };

  // legacy btn_goods_delete: 라인 제거 + settlePrice 재계산.
  const onLineDelete = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // legacy btn_invoice_save: 검증 후 저장 → invoice_request 이동(개발자 승인, legacy =버그 이탈).
  const onSave = () => {
    if (orderName === "") {
      window.alert("주문자명을 입력해 주세요.");
      return;
    }
    if (orderEmail === "") {
      window.alert("주문자이메일을 입력해 주세요.");
      return;
    }
    if (settlePrice === 0) {
      window.alert("주문상품을 설정해 주세요.");
      return;
    }
    createOrder.mutate(
      {
        settle_no: settleNo,
        ord_ymd: ordYmd,
        settle_price: settlePrice,
        orderName,
        orderEmail,
        settlekind: "",
        settle_count: settleCount,
        items: lineItems,
      },
      {
        onSuccess: () => {
          window.location.href = "/china/invoice_request";
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
                    중국결제
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    중국 결제 관리
                  </a>
                </li>
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
          disabled={createOrder.isPending}
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
                      setMemberModalOpen(true);
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

          {/* 결제이력: legacy 정적 빈 테이블(데이터 바인딩 없음) */}
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
                  {lineItems.map((it, i) => (
                    <tr key={i}>
                      <td>{it.platform}</td>
                      <td>{it.goods_nm}</td>
                      <td>{it.qty}</td>
                      <td className="text-end">{nf(it.price)}</td>
                      <td className="text-end">{nf((Number(it.qty) || 0) * it.price)}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => onLineDelete(i)}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer">
              <div className="row">
                <div className="col-10">
                  <div className="input-group">
                    <div className="col-3">
                      <select
                        className="form-select "
                        id="search_platform"
                        required
                        value={searchPlatform}
                        onChange={(e) => setSearchPlatform(e.target.value)}
                      >
                        <option value="">::: 플랫폼 선택 :::</option>
                        {CHINA_GOODS_PLATFORM_OPTIONS.map((opt, i) => (
                          <option key={i} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_value"
                        placeholder="검색할 상품명을 입력해 주세요"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-2">
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-dark shadow-none"
                      disabled={goodsSearch.isPending}
                      onClick={onGoodsSearch}
                    >
                      상품검색
                    </button>
                  </div>
                </div>
              </div>
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
                      onChange={(e) => setSettleNo(e.target.value)}
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
                    <input
                      type="text"
                      className="form-control"
                      id="settle_price"
                      value={settlePrice}
                      readOnly
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
      {memberModalOpen &&
        createPortal(
          <>
            <div
              className={`modal fade${memberModalShown ? " show" : ""}`}
              tabIndex={-1}
              role="dialog"
              style={{ display: "block" }}
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header modal-colored-header bg-primary">
                    <h4 className="modal-title">중국 결제자 현황</h4>
                    <button type="button" className="btn-close" onClick={closeMemberModal} />
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
              className={`modal-backdrop fade${memberModalShown ? " show" : ""}`}
              onClick={closeMemberModal}
            />
          </>,
          document.body,
        )}

      {/* 주문상품 검색결과 모달 */}
      {goodsModalOpen &&
        createPortal(
          <>
            <div
              className={`modal fade${goodsModalShown ? " show" : ""}`}
              tabIndex={-1}
              role="dialog"
              style={{ display: "block" }}
            >
              <div className="modal-dialog modal-lg" style={{ maxWidth: "1100px" }}>
                <div className="modal-content">
                  <div className="modal-header modal-colored-header bg-primary">
                    <h4 className="modal-title">주문상품 검색결과</h4>
                    <button type="button" className="btn-close" onClick={closeGoodsModal} />
                  </div>
                  <div className="modal-body p-0">
                    <table className="table table-striped table-border mb-0 table-sm">
                      <colgroup>
                        <col width="10%" />
                        <col width="*" />
                        <col width="10%" />
                        <col width="10%" />
                        <col width="13%" />
                      </colgroup>
                      <thead className="table-dark font-14">
                        <tr>
                          <th className="text-center">플랫폼</th>
                          <th className="text-center">상품명</th>
                          <th className="text-center">수량</th>
                          <th className="text-center">판매가</th>
                          <th className="text-center">합계</th>
                        </tr>
                      </thead>
                      <tbody className="font-13">
                        {searchRows.map((row, i) => (
                          <tr key={i}>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={row.platform}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={row.goods_nm}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={row.qty}
                                onChange={(e) =>
                                  setSearchRows((prev) =>
                                    prev.map((r, j) =>
                                      j === i ? { ...r, qty: e.target.value } : r,
                                    ),
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control text-end"
                                value={row.price}
                                readOnly
                              />
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => onGoodsAdd(row)}
                              >
                                상품 추가
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal-backdrop fade${goodsModalShown ? " show" : ""}`}
              onClick={closeGoodsModal}
            />
          </>,
          document.body,
        )}
    </>
  );
};
