import { PublisherPartners } from "./publisher-partners";

/**
 * 다이렉트 게임즈 소개 (legacy `pc/service/service.html`).
 * 마스트헤드 히어로 + 서비스 약속(progressbar) + 회원 혜택 카드 6종 + 퍼블리셔 파트너 그리드.
 * 페이지 전용 CSS(`service-inline.css`)·Do Hyeon 폰트 로드. 퍼블리셔 hover만 CSR(PublisherPartners).
 * 최상위는 `container` 아님 — legacy `my-3 pb-5` > main, 내부에 각자 `.container`.
 */
export function ServiceIntroScreen() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap"
      />
      <link rel="stylesheet" href="/assets/css/page/service-inline.css" />
      <div className="my-3 pb-5">
        <main>
          <div className="wrap t3-masthead">
            <div className="ja-masthead">
              <div
                id="ja-masthead-bg"
                style={{
                  backgroundImage:
                    "url('/assets/images/service/DG_Introbr_pc_object0_1920x400.jpg')",
                }}
              ></div>
              <div className="container pt-5">
                <div className="ja-masthead-detail">
                  <div className="bg_tag">
                    <span className="tag_color">#상시할인</span>
                    <span className="tag_color">#정기프로모션</span>
                    <span className="tag_color">#실시간코드확인</span>
                    <span className="tag_color">#정식라이센스</span>
                  </div>
                  <h3 className="ja-masthead-title">
                    실시간 엔터테인먼트 플랫폼 <br /> 다이렉트 게임즈에 오신 것을 환영합니다!
                  </h3>
                  <div className="ja-masthead-description">
                    <div className="bg_bottom">
                      <img src="/assets/images/service/00-00_h2intlogo_v2.png" alt="" />
                      <p>
                        다이렉트 게임즈는 <br />
                        에이치투 인터렉티브에서 운영하는 <br />
                        공식 디지털 스토어입니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="t3-mainbody" className="wrap t3-mainbody" style={{ minHeight: "620px" }}>
            <div className="container">
              <div className="row">
                {/* MAIN CONTENT */}
                <div id="t3-content" className="t3-content col-md-12" style={{ paddingTop: "0px" }}>
                  <div className="section">
                    <h3>보다 믿을 수 있는 서비스 제공을 약속합니다</h3>
                    <div className="section_content">
                      <div style={{ marginBottom: "40px" }}>
                        <span className="label1">
                          <span className="label_color">NO!</span> 해외상품 우회등록
                        </span>
                        <span className="label1">
                          <span className="label_color">NO!</span> 아이디/패스워드 노출
                        </span>
                        <span className="label1">
                          <span className="label_color">NO!</span> 스토어/플랫폼 계정 차단
                        </span>
                      </div>
                      <div className="progressbar-wrapper">
                        <ul className="progressbar">
                          <li>
                            <img src="/assets/images/service/01-00_publisher.png?3" alt="" />
                          </li>
                          <li className="active">
                            <img src="/assets/images/service/01-01_dglogo_v2.png?3" alt="" />
                          </li>
                          <li>
                            <img src="/assets/images/service/01-02_member.png?3" alt="" />
                          </li>
                        </ul>
                      </div>
                      <p className="font18">
                        다이렉트 게임즈는 세계 유수의 개발사 및 퍼블리셔와 직접 제휴하여
                      </p>
                      <p className="font18">
                        자체 유통 마진은 최소화하면서도 양질의 상품들을 좀 더 합리적인 가치로써
                        제공하고 있습니다.{" "}
                      </p>
                      <p className="font18">
                        또한, 회원분들의 다양한 피드백을 전달하여 직접적인 상호작용과 원활한 소통을
                        이어가고 있습니다.
                      </p>
                    </div>
                  </div>
                  <div className="section">
                    <h3>다이렉트 게임즈 회원만의 혜택이 기다립니다</h3>
                    <div className="section_content">
                      <div className="section_container">
                        <div className="section_item">
                          <div>
                            <h4>정식 라이센스 계약</h4>
                            <img src="/assets/images/service/02-00_license.png" alt="" />
                            <p style={{ fontSize: "16px", padding: "4px" }}>
                              다이렉트 게임즈는 모든 상품이 개발사 및 퍼블리셔와의 정식 계약을 통해
                              판매 중인 공식 판매처입니다.
                            </p>
                          </div>
                          <div className="section_tail">
                            <a href="/game/game_list" className="btn_link" target="_blank">
                              모든 게임 보러가기
                            </a>
                          </div>
                        </div>
                        <div className="section_item">
                          <div>
                            <h4>프로모션과 이벤트</h4>
                            <img src="/assets/images/service/02-01_promotion.png" alt="" />
                            <p style={{ fontSize: "16px", padding: "4px" }}>
                              상시 할인, 정기 주말 특가, 수많은 퍼블리셔가 참여하는 대규모
                              프로모션과 랜덤 박스, 리워드 등 다양한 이벤트가 준비되어 있습니다.
                            </p>
                          </div>
                          <div className="section_tail">
                            <a href="/promotion/promotion_ing" className="btn_link" target="_blank">
                              진행 중인 프로모션 확인하기
                            </a>
                          </div>
                        </div>
                        <div className="section_item">
                          <div>
                            <h4>편리한 로그인</h4>
                            <img src="/assets/images/service/02-02_login.png" alt="" />
                            <p style={{ fontSize: "16px", padding: "4px" }}>
                              이메일 주소 인증만으로 쉽고 빠른 회원가입과 네이버, 카카오 계정 간편
                              로그인 지원으로 편의를 더합니다.
                            </p>
                          </div>
                          <div className="section_tail">
                            <a href="/member/join_step1" className="btn_link" target="_blank">
                              다이렉트 게임즈 회원가입
                            </a>
                          </div>
                        </div>
                        <div className="section_item">
                          <div>
                            <h4>원활한 소통</h4>
                            <img src="/assets/images/service/02-03_communication.png" alt="" />
                            <p style={{ fontSize: "16px", padding: "4px" }}>
                              고객센터 및 공식 소셜미디어 운영으로 회원분들의 문의와 요청에 적극적인
                              대응을 약속합니다.
                            </p>
                          </div>
                        </div>
                        <div className="section_item">
                          <div>
                            <h4>실시간 코드 발송</h4>
                            <img src="/assets/images/service/02-04_realtime.png" alt="" />
                            <p style={{ fontSize: "16px", padding: "4px" }}>
                              이메일, 문자를 기다릴 필요가 없습니다. PC 및 모바일에서 언제든지
                              구매한 제품 코드 확인이 가능합니다.
                            </p>
                          </div>
                        </div>
                        <div className="section_item">
                          <div>
                            <h4>다양한 결제 수단</h4>
                            <img src="/assets/images/service/02-05_payment.png" alt="" />
                            <p style={{ fontSize: "16px", padding: "4px" }}>
                              신용카드, 휴대폰결제, 계좌이체와 같은 기본결제는 물론 네이버페이,
                              페이코 등의 간편결제까지 선택의 폭이 넓습니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* legacy 주석처리된 "플랫폼별 이용방법" 섹션 — HTML 주석이라 미렌더 */}
                  <div className="section">
                    <h3>세계 유수의 파트너들이 함께합니다</h3>
                    <PublisherPartners />
                  </div>
                </div>
                {/* MAIN CONTENT */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
