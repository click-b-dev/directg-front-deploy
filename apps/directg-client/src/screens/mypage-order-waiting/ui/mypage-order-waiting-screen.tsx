import { Fragment } from "react";

import type { MypageOrderWaitingResponse, WaitingOrder } from "@entities/mypage-order";
import { ServerPagination } from "@shared/ui/server-pagination";
import { MypageAside } from "@widgets/mypage-aside";

interface MypageOrderWaitingScreenProps {
  data: MypageOrderWaitingResponse;
  /** 상품명 검색어(raw) — legacy 폼은 없으나 URL 파라미터 통과·페이지네이션 param용. */
  searchProductName: string;
  /** 기간 코드 raw(""=URL 미지정) — 페이지네이션 param용(legacy `$param`은 raw `$_GET`). */
  searchDateParam: string;
}

/** product_platform → 플랫폼 아이콘(legacy switch). 51은 w-75 추가. 없으면 null. */
function platformIcon(platform: string): { src: string; className: string } | null {
  switch (platform) {
    case "1":
      return { src: "/assets/images/platform/steam.svg", className: "mx-auto d-block rounded-0" };
    case "34":
      return { src: "/assets/images/platform/epic_w.svg", className: "mx-auto d-block rounded-0" };
    case "35":
      return {
        src: "/assets/images/platform/rockstar_2.svg",
        className: "mx-auto d-block rounded-0",
      };
    case "51":
      return {
        src: "/assets/images/platform/holomodels.svg",
        className: "mx-auto d-block rounded-0 w-75",
      };
    default:
      return null;
  }
}

/** delivery_type → 배송방식 뱃지(legacy). 1·2·3 외엔 null. */
function deliveryTypeBadge(deliveryType: string): { cls: string; label: string } | null {
  switch (deliveryType) {
    case "1":
      return { cls: "badge-outline-success", label: "코드발송" };
    case "2":
      return { cls: "badge-outline-post", label: "택배발송" };
    case "3":
      return { cls: "badge-outline-code-post", label: "코드+택배발송" };
    default:
      return null;
  }
}

/**
 * ISO va_date에서 legacy `date()` 포맷 재현. kcp="m월 d일 H:i"(zero-padded), payco="m월 d일".
 * now 무관 — 저장된 마감일시 문자열 추출(tz 영향 없음).
 */
function formatVaDate(vaDate: string, provider: WaitingOrder["provider"]): string {
  const matched = vaDate.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!matched) {
    return "";
  }
  const [, , mm, dd, hh, min] = matched;
  if (provider === "kcp") {
    return `${mm}월 ${dd}일 ${hh}:${min}`;
  }
  return `${mm}월 ${dd}일`;
}

/**
 * 입금대기 내역 (legacy `pc/mypage/mypage_order_wating.html`). 세션 SSR 목록(kcp/payco 가상계좌 그룹핑).
 * 가드는 route. **검색폼 없음**(legacy 마크업에 부재). footer_banner 없음.
 */
export function MypageOrderWaitingScreen({
  data,
  searchProductName,
  searchDateParam,
}: MypageOrderWaitingScreenProps) {
  const { list, page, totalPages } = data;

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="order_wating" />
        <section id="content" className="content rounded-0 font-14">
          <div className="row">
            <div className="col-12">
              <table className="table table-bordered table-centered mb-0 text-center align-middle text-nowrap">
                <colgroup>
                  <col width="15%" />
                  <col width="*" />
                  <col width="8%" />
                  <col width="20%" />
                  <col width="8%" />
                </colgroup>
                <thead className="font-14">
                  <tr>
                    <th className="bg-body-tertiary">
                      주문일자
                      <br />
                      (결제번호)
                    </th>
                    <th className="bg-body-tertiary align-middle">상품정보</th>
                    <th className="bg-body-tertiary align-middle">주문금액</th>
                    <th className="bg-body-tertiary align-middle">진행상태</th>
                    <th className="bg-body-tertiary align-middle">비고</th>
                  </tr>
                </thead>
                <tbody className="bg-dark font-13">
                  {list.map((order) => {
                    const closed = order.deposit_status === "closed";
                    return (
                      <tr key={order.settle_no}>
                        <td className="text-center px-0">
                          <span className="d-block">{order.order_date}</span>
                          <span className="d-block">({order.settle_no})</span>
                        </td>
                        <td className="text-start">
                          {order.items.map((item, idx) => {
                            const icon = platformIcon(item.product_platform);
                            const delivery = deliveryTypeBadge(item.delivery_type);
                            return (
                              <Fragment key={item.ordno}>
                                {idx > 0 && <hr className="my-2" />}
                                <div className="d-flex">
                                  <div className="col-2 text-center align-content-center align-self-center">
                                    {icon && <img className={icon.className} src={icon.src} />}
                                  </div>
                                  <div className="col-10">
                                    <div className="d-block mb-1">
                                      {delivery && (
                                        <span className={`badge ${delivery.cls}`}>
                                          {delivery.label}
                                        </span>
                                      )}
                                    </div>
                                    <span className="d-block text-wrap">{item.product_name}</span>
                                    <span className="d-block text-end">
                                      <span className="num">
                                        {item.price.toLocaleString("en-US")}
                                      </span>{" "}
                                      원
                                    </span>
                                  </div>
                                </div>
                              </Fragment>
                            );
                          })}
                        </td>
                        <td className="text-end">
                          <span className="num">{order.amount.toLocaleString("en-US")}</span> 원
                        </td>
                        <td>
                          {order.step === "1" && (
                            <>
                              <div className="mb-1">
                                <span
                                  className={`badge ${closed ? "bg-danger" : "bg-warning"} font-12 py-2`}
                                >
                                  {closed ? "입금마감" : "입금대기"}
                                </span>
                              </div>
                              {order.bank_name} {order.account}
                              <br />
                              {order.provider === "kcp" ? (
                                <>
                                  예금주 : {order.depositor}
                                  <br />
                                  입금마감: {formatVaDate(order.va_date, "kcp")}
                                </>
                              ) : (
                                <>입금마감: {formatVaDate(order.va_date, "payco")}</>
                              )}
                            </>
                          )}
                        </td>
                        <td>
                          <a
                            href={`/mypage/mypage_order_wating_view?settle_no=${order.settle_no}`}
                            className="btn btn-sm btn-secondary text-white font-14"
                          >
                            상세보기
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={5}>주문 이력이 존재하지 않습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl="/mypage/mypage_order_wating"
                params={{ search_product_name: searchProductName, search_date: searchDateParam }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
