import { ServiceAside } from "@widgets/service-aside";

/**
 * 에픽 게임즈(EPIC GAMES) 이용안내 (legacy `pc/service/guide_epic.html`).
 * 전 구간 정적 SSR. 5개 탭 전환만 Bootstrap 탭 JS(전역 번들). 데이터 페칭 없음.
 * 이미지 src·곡선따옴표·클래스 변형·legacy 버그(tab5 target="blank", alt trailing space, 마커 ⑥ 누락)는 원문 유지.
 */
export function ServiceGuideEpicScreen() {
  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <ServiceAside active="guide_epic" />
        <section id="content" className="content rounded-0">
          <div className="main">
            <ul className="nav nav-tabs nav-bordered mb-3">
              <li className="nav-item">
                <a
                  href="#epic-b1"
                  data-bs-toggle="tab"
                  aria-expanded="true"
                  className="nav-link active"
                >
                  <i className="mdi mdi-account-circle d-md-none d-block"></i>
                  <span className="d-none d-md-block font-14">제품 키 확인 및 활성화</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#epic-b2" data-bs-toggle="tab" aria-expanded="true" className="nav-link">
                  <i className="mdi mdi-account-circle d-md-none d-block"></i>
                  <span className="d-none d-md-block font-14">가입 및 계정 만들기</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#epic-b3" data-bs-toggle="tab" aria-expanded="true" className="nav-link">
                  <i className="mdi mdi-account-circle d-md-none d-block"></i>
                  <span className="d-none d-md-block font-14">클라이언트 설치하기</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#epic-b4" data-bs-toggle="tab" aria-expanded="true" className="nav-link">
                  <i className="mdi mdi-account-circle d-md-none d-block"></i>
                  <span className="d-none d-md-block font-14">라이브러리 게임 등록 및 플레이</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#epic-b5" data-bs-toggle="tab" aria-expanded="true" className="nav-link">
                  <i className="mdi mdi-account-circle d-md-none d-block"></i>
                  <span className="d-none d-md-block font-14">등록 불가 상황 대처법</span>
                </a>
              </li>
            </ul>

            <div className="tab-content">
              <div className="tab-pane show active" id="epic-b1">
                <h4 className="my-4">구매한 제품 키 확인 및 활성화 안내</h4>
                <ol className="list-group list-group-numbered rounded-0">
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">상품 선택</div>
                      <p className="mb-2 text-muted font-14">
                        다이렉트 게임즈에서 원하는 상품을 선택하여 상세 페이지로 이동합니다.
                      </p>
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">주문하기</div>
                      <p className="mb-2 text-muted font-14">
                        구매하고자 하는 게임을 선택하신 후 `구매하기`를 클릭합니다.
                      </p>
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">결제하기</div>
                      <p className="mb-2 text-muted font-14">
                        `구매하기`를 클릭하여 안내에 따라 결제를 완료합니다.
                      </p>
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">주문완료</div>
                      <p className="mb-2 text-muted font-14">
                        게임 구매가 완료되었습니다! 구매하신 제품 코드(키)는 `마이페이지 &gt;
                        주문완료 내역`에서 확인 가능합니다.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
              <div className="tab-pane" id="epic-b2">
                <h4 className="my-4">에픽 게임즈(EPIC GAMES Store) 가입 및 계정 만들기</h4>
                <ol className="list-group list-group-numbered rounded-0">
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">가입 및 로그인</div>
                      <p className="text-muted mb-2 font-14">
                        에픽 게임즈(
                        <a href="https://www.epicgames.com/store/ko/" target="_blank">
                          https://www.epicgames.com/store/ko/
                        </a>
                        ) 접속 후 메인 페이지 우측 상단의 ‘로그인’을 선택합니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_A_01.jpg"
                        alt="가입 및 로그인"
                        title="가입 및 로그인"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">가입양식 입력</div>
                      <p className="text-muted mb-2 font-14">
                        에픽 게임즈에 이미 가입하신 고객님의 경우 팝업창 내에 계정정보를 입력하면
                        로그인이 가능합니다.
                        <br />
                        계정 생성을 원하는 고객님께서는 <span className="text-danger">①</span>
                        <span className="text-warning">‘가입’</span>을 선택한 후
                        <span className="text-danger"> ②</span>
                        <span className="text-warning">‘이메일로 가입’</span>을 선택하시길 바랍니다.
                        <br />
                        (※본 설명서는 ‘이메일로 가입’ 이외의 가입 절차는 안내하지 않으니 양해 부탁
                        드립니다.)
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_A_02.jpg"
                        alt="가입양식 입력"
                        title="가입양식 입력"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">가입양식 입력 및 이용약관과 동의서 확인</div>
                      <p className="text-muted mb-2 font-14">
                        <span className="text-danger">③</span>팝업창에 각각의 정보를 입력한 후{" "}
                        <span className="text-warning">‘이용약관에 동의하셔야 합니다’</span>를
                        선택합니다.
                        <br />
                        <span className="text-danger">④</span>팝업창에 나타나는 규약을 모두 확인하지
                        않을 경우 다음 단계로 진행할 수 없습니다. 특히{" "}
                        <span className="text-warning">‘이용 약관’</span>은 모든 내용을 확인하지
                        않을 경우 하단의 <span className="text-danger">⑤</span>
                        <span className="text-warning">‘동의합니다’</span> 버튼이 활성화되지 않으니
                        주의하시기 바랍니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_A_03.jpg"
                        alt="가입양식 입력 및 이용약관과 동의서 확인 "
                        title="가입양식 입력 및 이용약관과 동의서 확인 "
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">이용약관과 동의서 확인 완료</div>
                      <p className="text-muted mb-2 font-14">
                        각각의 체크 박스를 클릭한 후{" "}
                        <span className="text-warning">‘동의합니다’</span>를 선택합니다. 이전 상태의
                        <span className="text-danger"> ⑦</span>팝업창으로 돌아오게 되며, 정보 수신을
                        원하는 고객님께서는 체크 박스를 클릭한 후에{" "}
                        <span className="text-warning">‘계속’</span>을 선택합니다. 정보 수신을
                        원하지 않는 고객님께서는 체크 박스 클릭 없이{" "}
                        <span className="text-warning">‘계속’</span>을 선택합니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_A_04.jpg"
                        alt="이용약관과 동의서 확인 완료 "
                        title="이용약관과 동의서 확인 완료 "
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">인증용 보안 코드 입력</div>
                      <p className="text-muted mb-2 font-14">
                        <span className="text-danger">⑧</span>팝업창을 통해 인증용 보안 코드를
                        입력해야 합니다. <span className="text-danger">③</span>팝업창에서 고객님께서
                        입력한 이메일 주소에 에픽 게임즈로부터{" "}
                        <span className="text-danger">⑨</span>인증용 보안 코드가 포함되어 있는
                        이메일이 도착하였는지 확인을 바랍니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_A_05.jpg"
                        alt="인증용 보안 코드 입력"
                        title="인증용 보안 코드 입력"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">계정 생성 완료</div>
                      <p className="text-muted mb-2 font-14">
                        <span className="text-danger">⑩</span>팝업창에 인증용 보안 코드를 입력하신
                        후 <span className="text-warning">‘이메일 인증’</span>을 선택합니다. 이후
                        에픽 게임즈 메인 페이지로 화면이 자동 전환되며 이를 통해 에픽 게임즈 계정
                        생성은 끝이 납니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_A_06.jpg"
                        alt="계정 생성 완료"
                        title="계정 생성 완료"
                        className="mb-2"
                      />
                    </div>
                  </li>
                </ol>
              </div>
              <div className="tab-pane" id="epic-b3">
                <h4 className="my-4">에픽 게임즈(EPIC GAMES Store) 클라이언트 설치하기</h4>
                <ol className="list-group list-group-numbered rounded-0">
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">에픽 게임즈 메인 페이지</div>
                      <p className="text-muted mb-2 font-14">
                        에픽 게임즈(
                        <a href="https://www.epicgames.com/store/ko/" target="_blank">
                          https://www.epicgames.com/store/ko/
                        </a>
                        ) 메인 페이지 우측 상단의{" "}
                        <span className="text-warning">‘에픽게임즈 받기’</span>를 선택합니다. 이후
                        자동으로 클라이언트 설치 파일의 다운로드가 진행됩니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_B_01.jpg"
                        alt="에픽 게임즈  메인 페이지"
                        title="에픽 게임즈  메인 페이지"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">에픽 게임즈 클라이언트 설치 완료</div>
                      <p className="text-muted mb-2 font-14">
                        설치가 정상적으로 완료 되면 자동적으로 클라이언트가 실행되며 아래와 같은
                        화면이 표시됩니다. 이것으로 에픽 게임즈 클라이언트 설치는 끝이 납니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_B_02.jpg"
                        alt="에픽 게임즈 클라이언트 설치 완료"
                        title="에픽 게임즈 클라이언트 설치 완료"
                        className="mb-2"
                      />
                    </div>
                  </li>
                </ol>
              </div>
              <div className="tab-pane" id="epic-b4">
                <h4 className="my-4">라이브러리 게임 등록 및 플레이</h4>
                <ol className="list-group list-group-numbered rounded-0">
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">에픽 게임즈 클라이언트 메인 페이지</div>
                      <p className="text-muted mb-2 font-14">
                        에픽 게임즈 클라이언트를 실행해주시기 바랍니다. 로그인 후 화면 우측 상단의{" "}
                        <span className="text-warning">‘라이브러리 게임 등록 및 플레이’</span>{" "}
                        아이콘을 선택합니다. 이후 슬라이드 형식으로 표시되는 페이지에서{" "}
                        <span className="text-warning">‘코드 사용’</span>을 선택합니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_C_01.jpg"
                        alt="에픽 게임즈 클라이언트 메인 페이지"
                        title="에픽 게임즈 클라이언트 메인 페이지"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">에픽 게임즈 제품 코드 입력</div>
                      <p className="text-muted mb-2 font-14">
                        제품 등록 화면으로 페이지가 전환됩니다. 다이렉트 게임즈를 통해 고객님이
                        구매하신 에픽 게임즈 제품의 코드를 입력합니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_C_02.jpg"
                        alt="에픽 게임즈 제품 코드 입력"
                        title="에픽 게임즈 제품 코드 입력"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">에픽 게임즈 제품 코드 사용</div>
                      <p className="text-muted mb-2">
                        정상적으로 코드 입력을 완료하면 고객님이 구매하신 제품의 썸네일이 좌측에
                        표시됩니다. 이후 파란색 버튼의 <span className="text-warning">‘사용’</span>
                        을 선택합니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_C_03.jpg"
                        alt="에픽 게임즈 제품 코드 사용"
                        title="에픽 게임즈 제품 코드 사용"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">에픽 게임즈 제품 등록 완료</div>
                      <p className="text-muted mb-2 font-14">
                        <span className="text-warning">‘제품을 성공적으로 등록했습니다!’</span>라는
                        문장이 표시됩니다. 이로서 고객님이 구매하신 에픽 게임즈 제품의 등록이
                        정상적으로 완료 되었습니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_C_04.jpg"
                        alt="에픽 게임즈 제품 등록 완료"
                        title="에픽 게임즈 제품 등록 완료"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">에픽 게임즈 클라이언트 메인 화면</div>
                      <p className="text-muted mb-2 font-14">
                        에픽 게임즈 클라이언트 메인 페이지의 좌측 메뉴에서{" "}
                        <span className="text-warning">‘라이브러리’</span>를 선택합니다. 고객님의
                        PC에 해당 게임을 설치하는 과정을 거쳐야 합니다. 구매하신 게임을 마우스로
                        클릭하시기 바랍니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_C_05.jpg"
                        alt="에픽 게임즈 클라이언트 메인 화면"
                        title="에픽 게임즈 클라이언트 메인 화면"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">에픽 게임즈 최종 사용자 라이선스 계약</div>
                      <p className="text-muted mb-2 font-14">
                        최종 사용자 라이선스 계약 내용이 표시됩니다. 내용을 확인하고 체크 박스를
                        클릭하여 동의한 후 <span className="text-warning">‘수락’</span>을 선택하면
                        구매하신 게임의 다운로드 및 설치가 진행됩니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_C_06.jpg"
                        alt="에픽 게임즈 최종 사용자 라이선스 계약"
                        title="에픽 게임즈 최종 사용자 라이선스 계약"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">설치 완료 및 게임 플레이</div>
                      <p className="text-muted mb-2 font-14">
                        게임 설치가 정상적으로 완료되면, 라이브러리에서 구매하신 에픽 게임즈 게임을
                        언제든지 플레이할 수 있습니다. <br />
                        (※ 구매하신 게임 플레이에 성인 인증이 필요한 경우, 등록 불가 상황 대처법
                        페이지를 확인해주시길 바랍니다.)
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_C_07.jpg"
                        alt="설치 완료 및 게임 플레이"
                        title="설치 완료 및 게임 플레이"
                        className="mb-2"
                      />
                    </div>
                  </li>
                </ol>
              </div>
              <div className="tab-pane" id="epic-b5">
                <h4 className="my-4">본인(성인) 인증 및 홈페이지를 통한 제품 등록 안내</h4>
                <ol className="list-group list-group-numbered rounded-0">
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">본인(성인) 인증</div>
                      <p className="text-muted mb-2 font-14">
                        일부 에픽 게임즈 제품은 심의 규정으로 인해 본인(성인) 인증 후에 등록 및
                        플레이가 가능합니다. 본인 인증 페이지(
                        <a href="https://www.epicgames.com/realid/identity" target="blank">
                          https://www.epicgames.com/realid/identity
                        </a>
                        ) 에 접속하여 로그인합니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_D_01.jpg"
                        alt="본인(성인) 인증"
                        title="본인(성인) 인증"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">서비스 이용 본인확인</div>
                      <p className="text-muted mb-2 font-14">
                        개인정보 수집, 활용 동의서 내용을 확인하고 동의한 후 확인 버튼을 클릭합니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_D_02.jpg"
                        alt="서비스 이용 본인확인"
                        title="서비스 이용 본인확인"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">인증 방법 선택</div>
                      <p className="text-muted mb-2 font-14">
                        휴대폰 또는 아이핀 인증 방법 중에 선택하여 진행합니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_D_03.jpg"
                        alt="인증 방법 선택"
                        title="인증 방법 선택"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">본인 인증 완료</div>
                      <p className="text-muted mb-2 font-14">
                        일련의 과정을 거쳐 본인 인증 후 다시 로그인하여 제품 등록을 시도해주시길
                        바랍니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_D_04.jpg"
                        alt="본인 인증 완료"
                        title="본인 인증 완료"
                        className="mb-2"
                      />
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">홈페이지를 통한 제품 등록</div>
                      <p className="text-muted mb-2 font-14">
                        클라이언트에서 일시적으로 발생하는 오류일 수 있으며, 에픽 게임즈 홈페이지(
                        <a href="https://www.epicgames.com/account/code-redemption" target="_blank">
                          https://www.epicgames.com/account/code-redemption
                        </a>
                        )를 통해서도 등록이 가능합니다.
                        <br />
                        지속적인 문제가 발생할 경우, 문제 상황 스크린샷과 함께 다이렉트 게임즈
                        고객센터에 문의하여 주시면 확인 후 신속히 조치할 수 있도록 하겠습니다.
                      </p>
                      <img
                        src="https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_D_05.jpg"
                        alt="홈페이지를 통한 제품 등록"
                        title="홈페이지를 통한 제품 등록"
                        className="mb-2"
                      />
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
