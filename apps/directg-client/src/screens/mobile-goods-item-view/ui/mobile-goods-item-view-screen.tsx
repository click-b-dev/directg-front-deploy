import type { GoodsItemDetailResponse } from "@entities/goods-item-detail";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/**
 * 모바일 액세서리/실물 상품 상세 (legacy `mobile/game/goods_item_view.html`).
 * PC보다 단순: 미디어·우측 관련상품 steam 게임정보 없음. 위시·장바구니 order 이월(마크업만).
 */
export function MobileGoodsItemViewScreen({ data }: { data: GoodsItemDetailResponse }) {
  const item = data.option_item;
  const attr = data.attribute_info;

  if (data.goods_status === "N") {
    return (
      <>
        <MobileSubHeader pageTitle={item.product_name} />
        <div id="appCapsuleSub" className="full-height">
          <div className="error-page">
            <div className="icon-box text-danger">
              <ion-icon name="alert-circle" role="img" aria-label="alert circle"></ion-icon>
            </div>
            <h1 className="title">ERROR</h1>
            <div className="text mb-5">{data.goods_status_msg}</div>
          </div>
        </div>
      </>
    );
  }

  const hasPromotion = item.promotion.sale_price > 0;

  return (
    <>
      <MobileSubHeader pageTitle={item.product_name} />
      <div id="appCapsuleSub" className="full-height">
        {/* 상품 헤더 카드 */}
        <div className="card mb-2">
          <img
            src={`${item.domain}/upload/product/${item.product_code}/header/header.jpg`}
            className="card-img-top rounded-0"
            alt={data.title_info.title_name}
          />
          <div className="card-body text-white py-3">
            <small className="font-12">[{item.product_name_en}]</small>
            <h2>{item.product_name} </h2>
            <p className="font-12">
              <span className="badge text-bg-danger rounded-1 font-11 fw-bold">무료배송</span>
            </p>
            <div className="d-flex justify-content-between align-items-center">
              {hasPromotion ? (
                <>
                  <div className=" p-0 text-center">
                    <span className="font-14 badge bg-danger rounded-2 px-3 py-2 fw-bold minus">
                      {item.promotion.discount_rate} %
                    </span>
                  </div>
                  <div className="price text-end">
                    <s className="old-price font-12 text-secondary pe-1 won">
                      {" "}
                      {formatWon(item.consumer_price)}
                    </s>{" "}
                    <span className="font-14 current-price text-white won">
                      {" "}
                      {formatWon(item.promotion.sale_price)}
                    </span>{" "}
                  </div>
                </>
              ) : (
                <>
                  <div className=" p-0 text-center">
                    {item.discount > 0 && (
                      <span className="font-14 badge bg-primary rounded-2 px-3 py-2 fw-bold minus">
                        {item.discount} %
                      </span>
                    )}
                  </div>
                  <div className="price text-end">
                    {item.discount > 0 && (
                      <s className="old-price font-12 text-secondary pe-1 won">
                        {" "}
                        {formatWon(item.consumer_price)}
                      </s>
                    )}{" "}
                    <span className="font-14 current-price text-white won">
                      {" "}
                      {formatWon(item.price)}
                    </span>{" "}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="card-footer px-3">
            <div className="d-flex d-row justify-content-between">
              <button
                type="button"
                className="btn btn-sm shadow-none font-14 rounded-0 bg-danger btn_wishlist"
                data-sku={item.goods_sku}
              >
                <ion-icon name="heart-outline"></ion-icon> 위시리스트
              </button>
              {item.soldout === "N" ? (
                <button
                  type="button"
                  className="btn btn-sm shadow-none font-14 rounded-0 bg-primary btn_cart"
                  data-sku={item.goods_sku}
                >
                  <ion-icon name="cart-outline"></ion-icon> 장바구니
                </button>
              ) : (
                <span className="badge bg-secondary font-14 rounded-1 py-3 px-2">품절</span>
              )}
            </div>
          </div>
        </div>

        {/* 배송 안내 */}
        <div className="section inset mb-2">
          <div className="alert alert-outline-warning rounded-0" role="alert">
            <p className="font-14 mb-0">
              ※ 해당 상품은 실물로 배송되는 상품이 포함되거나, 단품으로 배송되는 상품입니다.
            </p>
            <p className="font-14 mb-0">
              ※ 실물로 배송되는 상품이 포함되거나, 단품으로 배송되는 상품들은 적립금이 지급되지
              않습니다. (주문결제 시 사용은 가능)
            </p>
            <p className="font-14 mb-0">※ 이미지는 실제와 다소 차이가 있을 수 있습니다.</p>
            <p className="font-14 mb-0">
              ※ 영업일 오후 2시(금요일은 오전 11시 30분) 이전 결제 완료 건은 당일 발송되며, 이후
              주문은 익일(주말 및 공휴일 제외) 발송됩니다.
            </p>
          </div>
        </div>

        {/* 상품설명 */}
        <div className="section full">
          <div className="section-title">상품설명</div>
          <div className="wide-block pt-2 pb-2">
            <div
              className="goods_detail_info"
              dangerouslySetInnerHTML={{ __html: data.description_html }}
            />
          </div>
        </div>

        {/* 상품정보 제공고시 */}
        <div className="section full mb-2">
          <div className="section-title">상품정보 제공고시</div>
          <div className="wide-block p-0">
            <ul className="list-unstyled mb-0">
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">품명</span>
                  <p className="font-12 mb-0">{attr.product_name}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">모델명</span>
                  <p className="font-12 mb-0">{attr.model_name}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">KC 인증정보</span>
                  <p className="font-12 mb-0">
                    <a
                      href={`https://www.rra.go.kr/ko/license/A_b_popup_keyno.do?key_no=${attr.kc_safety_infomartion}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {attr.kc_safety_infomartion}
                    </a>
                  </p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">정격전압</span>
                  <p className="font-12 mb-0">{attr.rated_voltage}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">소비전력</span>
                  <p className="font-12 mb-0">{attr.power}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">동일모델의 출시년월</span>
                  <p className="font-12 mb-0">{attr.manufacturing_date}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">제조자/수입자</span>
                  <p className="font-12 mb-0">{attr.manufacturer}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">제조국</span>
                  <p className="font-12 mb-0">{attr.manufacture_country}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">크기(mm)</span>
                  <p className="font-12 mb-0">{attr.size}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">무게(kg)</span>
                  <p className="font-12 mb-0">{attr.weight}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">주요사양</span>
                  <p className="font-12 mb-0">{attr.main_requirements}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">품질보증기준</span>
                  <p className="font-12 mb-0">{attr.warranty_service}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">A/S 책임자/전화번호</span>
                  <p className="font-12 mb-0">{attr.as_information}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* 거래조건에 관한 정보 */}
        <div className="section full mb-2">
          <div className="section-title">거래조건에 관한 정보</div>
          <div className="wide-block p-0">
            <ul className="list-unstyled mb-0">
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">재화 등의 배송방법에 관한 정보</span>
                  <p className="font-12 mb-0">{attr.delivery_method_info}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">주문 이후 예상되는 배송기간</span>
                  <p className="font-12 mb-0 text-break">
                    대금지급일(결제완료일)로부터 3영업일 이내에 발송
                    <br />
                    (단, 예약 판매 상품이 포함된 경우 별도의 공지를 통해 안내)
                  </p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">
                    제품하자·오배송 등에 따른 청약철회 등의 경우 청약철회 등의 기한 및
                    통신판매업자가 부담하는 반품비용 등에 관한 정보
                  </span>
                  <p className="font-12 mb-0 text-break text-wrap">
                    전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 제품의 하자 또는 오배송
                    등으로 인한 청약철회의 경우에는 상품 수령 후 3개월 이내, 그 사실을 안 날 또는 알
                    수 있었던 날로부터 30일 이내에 청약철회를 할 수 있으며, 반품 비용은
                    통신판매업자가 부담합니다.
                  </p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">
                    제품하자가 아닌 소비자의 단순변심에 따른 청약철회 시 소비자가 부담하는 반품비용
                    등에 관한 정보
                  </span>
                  <p className="font-12 mb-0 text-break">
                    단순변심에 따른 청약철회 시 재화의 반환에 필요한 비용은 소비자가 부담합니다.
                    <br />
                    (전자상거래 등에서의 소비자보호에 관한 법률 제18조 제9항)
                  </p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">
                    제품하자가 아닌 소비자의 단순변심에 따른 청약철회가 불가능한 경우 그 구체적
                    사유와 근거
                  </span>
                  <p className="font-12 mb-0 text-break">
                    전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 청약철회 제한 사유에
                    해당하는 경우 및 기타 객관적으로 이에 준하는 것으로 인정되는 경우 청약철회가
                    제한될 수 있습니다.
                  </p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">
                    재화 등의 교환·반품·보증 조건 및 품질보증기준
                  </span>
                  <p className="font-12 mb-0">
                    소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.
                  </p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">재화 등의 A/S 관련 전화번호</span>
                  <p className="font-12 mb-0">{attr.as_information2}</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">
                    대금을 환불받기 위한 방법과 환불이 지연될 경우 지연배상금을 지급받을 수 있다는
                    지연배상금 지급의 구체적인 조건·절차
                  </span>
                  <p className="font-12 mb-0 text-break">
                    주문취소 및 대금의 환불은 [마이페이지 &gt; 주문내역] 메뉴에서 신청할 수 있으며,
                    전자상거래 등에서의 소비자보호에 관한 법률에 따라 소비자의 청약철회 후 판매자가
                    재화 등을 반환 받은 날로부터 3영업일 이내에 지급받은 대금의 환급을 정당한 사유
                    없이 지연하는 때에는 소비자는 지연기간에 대해서 연 15%의 지연배상금을 판매자에게
                    청구할 수 있습니다.
                  </p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">
                    소비자피해보상의 처리, 재화 등에 대한 불만 처리 및 소비자와 사업자 사이의
                    분쟁처리에 관한 사항
                  </span>
                  <p className="font-12 mb-0">
                    소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.
                  </p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">
                    거래에 관한 약관의 내용 또는 확인할 수 있는 방법
                  </span>
                  <p className="font-12 mb-0">
                    홈페이지 하단에 이용약관 및 개인정보처리방침 링크에서 확인할 수 있습니다.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* 교환/반품 정보 */}
        <div className="section full mb-2">
          <div className="section-title">교환/반품 정보</div>
          <div className="wide-block p-0">
            <ul className="list-unstyled mb-0">
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">교환/반품 비용</span>
                  <p className="font-12 mb-0">
                    배송비 편도 3,000원
                    <br />
                    (최초 배송비 무료인 경우 6,000원 부과)
                  </p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">교환/반품 주소지</span>
                  <p className="font-12 mb-0">
                    [07583] 서울특별시 강서구 강서로56가길 35(등촌동, 에이치투아이앤티빌딩) 5층
                    (주)에이치투인터렉티브
                  </p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">교환/반품 연락처</span>
                  <p className="font-12 mb-0">1544-2367</p>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">교환/반품 가능기간</span>
                  <ul className="font-12">
                    <li>
                      단순변심: 상품 수령일로부터 7일 이내 (배송비: 구매자 부담)
                      <br />
                      (단, 제품 코드(키) 상품이 포함된 경우는 디지털 상품 환불정책에 따라
                      구입일로부터 7일)
                    </li>
                    <li>
                      제품의 하자 또는 오배송: 상품 수령일로부터 3개월 이내, 그 사실을 안 날 또는 알
                      수 있었던 날로부터 30일 이내 (배송비: 판매자 부담)
                    </li>
                    <li>품질 보증기간은 제품 구매일로부터 1년입니다. (구매 영수증으로 증빙)</li>
                  </ul>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">교환/반품 불가기준</span>
                  <ul className="font-12">
                    <li>교환/반품 가능기간이 경과된 경우</li>
                    <li>구매자 귀책으로 상품 등이 멸실 또는 훼손된 경우</li>
                    <li>
                      포장을 개봉하였거나, 포장이 훼손되어 상품 등의 가치가 현저히 상실된 경우
                      <br />
                      (단, 상품 내용 확인을 위해 포장 등을 훼손한 경우는 제외)
                    </li>
                    <li>
                      구매자의 사용 또는 일부 소비에 의하여 상품 등의 가치가 현저히 감소한 경우
                    </li>
                    <li>
                      시간의 경과에 의해 재판매가 곤란할 정도로 상품 등의 가치가 현저히 감소한 경우
                    </li>
                  </ul>
                </div>
              </li>
              <li className="px-3 py-2 border-bottom border-opacity-25">
                <div className="p-0">
                  <span className="text-secondary font-14">
                    플레이스테이션 하드웨어 및 액세서리 제품 초기불량
                  </span>
                  <ul className="font-12">
                    <li>
                      초기 불량의 경우, SIEK 공식 고객센터에서 불량 판정 후 교환/반품이 가능합니다.
                    </li>
                    <li>제품 불량 여부는 제조사 A/S 센터에서만 판정할 수 있습니다.</li>
                    <li>
                      불량 판정이 확인되면, 제조사 고객센터의 안내에 따라 교환 또는 반품 절차를
                      진행해 주시기 바랍니다.
                    </li>
                    <li>
                      수리 접수 안내:{" "}
                      <a
                        href="http://www.playstation.com/ko-kr/support/hardware/service-center/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        http://www.playstation.com/ko-kr/support/hardware/service-center/
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
