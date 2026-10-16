import type { GoodsItemDetailResponse } from "@entities/goods-item-detail";
import {
  MediaGallery,
  WishlistButton,
  CartButton,
  CartWishlistModals,
} from "@widgets/product-detail";

const formatWon = (value: number) => value.toLocaleString("ko-KR");

/** 액세서리/실물 상품 상세 (legacy `pc/game/goods_item_view.html`). 공개 SSR + 인터랙션(게이트 없음). */
export function GameGoodsItemScreen({ data }: { data: GoodsItemDetailResponse }) {
  const {
    goods_status,
    goods_status_msg,
    option_item,
    title_info,
    media_list,
    attribute_info,
    description_html,
    show_game_info,
    steam_game_info,
  } = data;

  const promo = option_item.promotion;
  const hasDiscount = option_item.discount > 0 || promo.discount_rate > 0;

  const ageImg =
    title_info.age_limit === "10"
      ? "/assets/images/game/age_all.png"
      : title_info.age_limit !== ""
        ? `/assets/images/game/age_${title_info.age_limit}.png`
        : null;
  const gradeImgs = title_info.game_rate
    .split("")
    .map((c, i) => (c === "1" ? `/assets/images/game/grade${i + 1}.png` : null))
    .filter((s): s is string => s !== null);

  return (
    <>
      <style>{`
.screenshot-thumbnail{width:112px;height:63px;margin-right:4px;}
#media_list{overflow-x:scroll;}
#description_html{padding:1rem;}
#description_html img{max-width:100%;}
#description_html h1,#description_html h2,#description_html h3,#description_html h4,#description_html h5,#description_html h6{font-size:14px;font-weight:700;color:#0dcaf0;}
.bg-card{background:#303D4E;}
#requirements_html{font-size:14px;}
#requirements_html strong{--bs-text-opacity:0.5;}
`}</style>

      <main>
        <div className="container my-3 pb-5">
          {goods_status === "N" ? (
            <div className="row mt-3">
              <div
                className="alert alert-danger alert-dismissible bg-danger text-white border-0 fade show"
                role="alert"
              >
                <strong>Error - </strong> {goods_status_msg}
              </div>
            </div>
          ) : (
            <>
              <div className="row g-2">
                <div className="col-11">
                  <div className="mb-3 py-2">
                    <div className="h3 text-white fw-bold mb-0">{option_item.product_name}</div>
                    <small className="eng text-secondary font-16">
                      ({option_item.product_name_en})
                    </small>
                  </div>
                </div>
                <div className="col-1"></div>
              </div>

              <div
                className="d-grid justify-content-between"
                style={{ gridTemplateColumns: "812px 460px" }}
              >
                {/* content-left */}
                <div className="content-left">
                  {media_list.length > 0 && <MediaGallery mediaList={media_list} />}

                  <div className="card mb-3 rounded-0 bg-card border-0">
                    <div className="row g-0">
                      <div className="col-3">
                        <img
                          src={`${option_item.domain}/upload/product/${option_item.product_code}/header/header.jpg`}
                          className="img-fluid rounded-0 h-100"
                          alt={option_item.product_name}
                        />
                      </div>
                      <div className="col-9">
                        <div className="card-header p-1">
                          <div className="d-flex flex-row justify-content-between align-items-center">
                            <h5 className="font-14 ms-3 py-1">{option_item.product_name}</h5>
                          </div>
                        </div>
                        <div className="card-body p-2 border-0 border-bottom">
                          {promo.sale_price > 0 ? (
                            <div className="d-flex flex-row g-0 justify-content-between">
                              <div className="ps-2">
                                <span className="text-primary font-14">
                                  프로모션 종료일: {promo.promotion_end}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div>&nbsp;</div>
                          )}
                        </div>
                        <div className="card-footer p-0 border-0 px-2 py-0">
                          <div className="d-flex flex-row align-items-center justify-content-between">
                            <div className="px-2 py-2">
                              <div className="d-flex flew-row align-items-center">
                                {promo.discount_rate > 0 ? (
                                  <span className="badge bg-danger font-14 px-3 py-2 num me-3 minus">
                                    {promo.discount_rate} %
                                  </span>
                                ) : (
                                  option_item.discount > 0 && (
                                    <span className="badge bg-primary font-12 px-3 py-2 num me-3 minus">
                                      {option_item.discount} %
                                    </span>
                                  )
                                )}
                                {hasDiscount && (
                                  <s className="font-11 num me-2 won">
                                    {" "}
                                    {formatWon(option_item.consumer_price)}
                                  </s>
                                )}
                                {promo.sale_price > 0 ? (
                                  <strong className="font-14 num fw-bold text-white won">
                                    {" "}
                                    {formatWon(promo.sale_price)}
                                  </strong>
                                ) : (
                                  <strong className="font-14 num fw-bold won">
                                    {" "}
                                    {formatWon(option_item.price)}
                                  </strong>
                                )}
                              </div>
                            </div>
                            <div className="px-1">
                              <div className="d-grid gap-1 d-flex justify-content-end">
                                <WishlistButton
                                  goodsSku={option_item.goods_sku}
                                  wishlistChk={option_item.wishlist_chk}
                                  className="btn btn-sm shadow-none font-14 fw-bold btn_wishlist"
                                />
                                <CartButton
                                  goodsSku={option_item.goods_sku}
                                  soldout={option_item.soldout}
                                  className="btn btn-sm shadow-none font-14 fw-bold btn_cart text-nowrap"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row row-cols-1 g-0">
                    <div className="col-12">
                      <div
                        className="alert alert-light text-warning border-0 fw-400 font-14 px-3 rounded-0"
                        role="alert"
                      >
                        <p className="mb-2">
                          ※ 해당 상품은 실물로 배송되는 상품이 포함되거나, 단품으로 배송되는
                          상품입니다.
                        </p>
                        <p className="mb-2">
                          ※ 실물로 배송되는 상품이 포함되거나, 단품으로 배송되는 상품들은 적립금이
                          지급되지 않습니다. (주문결제 시 사용은 가능)
                        </p>
                        <p className="mb-2">※ 이미지는 실제와 다소 차이가 있을 수 있습니다.</p>
                        <p className="mb-2">
                          ※ 영업일 오후 2시(금요일은 오전 11시 30분) 이전 결제 완료 건은 당일
                          발송되며, 이후 주문은 익일(주말 및 공휴일 제외) 발송됩니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <section id="goods_description" className="mb-4">
                    <div className="card shadow-none rounded-0 border-0">
                      <div className="card-header text-white font-16 fw-bold bg-card py-3 border-0">
                        상품설명
                      </div>
                      <div className="card-body p-0 overflow-auto">
                        <div
                          id="description_html"
                          dangerouslySetInnerHTML={{ __html: description_html }}
                        />
                      </div>
                    </div>
                  </section>

                  <section id="trade_terms" className="mb-4">
                    <div className="card shadow-none rounded-0 border-0">
                      <div className="card-header text-white font-16 fw-bold bg-card py-3 border-0">
                        거래조건에 관한 정보
                      </div>
                      <div className="p-2">
                        <table className="table table-bordered mb-0">
                          <colgroup>
                            <col width="310" />
                            <col width="*" />
                          </colgroup>
                          <tbody className="font-14">
                            <tr>
                              <th className="text-white text-opacity-75">
                                재화 등의 배송방법에 관한 정보
                              </th>
                              <td>{attribute_info.delivery_method_info}</td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">
                                주문 이후 예상되는 배송기간
                              </th>
                              <td>
                                대금지급일(결제완료일)로부터 3영업일 이내에 발송,
                                <br />
                                (단, 예약 판매 상품이 포함된 경우 별도의 공지를 통해 안내)
                              </td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">
                                제품하자·오배송 등에 따른 청약철회 등의 경우 청약철회 등의 기한 및
                                통신판매업자가 부담하는 반품비용 등에 관한 정보
                              </th>
                              <td>
                                전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 제품의 하자
                                또는 오배송 등으로 인한 청약철회의 경우에는 상품 수령 후 3개월 이내,
                                그 사실을 안 날 또는 알 수 있었던 날로부터 30일 이내에 청약철회를 할
                                수 있으며, 반품 비용은 통신판매업자가 부담합니다.
                              </td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">
                                제품하자가 아닌 소비자의 단순변심에 따른 청약철회 시 소비자가
                                부담하는 반품비용 등에 관한 정보
                              </th>
                              <td>
                                단순변심에 따른 청약철회 시 재화의 반환에 필요한 비용은 소비자가
                                부담합니다.
                                <br />
                                (전자상거래 등에서의 소비자보호에 관한 법률 제18조 제9항)
                              </td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">
                                제품하자가 아닌 소비자의 단순변심에 따른 청약철회가 불가능한 경우 그
                                구체적 사유와 근거
                              </th>
                              <td>
                                전자상거래 등에서의 소비자보호에 관한 법률 등에 의한 청약철회 제한
                                사유에 해당하는 경우 및 기타 객관적으로 이에 준하는 것으로 인정되는
                                경우 청약철회가 제한될 수 있습니다.
                              </td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">
                                재화 등의 교환·반품·보증 조건 및 품질보증기준
                              </th>
                              <td>
                                소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.
                              </td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">
                                재화 등의 A/S 관련 전화번호
                              </th>
                              <td>{attribute_info.as_information2}</td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">
                                대금을 환불받기 위한 방법과 환불이 지연될 경우 지연배상금을 지급받을
                                수 있다는 지연배상금 지급의 구체적인 조건·절차
                              </th>
                              <td>
                                주문취소 및 대금의 환불은 [마이페이지 &gt; 주문내역] 메뉴에서 신청할
                                수 있으며, 전자상거래 등에서의 소비자보호에 관한 법률에 따라
                                소비자의 청약철회 후 판매자가 재화 등을 반환 받은 날로부터 3영업일
                                이내에 지급받은 대금의 환급을 정당한 사유 없이 지연하는 때에는
                                소비자는 지연기간에 대해서 연 15%의 지연배상금을 판매자에게 청구할
                                수 있습니다.
                              </td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75 ">
                                소비자피해보상의 처리, 재화 등에 대한 불만 처리 및 소비자와 사업자
                                사이의 분쟁처리에 관한 사항
                              </th>
                              <td>
                                소비자분쟁해결기준(공정거래위원회 고시) 및 관계법령에 따릅니다.
                              </td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75 ">
                                거래에 관한 약관의 내용 또는 확인할 수 있는 방법
                              </th>
                              <td>
                                홈페이지 하단에 이용약관 및 개인정보처리방침 링크에서 확인할 수
                                있습니다.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>

                  <section id="legal_notice" className="mb-4">
                    <div className="card shadow-none rounded-0 border-0">
                      <div className="card-header text-white font-16 fw-bold bg-card py-3 border-0">
                        교환/반품 정보
                      </div>
                      <div className="p-2">
                        <table className="table table-bordered mb-0">
                          <colgroup>
                            <col width="180" />
                            <col width="*" />
                          </colgroup>
                          <tbody className="font-14">
                            <tr>
                              <th className="text-white text-opacity-75">교환/반품 비용</th>
                              <td>배송비 편도 3,000원 (최초 배송비 무료인 경우 6,000원 부과)</td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">교환/반품 주소지</th>
                              <td>
                                [07583] 서울특별시 강서구 강서로56가길 35(등촌동,
                                에이치투아이앤티빌딩) 5층 (주)에이치투인터렉티브
                              </td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">교환/반품 연락처</th>
                              <td>1544-2367</td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">교환/반품 가능기간</th>
                              <td>
                                <ul style={{ paddingInlineStart: 20 }}>
                                  <li>
                                    단순변심: 상품 수령일로부터 7일 이내 (배송비: 구매자 부담)
                                    <br />
                                    (단, 제품 코드(키) 상품이 포함된 경우는 디지털 상품 환불정책에
                                    따라 구입일로부터 7일)
                                  </li>
                                  <li>
                                    제품의 하자 또는 오배송: 상품 수령일로부터 3개월 이내, 그 사실을
                                    안 날 또는 알 수 있었던 날로부터 30일 이내 (배송비: 판매자 부담)
                                  </li>
                                </ul>
                              </td>
                            </tr>
                            <tr>
                              <th className="text-white text-opacity-75">교환/반품 불가기준</th>
                              <td>
                                <ul style={{ paddingInlineStart: 20 }}>
                                  <li>교환/반품 가능기간이 경과된 경우</li>
                                  <li>구매자 귀책으로 상품 등이 멸실 또는 훼손된 경우</li>
                                  <li>
                                    포장을 개봉하였거나, 포장이 훼손되어 상품 등의 가치가 현저히
                                    상실된 경우(단, 상품 내용 확인을 위해 포장 등을 훼손한 경우는
                                    제외)
                                  </li>
                                  <li>
                                    구매자의 사용 또는 일부 소비에 의하여 상품 등의 가치가 현저히
                                    감소한 경우
                                  </li>
                                  <li>
                                    시간의 경과에 의해 재판매가 곤란할 정도로 상품 등의 가치가
                                    현저히 감소한 경우
                                  </li>
                                </ul>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                </div>

                {/* content-right */}
                <div className="content-right">
                  {show_game_info === "Y" && steam_game_info && (
                    <section id="game_info" className="mb-4">
                      <div className="card shadow-none rounded-0 border-0">
                        <div className="card-header text-white fw-500 font-16 bg-card border-0">
                          관련상품 게임정보
                        </div>
                        <div className="card-body px-3">
                          <dl className="row g-2 mb-0">
                            <dt className="col-sm-3 font-14">게임명</dt>
                            <dd className="col-sm-9 font-14">{steam_game_info.game_name}</dd>
                            <dt className="col-sm-3 font-14">출시일</dt>
                            <dd className="col-sm-9">
                              <span className="num font-14">{steam_game_info.release_date}</span>
                            </dd>
                            <dt className="col-sm-3 font-14">개발사</dt>
                            <dd className="col-sm-9">
                              <span className="eng font-14">{steam_game_info.developer}</span>
                            </dd>
                            <dt className="col-sm-3 font-14">퍼블리셔</dt>
                            <dd className="col-sm-9">
                              <span className="eng font-14">{steam_game_info.publisher}</span>
                            </dd>

                            {(title_info.spoken_korean === "Y" ||
                              title_info.interface_korean === "Y") && (
                              <>
                                <dt className="col-sm-3 font-14">한국어지원</dt>
                                <dd className="col-sm-9">
                                  <div className="d-flex flex-row flex-wrap align-items-start">
                                    {title_info.spoken_korean === "Y" && (
                                      <div className="me-2">
                                        <span className="badge bg-label font-12 fw-400 px-2">
                                          음성 한국어
                                        </span>
                                      </div>
                                    )}
                                    {title_info.interface_korean === "Y" && (
                                      <div className="">
                                        <span className="badge bg-label font-12 fw-400 px-2">
                                          인터페이스/자막 한글
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </dd>
                              </>
                            )}
                            <dt className="col-sm-3 font-14">장르</dt>
                            <dd className="col-sm-9">
                              <div className="d-flex flex-row flex-wrap mb-2">
                                {steam_game_info.genres.map((g, i) => (
                                  <div className="me-2" key={i}>
                                    <span className="badge bg-label font-12 fw-400 px-2">{g}</span>
                                  </div>
                                ))}
                              </div>
                            </dd>
                            <dt className="col-sm-3 font-14">카테고리</dt>
                            <dd className="col-sm-9">
                              <div className="d-flex flex-row flex-wrap align-content-around">
                                {steam_game_info.categories.map((c, i) => (
                                  <div className="me-2 mb-3" key={i}>
                                    <span className="badge bg-label font-12 fw-400 px-2">{c}</span>
                                  </div>
                                ))}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="card shadow-none my-4 rounded-0 border-0 bg-none">
                        <div className="d-flex flex-row flex-wrap mb-2">
                          {ageImg && <img src={ageImg} className="me-2" />}
                          {gradeImgs.map((src, i) => (
                            <img src={src} className="me-2" key={i} />
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  <section id="goods_legal_info" className="mb-4">
                    <div className="card shadow-none rounded-0 border-0">
                      <div className="card-header text-white fw-500 font-16 bg-card border-0">
                        상품 정보 제공 고시
                        <br />
                        <small className="font-12 fw-300">
                          [전자상거래에 관한 상품정보 제공에 관한 고시] 항목에 의거 등록된
                          정보입니다.
                        </small>
                      </div>
                      <ul className="list-group py-2 font-14">
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2 ">품명</span>{" "}
                          {attribute_info.product_name}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2 ">모델명</span>{" "}
                          {attribute_info.model_name}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2 ">KC 인증정보</span>{" "}
                          <a
                            href={`https://www.rra.go.kr/ko/license/A_b_popup_keyno.do?key_no=${attribute_info.kc_safety_infomartion}`}
                            target="_blank"
                          >
                            {attribute_info.kc_safety_infomartion}
                          </a>
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2 ">정격전압</span>{" "}
                          {attribute_info.rated_voltage}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2 ">소비전력</span>{" "}
                          {attribute_info.power}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2 ">
                            동일모델의 출시년월
                          </span>{" "}
                          {attribute_info.manufacturing_date}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2 ">제조자 및 수입자</span>
                          {attribute_info.manufacturer}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2 ">제조국</span>{" "}
                          {attribute_info.manufacture_country}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2 ">크기(mm)</span>{" "}
                          {attribute_info.size}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2 ">무게(kg)</span>{" "}
                          {attribute_info.weight}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2">주요사양</span>{" "}
                          {attribute_info.main_requirements}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2">품질보증기준</span>{" "}
                          <br />
                          {attribute_info.warranty_service}
                        </li>
                        <li className="list-group-item border-0 bg-transparent py-2">
                          <span className="text-white text-opacity-50 pe-2">
                            A/S 책임자(전화번호)
                          </span>{" "}
                          {attribute_info.as_information}
                        </li>
                      </ul>
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <CartWishlistModals />
    </>
  );
}
