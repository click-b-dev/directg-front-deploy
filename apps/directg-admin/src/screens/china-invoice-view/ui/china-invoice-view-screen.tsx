import { useChinaOrderDetail, type ChinaOrderDetailSearch } from "@entities/china";

const nf = (n: number) => n.toLocaleString("en-US");

// legacy <span style="font-family:dotum">&#92;</span> — dotum 폰트에서 백슬래시가 ₩로 렌더.
const Won = ({ n }: { n: number }) => (
  <>
    <span style={{ fontFamily: "dotum" }}>{"\\"}</span> {nf(n)}
  </>
);

// legacy step 라벨: 1 결제대기, 2 결제완료.
const stepLabel = (step: string) => (step === "1" ? "결제대기" : step === "2" ? "결제완료" : "");

// legacy china/invoice_view.php — 주문서 상세보기(읽기전용).
export const ChinaInvoiceViewScreen = (search: ChinaOrderDetailSearch) => {
  const settleNo = search.settle_no;
  const { data } = useChinaOrderDetail(settleNo);

  const order = data?.order ?? null;
  const items = data?.items ?? [];
  const logs = data?.logs ?? [];
  const address = data?.address ?? [];

  const totalCount = items.reduce((s, it) => s + it.qty, 0);
  const totalPrice = items.reduce((s, it) => s + it.price * it.qty, 0);

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
                <li className="breadcrumb-item active">주문서 상세보기</li>
              </ol>
            </div>
            <h4 className="page-title">주문서 상세보기</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {/* Invoice Logo */}
              <div className="clearfix">
                <div className="text-center">
                  <h4 className="m-0 d-print-none">Invoice for purchase #{settleNo}</h4>
                </div>
                {/* legacy: 수정 버튼 주석 dead */}
                <div className="text-end"></div>
              </div>

              {/* Invoice Detail */}
              <div className="row mt-4">
                <div className="col-sm-6">
                  <div className="card">
                    <h5 className="card-header bg-light">주문자 정보</h5>
                    <div className="card-body p-2">
                      <ul className="list-group">
                        <li className="list-group-item">
                          <strong>주문자명:</strong> {order?.name ?? ""}
                        </li>
                        <li className="list-group-item">
                          <strong>주문자이메일:</strong> {order?.email ?? ""}
                        </li>
                        <li className="list-group-item">
                          <strong>주문일자:</strong> {order?.ord_ymd ?? ""}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-sm table-bordered caption-top">
                      <caption className="">주문상품 정보</caption>
                      <thead className="table-light">
                        <tr>
                          <th className="text-center">상품명</th>
                          <th className="text-center">판매가</th>
                          <th className="text-center">판매수량</th>
                          <th className="text-center">합계</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, i) => (
                          <tr key={i}>
                            <td className="text-start">{it.product_nm}</td>
                            <td className="text-end">
                              <Won n={it.price} />
                            </td>
                            <td className="text-end">{nf(it.qty)}</td>
                            <td className="text-end">
                              <Won n={it.price * it.qty} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          {/* legacy 오타 "힙계" 이식 */}
                          <th colSpan={2} className="text-center">
                            힙계
                          </th>
                          <th className="text-end">{nf(totalCount)}</th>
                          <th className="text-end">
                            <Won n={totalPrice} />
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="card">
                    <h5 className="card-header bg-light">결제 정보</h5>
                    <div className="card-body p-2">
                      <ul className="list-group">
                        <li className="list-group-item">
                          <strong>결제예정금액:</strong> <Won n={order?.settle_price ?? 0} />
                        </li>
                        <li className="list-group-item">
                          <strong>결제완료금액:</strong> <Won n={order?.amount_paid ?? 0} />
                        </li>
                        <li className="list-group-item">
                          <strong>남은금액:</strong>{" "}
                          <Won n={(order?.settle_price ?? 0) - (order?.amount_paid ?? 0)} />
                        </li>
                        <li className="list-group-item">
                          <strong>결제횟수:</strong> {order?.settle_count ?? ""}
                        </li>
                        <li className="list-group-item">
                          <strong>결제상태: </strong>
                          {stepLabel(order?.step ?? "")}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="card">
                    <h5 className="card-header bg-light">결제 상세정보</h5>
                    <div className="card-body p-2">
                      <ul className="list-group">
                        {logs.map((log, i) => (
                          <li className="list-group-item" key={i}>
                            {log.settle_count}회차 / {log.pg_provider} /{" "}
                            {log.status === "paid" ? "결제완료" : "결제대기"} /{" "}
                            {log.pg_provider === "kcp" ? log.imp_uid : log.pg_tid} /{" "}
                            {nf(log.paid_amount)} 원/ {log.reg_date}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="card">
                    <h5 className="card-header bg-light">배송지 정보</h5>
                    <div className="card-body p-2">
                      <table className="table table-bordered table-sm">
                        <thead className="table-light">
                          <tr>
                            <th className="text-center">번호</th>
                            <th className="text-center">이름</th>
                            <th className="text-center">우편번호</th>
                            <th className="text-center">주소</th>
                            <th className="text-center">전화번호</th>
                          </tr>
                        </thead>
                        <tbody>
                          {address.map((addr, i) => (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td>{addr.name}</td>
                              <td>{addr.zipcode}</td>
                              <td>{addr.address}</td>
                              <td>{addr.tel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-6"></div>
                <div className="col-sm-6">
                  <div className="float-end mt-3 mt-sm-0">
                    <h3>
                      <Won n={totalPrice} />
                    </h3>
                  </div>
                  <div className="clearfix"></div>
                </div>
              </div>
              {/* end row */}
            </div>
            {/* end card-body */}
          </div>
          {/* end card */}
        </div>
      </div>
    </>
  );
};
