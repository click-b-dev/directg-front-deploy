import type { MypageDashboard } from "@entities/mypage-dashboard";
import { MypageAside } from "@widgets/mypage-aside";
import { FooterBannerSection } from "@widgets/footer-banner-section";

interface MypageMainScreenProps {
  memberName: string;
  /** 세션 mem_level (legacy `$_SESSION['member']['mem_level']`). */
  memLevel: string;
  dashboard: MypageDashboard;
}

/** 회원등급 map (legacy `$mem_type`). */
const MEM_TYPE: Record<string, string> = { "1": "일반", "2": "정회원", "3": "VIP" };

/** number_format(천단위 콤마) 대응. */
const nf = (value: number) => value.toLocaleString("en-US");

/** 코드발송 delivery_type 라벨 뱃지 (legacy). */
function DeliveryBadge({ deliveryType }: { deliveryType: string }) {
  if (deliveryType === "1") return <span className="badge badge-outline-success">코드발송</span>;
  if (deliveryType === "2") return <span className="badge badge-outline-post">택배발송</span>;
  if (deliveryType === "3")
    return <span className="badge badge-outline-code-post">코드+택배발송</span>;
  return null;
}

/**
 * 마이페이지 메인 대시보드 (legacy `pc/mypage/mypage_main.html`).
 * 정적 SSR. 로그인 가드는 route. aside active 없음(legacy $aside_menu 미설정).
 */
