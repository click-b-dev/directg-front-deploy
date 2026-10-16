import { TopButton } from "./top-button";

/**
 * 스토어프론트 공통 푸터. legacy `pc/inc/footer.html` (순수 정적) + TOP 버튼.
 */
export function SiteFooter() {
  return (
    <>
      <TopButton />
      <div id="top"></div>
      {/* Footer시작 */}
      <div className="container-fluid px-0">
        <footer className="footer dg-renewal-footer py-5 mt-auto bg-card">
          <div className="container">
            <div className="d-flex justify-content-between align-items-end footer-wrapper">
              <div className="col-12 col-lg-5 footer-left px-0">
                <div className="d-flex justify-content-between align-items-start footer-info-1">
                  <div className="d-flex footer-qna-links">
                    <a
                      href="/mypage/mypage_qna_register"
                      className="text-decoration-none font-16 fw-semibold"
                    >
                      문의하기
                      <svg
                        width="6"
                        height="12"
                        viewBox="0 0 6 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.76144 6.66656L1.15212 12L0 10.6669L4.03325 6L0 1.33312L1.15212 0L5.76144 5.33344C5.91419 5.51024 6 5.75 6 6C6 6.25 5.91419 6.48976 5.76144 6.66656Z"
                          fill="white"
                        />
                      </svg>
                    </a>
                    <a href="/board/faq" className="text-decoration-none font-16 fw-semibold">
                      자주묻는질문 FAQ
                      <svg
                        width="6"
                        height="12"
                        viewBox="0 0 6 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.76144 6.66656L1.15212 12L0 10.6669L4.03325 6L0 1.33312L1.15212 0L5.76144 5.33344C5.91419 5.51024 6 5.75 6 6C6 6.25 5.91419 6.48976 5.76144 6.66656Z"
                          fill="white"
                        />
                      </svg>
                    </a>
                  </div>
                  <div className="d-flex footer-sns-links">
                    <a
                      href="https://www.youtube.com/user/H2Interactive"
                      target="_blank"
                      className="btn-social-custom"
                      title="에이치투 공식 유튜브채널"
                    >
                      <svg
                        width="31"
                        height="31"
                        viewBox="0 0 31 31"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="0.5" y="0.5" width="30" height="30" rx="4.5" stroke="#CED4DA" />
                        <path
                          d="M13.75 18.125L18.2912 15.5L13.75 12.875V18.125ZM23.865 11.2738C23.9787 11.685 24.0575 12.2362 24.11 12.9362C24.1712 13.6363 24.1975 14.24 24.1975 14.765L24.25 15.5C24.25 17.4163 24.11 18.825 23.865 19.7263C23.6462 20.5138 23.1387 21.0213 22.3512 21.24C21.94 21.3538 21.1875 21.4325 20.0325 21.485C18.895 21.5463 17.8537 21.5725 16.8912 21.5725L15.5 21.625C11.8337 21.625 9.55 21.485 8.64875 21.24C7.86125 21.0213 7.35375 20.5138 7.135 19.7263C7.02125 19.315 6.9425 18.7638 6.89 18.0638C6.82875 17.3638 6.8025 16.76 6.8025 16.235L6.75 15.5C6.75 13.5838 6.89 12.175 7.135 11.2738C7.35375 10.4863 7.86125 9.97875 8.64875 9.76C9.06 9.64625 9.8125 9.5675 10.9675 9.515C12.105 9.45375 13.1462 9.4275 14.1087 9.4275L15.5 9.375C19.1662 9.375 21.45 9.515 22.3512 9.76C23.1387 9.97875 23.6462 10.4863 23.865 11.2738Z"
                          fill="#CED4DA"
                        />
                      </svg>
                    </a>
                    <a
                      href="https://www.facebook.com/h2inter/"
                      target="_blank"
                      className="btn-social-custom"
                      title="에이치투 공식 페이스북"
                    >
                      <svg
                        width="31"
                        height="31"
                        viewBox="0 0 31 31"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="0.5" y="0.5" width="30" height="30" rx="4.5" stroke="#CED4DA" />
                        <path
                          d="M16.25 16.8125H18.4375L19.3125 13.3125H16.25V11.5625C16.25 10.6612 16.25 9.8125 18 9.8125H19.3125V6.8725C19.0273 6.83488 17.9501 6.75 16.8126 6.75C14.437 6.75 12.75 8.19987 12.75 10.8625V13.3125H10.125V16.8125H12.75V24.25H16.25V16.8125Z"
                          fill="#CED4DA"
                        />
                      </svg>
                    </a>
                    <a
                      href="https://pf.kakao.com/_xorcuK"
                      target="_blank"
                      className="btn btn-social-custom"
                      title="다이렉트 게임즈 공식 카카오채널"
                    >
                      <svg
                        width="31"
                        height="31"
                        viewBox="0 0 31 31"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="0.5" y="0.5" width="30" height="30" rx="4.5" stroke="#CED4DA" />
                        <g clipPath="url(#clip0_7369_40431)">
                          <g clipPath="url(#clip1_7369_40431)">
                            <path
                              d="M15.8236 7.5L16.2281 7.52833C19.9791 7.78963 23.4799 10.8197 23.5271 14.7187C23.5271 14.7423 23.5177 14.7801 23.5413 14.7943V15.0823C23.5192 15.0965 23.5271 15.1343 23.5271 15.1579C23.5051 17.2514 22.4048 19.2269 20.8055 20.5255C18.8946 22.0775 16.2769 22.6961 13.8591 22.2003L10.7378 24.5016H10.6559C10.5678 24.4654 10.5064 24.415 10.4906 24.3174V20.7411C9.61229 20.0721 8.77331 19.3087 8.2397 18.3281C7.7722 17.4686 7.55183 16.5179 7.48729 15.5435L7.46053 15.0981C7.46368 14.9973 7.45581 14.8966 7.46053 14.7958C7.64313 10.6167 11.1234 7.65898 15.1924 7.5H15.8236ZM15.6457 14.2732C15.4348 13.0407 14.5108 12.1152 13.2657 11.9452C11.1502 11.654 9.4785 13.376 9.83581 15.4853C10.1239 17.1758 11.7216 18.1817 13.3869 17.8889C14.5675 17.6811 15.4175 16.7823 15.6457 15.6175H14.4809C14.1173 16.8988 12.4692 17.1853 11.5264 16.3306C10.5835 15.4758 10.7692 13.727 11.9671 13.1934C12.8266 12.8094 13.9788 13.0612 14.3865 13.9631C14.4321 14.0639 14.4589 14.1709 14.5014 14.2732H15.6457ZM17.6873 11.9279H16.6311V17.8228H17.6873V15.553C17.6999 14.9485 18.0304 14.5219 18.6679 14.5581C19.1685 14.5865 19.4188 14.9328 19.4282 15.4144V17.8212H20.4828V15.0587C20.4403 13.8892 19.1827 13.206 18.1516 13.7286C17.958 13.8262 17.8242 13.971 17.6857 14.1331V11.9263L17.6873 11.9279Z"
                              fill="#CED4DA"
                            />
                          </g>
                        </g>
                        <defs>
                          <clipPath id="clip0_7369_40431">
                            <rect
                              width="21"
                              height="21"
                              fill="white"
                              transform="translate(5.03516 5)"
                            />
                          </clipPath>
                          <clipPath id="clip1_7369_40431">
                            <rect
                              width="17"
                              height="17"
                              fill="white"
                              transform="translate(7 7.5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/direct.games.kr"
                      target="_blank"
                      className="btn btn-social-custom"
                      title="다이렉트 게임즈 공식 인스타그램"
                    >
                      <svg
                        width="31"
                        height="31"
                        viewBox="0 0 31 31"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="0.5" y="0.5" width="30" height="30" rx="4.5" stroke="#CED4DA" />
                        <path
                          d="M11.825 6.75H19.175C21.975 6.75 24.25 9.025 24.25 11.825V19.175C24.25 20.521 23.7153 21.8118 22.7636 22.7636C21.8118 23.7153 20.521 24.25 19.175 24.25H11.825C9.025 24.25 6.75 21.975 6.75 19.175V11.825C6.75 10.479 7.28469 9.18818 8.23643 8.23643C9.18818 7.28469 10.479 6.75 11.825 6.75ZM11.65 8.5C10.8146 8.5 10.0134 8.83187 9.42261 9.42261C8.83187 10.0134 8.5 10.8146 8.5 11.65V19.35C8.5 21.0912 9.90875 22.5 11.65 22.5H19.35C20.1854 22.5 20.9866 22.1681 21.5774 21.5774C22.1681 20.9866 22.5 20.1854 22.5 19.35V11.65C22.5 9.90875 21.0912 8.5 19.35 8.5H11.65ZM20.0937 9.8125C20.3838 9.8125 20.662 9.92773 20.8671 10.1329C21.0723 10.338 21.1875 10.6162 21.1875 10.9062C21.1875 11.1963 21.0723 11.4745 20.8671 11.6796C20.662 11.8848 20.3838 12 20.0937 12C19.8037 12 19.5255 11.8848 19.3203 11.6796C19.1152 11.4745 19 11.1963 19 10.9062C19 10.6162 19.1152 10.338 19.3203 10.1329C19.5255 9.92773 19.8037 9.8125 20.0937 9.8125ZM15.5 11.125C16.6603 11.125 17.7731 11.5859 18.5936 12.4064C19.4141 13.2269 19.875 14.3397 19.875 15.5C19.875 16.6603 19.4141 17.7731 18.5936 18.5936C17.7731 19.4141 16.6603 19.875 15.5 19.875C14.3397 19.875 13.2269 19.4141 12.4064 18.5936C11.5859 17.7731 11.125 16.6603 11.125 15.5C11.125 14.3397 11.5859 13.2269 12.4064 12.4064C13.2269 11.5859 14.3397 11.125 15.5 11.125ZM15.5 12.875C14.8038 12.875 14.1361 13.1516 13.6438 13.6438C13.1516 14.1361 12.875 14.8038 12.875 15.5C12.875 16.1962 13.1516 16.8639 13.6438 17.3562C14.1361 17.8484 14.8038 18.125 15.5 18.125C16.1962 18.125 16.8639 17.8484 17.3562 17.3562C17.8484 16.8639 18.125 16.1962 18.125 15.5C18.125 14.8038 17.8484 14.1361 17.3562 13.6438C16.8639 13.1516 16.1962 12.875 15.5 12.875Z"
                          fill="#CED4DA"
                        />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="footer-info-2">
                  <span className="font-13 fw-medium mb-0">고객센터: 1544-2367</span>
                  <span className="font-13 fw-medium mb-0">전자우편: directg@h2int.com</span>
                  <span className="font-13 fw-medium mb-0">
                    운영시간: 월~목 10:00~17:00 (점심시간 12:30~14:00 제외) / 금 10:00~12:00
                  </span>
                  <span className="font-13 fw-medium mb-0">(토, 일, 공휴일 휴무)</span>
                </div>
              </div>

              <div className="footer-divider"></div>

              <div className="col-12 col-lg-7 footer-right">
                <div className="d-flex flex-wrap footer-banner-container">
                  <a
                    href="http://www.h2int.com"
                    target="_blank"
                    className="btn-banner btn-cable-dark text-decoration-none"
                  >
                    <span className="banner-circle">
                      <img
                        src="/assets/images/logo/H2_logo_33x33.svg"
                        alt=""
                        className="banner-logo-img"
                      />
                    </span>
                    <span className="banner-text txt-h2">H2 Interactive</span>
                  </a>
                  <a
                    href="https://h2mall.net"
                    target="_blank"
                    className="btn-banner btn-cable-dark text-decoration-none banner-mall-width"
                  >
                    <span className="banner-circle" style={{ backgroundColor: "#18B8FF" }}>
                      <img
                        src="/assets/images/logo/H2mall_logo_21x31_2.svg"
                        alt=""
                        className="banner-logo-img"
                      />
                    </span>
                    <span className="banner-text txt-mall">H2mall</span>
                  </a>
                  <a
                    href="https://smartstore.naver.com/cableguys"
                    target="_blank"
                    className="btn-banner btn-cable-dark text-decoration-none"
                  >
                    <span className="banner-circle">
                      <img
                        src="/assets/images/logo/CableGuys_logo_31x33.svg"
                        alt=""
                        className="banner-logo-img"
                      />
                    </span>
                    <span className="banner-text txt-cable">Cable Guys</span>
                  </a>
                </div>

                <ul className="nav flex-wrap align-items-center small footer-bottom-links">
                  <a href="/service/private" className="nav-link text-primary">
                    개인정보처리방침
                  </a>
                  <a href="/service/agreement" className="nav-link">
                    이용약관
                  </a>
                  <a href="/service/youthpolicy" className=" nav-link">
                    청소년보호정책
                  </a>
                  <a href="/service/refund_policy" className="nav-link">
                    환불정책
                  </a>
                  <a
                    href="http://www.h2int.com/about/about.html"
                    className="nav-link"
                    target="_blank"
                  >
                    회사소개
                  </a>
                  <a
                    href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=2068635756"
                    className="nav-link"
                    target="_blank"
                  >
                    사업자정보확인
                  </a>
                </ul>

                <div className="font-11 footer-company-info">
                  <p className="mb-0">
                    (주)에이치투인터렉티브 | 서울시 강서구 강서로56가길 35 에이치투 아이앤티 빌딩 |
                    사업자등록번호: 206-86-35756 | 통신판매업신고: 2013-서울강서-0758
                  </p>
                  <p className="mb-0">
                    대표이사: 허준하 | 개인정보관리책임자: 김지훈 | 호스팅 제공자: 카페24(주) |
                    다이렉트 게임즈는{" "}
                    <span style={{ letterSpacing: "-0.4px" }}>
                      (주)에이치투인터렉티브에서 운영하는 공식 디지털 스토어입니다.
                    </span>
                  </p>
                  <p className="mb-0">© H2 Interactive Co., Ltd. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      {/* Footer종료 */}
    </>
  );
}
