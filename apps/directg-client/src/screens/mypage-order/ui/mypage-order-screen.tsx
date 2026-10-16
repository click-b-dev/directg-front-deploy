import type { MypageOrderItem, MypageOrderListResponse } from "@entities/mypage-order";
import { ServerPagination } from "@shared/ui/server-pagination";
import { MypageAside } from "@widgets/mypage-aside";

import { OrderSearchForm } from "./order-search-form";

interface MypageOrderScreenProps {
  data: MypageOrderListResponse;
  /** 상품명 검색어(raw, ""=미검색). 폼 value + 페이지네이션 param. */
  searchProductName: string;
  /** 기간 코드 effective "0"~"6"(기본 "0"). 폼 active 표기용. */
  searchDate: string;
  /** 기간 코드 raw(""=URL 미지정). 페이지네이션 param 전용 — legacy `$param`은 raw `$_GET` 기준. */
  searchDateParam: string;
}

/** game_type/display_type → 뱃지(legacy switch). 없으면 null. */
function gameTypeBadge(
  gameType: string,
  displayType: string,
): { cls: string; label: string } | null {
  switch (gameType) {
    case "game":
      switch (displayType) {
        case "basic":
          return { cls: "bg-info", label: "기본게임" };
        case "edition":
          return { cls: "bg-primary", label: "에디션" };
        case "multi":
          return { cls: "bg-warning", label: "멀티팩" };
        default:
          return null;
      }
    case "dlc":
      return { cls: "bg-content", label: "DLC" };
    case "music":
      return { cls: "bg-content", label: "Music" };
    case "bundle":
      return { cls: "bg-success", label: "번들" };
    case "holomodels":
      switch (displayType) {
        case "holomodels":
          return { cls: "bg-success", label: "본체" };
        case "holomodelsdlc":
          return { cls: "bg-content", label: "DLC" };
        case "holomodelsedition":
          return { cls: "bg-primary", label: "에디션" };
        default:
          return null;
      }
    default:
      return null;
  }
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

/** 코드수령상태 뱃지(delivery_type=1). legacy 3분기. */
function codeReceiptBadge(item: MypageOrderItem): { cls: string; txt: string } {
  if (item.step === "2" && item.status === "1" && item.send_status === "fail") {
    return { cls: "danger", txt: "발송오류" };
  }
  if (item.step === "2") {
    return { cls: "label", txt: "주문완료" };
  }
  return { cls: "warning", txt: "입금대기" };
}

/** shipment_status → 배송상태 라벨(legacy Order::getShipmentStatus). 미해당 빈 문자열. */
function shipmentStatusLabel(shipmentStatus: string | null): string {
  switch (shipmentStatus) {
    case "2":
      return "배송대기";
    case "3":
      return "배송준비";
    case "4":
      return "배송중";
    case "5":
      return "배송완료";
    case "6":
      return "구매확정";
    default:
      return "";
  }
}

/**
 * 주문완료 내역 (legacy `pc/mypage/mypage_order.html`). 세션 SSR 목록 + 상품명/기간 검색.
 * 가드는 route. footer_banner 없음(순수 footer).
 */
export function MypageOrderScreen({
  data,
  searchProductName,
  searchDate,
  searchDateParam,
}: MypageOrderScreenProps) {
  const { list, page, totalPages } = data;
  const currentYear = new Date().getFullYear();

  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="order2" />
        <section id="content" className="content rounded-0 font-14">
          <OrderSearchForm
            searchProductName={searchProductName}
            searchDate={searchDate}
            currentYear={currentYear}
          />

          <div className="cart_msg bg-alert mb-4">
            <div className="alert font-14 rounded-0" role="alert">
              <ul className="list-group list-group-flush p-0">
                <li className="list-group-item border-0 bg-alert">
                  <span className="text-warning">
                    ※ 한글패치 등 제공콘텐츠는{" "}
                    <a href="/mypage/mypage_supply_content_v2">[혜택정보 &gt; 제공콘텐츠]</a>
                    에서 확인해 주시기 바랍니다.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <table className="table table-bordered table-centered mb-0 text-center align-middle text-nowrap">
                <colgroup>
                  <col width="15%" />
                  <col width="20%" />
                  <col width="*" />
                  <col width="8%" />
                  <col width="8%" />
                  <col width="8%" />
                  <col width="8%" />
                </colgroup>
                <thead className="font-14">
                  <tr>
                    <th className="bg-body-tertiary">
                      주문일자
                      <br />
                      (주문번호)
                    </th>
                    <th className="bg-body-tertiary align-middle" colSpan={2}>
                      상품정보
                    </th>
                    <th className="bg-body-tertiary align-middle">주문금액</th>
                    <th className="bg-body-tertiary align-middle">진행상태</th>
                    <th className="bg-body-tertiary align-middle">코드수령</th>
                    <th className="bg-body-tertiary align-middle">비고</th>
                  </tr>
                </thead>
                <tbody className="bg-dark font-13">
                  {list.map((item) => {
                    const badge = gameTypeBadge(item.game_type, item.display_type);
                    const icon = platformIcon(item.product_platform);
                    const delivery = deliveryTypeBadge(item.delivery_type);
                    const receipt = codeReceiptBadge(item);
                    const detailHref = `/mypage/mypage_order${item.status === "3" ? "_wating" : ""}_view?settle_no=${item.settle_no}`;
                    return (
                      <tr key={`${item.settle_no}-${item.ordno}`}>
                        <td className="text-center p-0">
                          <span className="d-block">{item.order_date}</span>
                          <span className="d-block">({item.ordno})</span>
                        </td>
                        <td className="text-center p-0">
                          <div className="d-flex">
                            <div className="position-relative col-9">
                              <img
                                src={`${item.domain}/upload/product/${item.product_code}/header/header.jpg`}
                                className="img-fluid rounded-0"
                              />
                              <div className="position-absolute bottom-0 start-0">
                                {badge && (
                                  <span className={`badge ${badge.cls} rounded-0 font-12 py-2`}>
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-center align-content-center align-self-center col-3">
                              {icon && <img className={icon.className} src={icon.src} />}
                            </div>
                          </div>
                        </td>
                        <td className="text-start">
                          <div className="d-block">
                            {delivery && (
                              <span className={`badge ${delivery.cls}`}>{delivery.label}</span>
                            )}
                          </div>
                          <span className="d-block text-wrap">{item.product_name}</span>
                        </td>
                        <td className="text-end">
                          <span className="num">{item.price.toLocaleString("en-US")}</span> 원
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            {/* 코드수령상태 */}
                            {item.delivery_type === "1" && (
                              <div className="mb-1">
                                <span className={`badge bg-${receipt.cls} font-12 py-2`}>
                                  {receipt.txt}
                                </span>
                              </div>
                            )}
                            {/* 배송상태(택배발송상품) */}
                            {item.delivery_type !== "1" && (
                              <div className="mb-1">
                                <span className="badge text-bg-info font-12 py-2">
                                  {shipmentStatusLabel(item.shipment_status)}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            {/* 코드수령상태 */}
                            {(item.delivery_type === "1" || item.delivery_type === "3") && (
                              <div className="mb-1">
                                <span className="badge bg-label font-12 py-2">
                                  {item.is_actv === "1" ? "구매확정" : "수령대기"}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <a
                            href={detailHref}
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
                      <td colSpan={7}>주문 이력이 존재하지 않습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div id="pagination" className="mt-4">
              <ServerPagination
                page={page}
                totalPages={totalPages}
                baseUrl="/mypage/mypage_order"
                params={{ search_product_name: searchProductName, search_date: searchDateParam }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