export function MypageMainScreen({ memberName, memLevel, dashboard }: MypageMainScreenProps) {
  const { member_emoney, order_info, cancel_info, order_list, cancel_list, point_list } = dashboard;

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside />
        <section id="content" className="content rounded-0">
          <div className="row g-0 mb-3">
            <div className="col-12">
              <div className="card widget-inline shadow-none rounded-0">
                <div className="card-header">
                  <strong className="font-16">{memberName}</strong> 님 환영합니다.
                </div>
                <div className="card-body p-0  rounded-1">
                  <div className="row g-0">
                    <div className="col-offset-2 col-sm-2">
                      <div className="card shadow-none m-0 ">
                        <div className="card-body text-center">
                          <h3>{MEM_TYPE[memLevel] ?? ""}</h3>
                          <p className="text-muted font-15 mb-0 mt-1">회원등급</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-2">
                      <div className="card shadow-none m-0 ">
                        <div className="card-body text-center">
                          <h3>{nf(member_emoney)}</h3>
                          <p className="text-muted font-15 mb-0 mt-1">보유 포인트</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-2">
                      <div className="card shadow-none m-0 border-start">
                        <div className="card-body text-center">
                          <h3>
                            <span>{nf(order_info.cc)}</span>
                          </h3>
                          <p className="text-muted font-15 mb-0 mt-1">총 주문건수</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-2">
                      <div className="card shadow-none m-0 border-start">
                        <div className="card-body text-center">
                          <h3>
                            <span className="won"> {nf(order_info.ss)}</span>
                          </h3>
                          <p className="text-muted font-15 mb-0 mt-1">총 주문금액</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-2">
                      <div className="card shadow-none m-0 border-start">
                        <div className="card-body text-center">
                          <h3>
                            <span>{nf(cancel_info.cc)}</span>
                          </h3>
                          <p className="text-muted font-15 mb-0 mt-1">총 취소건수</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-2">
                      <div className="card shadow-none m-0 border-start">
                        <div className="card-body text-center">
                          <h3>
                            <span className="won"> {nf(cancel_info.ss)}</span>
                          </h3>
                          <p className="text-muted font-15 mb-0 mt-1">총 취소금액</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-0 mb-3">
            <div className="col-12">
              <div className="card shadow-none rounded-0">
                <div className="card-header text-white font-16 table-sm fw-bold border-bottom-0">
                  최근 주문완료 내역 (1개월){" "}
                  <small className="font-14 float-end">
                    <a href="/mypage/mypage_order">전체보기</a>
                  </small>
                </div>
                <table className="table table-bordered table-centered mb-0 align-middle">
                  <thead className="table-dark font-14">
                    <tr>
                      <th className="text-center fw-500 p-2">
                        주문일자
                        <br />
                        (주문번호)
                      </th>
                      <th className="text-center fw-500 p-2">상품정보</th>
                      <th className="text-center fw-500 p-2">주문금액</th>
                      <th className="text-center fw-500 p-2">진행상태</th>
                      <th className="text-center fw-500 p-2">비고</th>
                    </tr>
                  </thead>
                  <tbody className="font-14">
                    {order_list.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center">
                          주문완료 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      order_list.map((value) => (
                        <tr key={value.settle_no + value.ordno}>
                          <td className="text-center px-0">
                            <span className="d-block">{value.order_date}</span>
                            <span className="d-block">({value.ordno})</span>
                          </td>
                          <td className="text-start">
                            <div className="d-block">
                              <DeliveryBadge deliveryType={value.delivery_type} />
                            </div>
                            <span className="d-block">{value.product_name}</span>
                          </td>
                          <td className="text-end">
                            <span className="num">{nf(value.price)}</span> 원
                          </td>
                          <td className="text-center">
                            <div className="d-flex flex-column">
                              {value.delivery_type === "1" && (
                                <div className="mb-1">
                                  <span className="badge bg-label py-2 font-12">
                                    {value.is_actv === "1" ? "구매확정" : "수령대기"}
                                  </span>
                                </div>
                              )}
                              {value.delivery_type !== "1" && (
                                <div className="mb-1">
                                  <span className="badge text-bg-info py-2 font-12">
                                    {value.shipment_status_label}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            <a
                              href={`/mypage/mypage_order_view?settle_no=${value.settle_no}`}
                              className="btn btn-sm btn-info text-white font-14"
                            >
                              상세보기
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row g-0 mb-3">
            <div className="col-12">
              <div className="card shadow-none rounded-0">
                <div className="card-header text-white font-16 fw-bold border-bottom-0">
                  최근 취소완료 내역 (1개월){" "}
                  <small className="font-14 float-end">
                    <a href="/mypage/mypage_cancel_end">전체보기</a>
                  </small>
                </div>
                <table className="table table-bordered table-centered table-sm mb-0 align-middle">
                  <thead className="table-dark font-14">
                    <tr>
                      <th className="text-center fw-500 p-2">취소일자</th>
                      <th className="text-center fw-500 p-2">주문번호</th>
                      <th className="text-center fw-500 p-2 w-50">상품명</th>
                      <th className="text-center fw-500 p-2">취소금액</th>
                      <th className="text-center fw-500 p-2">비고</th>
                    </tr>
                  </thead>
                  <tbody className="font-14">
                    {cancel_list.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center">
                          취소완료 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      cancel_list.map((value) => (
                        <tr key={value.settle_no + value.ordno}>
                          <td className="text-center p-2">{value.cancel_date}</td>
                          <td className="text-center p-2">{value.ordno}</td>
                          <td className="text-start p-2 w-50">{value.product_name}</td>
                          <td className="text-end p-2 won"> {nf(value.price)}</td>
                          <td className="text-center p-2">
                            <a
                              href={`/mypage/mypage_cancel_view?settle_no=${value.settle_no}`}
                              className="btn btn-sm btn-info font-14"
                            >
                              상세보기
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row g-0 mb-3">
            <div className="col-12">
              <div className="card shadow-none rounded-0">
                <div className="card-header text-white font-16 table-sm fw-bold border-bottom-0">
                  최근 포인트 내역 (1개월){" "}
                  <small className="font-14 float-end">
                    <a href="/mypage/mypage_point">전체보기</a>
                  </small>
                </div>
                <table className="table table-bordered table-centered mb-0 align-middle">
                  <thead className="table-dark font-14">
                    <tr>
                      <th className="text-center fw-500 p-2">날짜</th>
                      <th className="text-center fw-500 p-2">적립/사용</th>
                      <th className="text-center fw-500 p-2 w-50">사유</th>
                      <th className="text-center fw-500 p-2">포인트</th>
                    </tr>
                  </thead>
                  <tbody className="font-14">
                    {point_list.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center">
                          적립금 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      point_list.map((value, index) => (
                        <tr key={value.regdt + index}>
                          <td className="text-center font-14 p-2">{value.regdt}</td>
                          <td className="text-center font-14 p-2">
                            {value.emoney_type === "+"
                              ? "적립"
                              : value.emoney_type === "-"
                                ? "사용"
                                : ""}
                          </td>
                          <td className="text-start w-50 font-14 p-2">{value.memo}</td>
                          <td className="text-end price font-14 p-2 won"> {nf(value.amt_delta)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* 기획 고정 배너2 (legacy inc/footer_banner.html) */}
      <FooterBannerSection />
    </div>
  );
}
