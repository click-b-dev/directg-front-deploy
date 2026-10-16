import { ServiceAside } from "@widgets/service-aside";

/**
 * 이용가이드 — 구매방법 (legacy `pc/service/guide.html`).
 * 전 구간 정적 SSR. 데이터 페칭 없음. 단일 탭이라 인터랙션 없음(Bootstrap 탭 JS는 전역 번들).
 */
export function ServiceGuideScreen() {
  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <ServiceAside active="guide" />
        <section id="content" className="content rounded-0">
          <div className="main">
            <ul className="nav nav-tabs nav-bordered mb-0">
              <li className="nav-item">
                <a
                  href="#order-b1"
                  data-bs-toggle="tab"
                  aria-expanded="true"
                  className="nav-link active"
                >
                  <i className="mdi mdi-account-circle d-md-none d-block"></i>
                  <span className="d-none d-md-block font-14">구매방법</span>
                </a>
              </li>
            </ul>
            <div className="tab-content">
              <div className="tab-pane show active" id="order-b1">
                <h4 className="my-4">다이렉트 게임즈 구매방법</h4>
                <ol className="list-group list-group-numbered rounded-0">
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">상품 선택</div>
                      <p className="mb-2 text-muted font-14">
                        다이렉트 게임즈에서 원하는 상품을 선택하여 상세 페이지로 이동합니다.
                        <br /> (또는 <span className="text-warning">`장바구니`</span> 아이콘을
                        클릭하여 바로 장바구니에 담아 주문을 진행할 수 있습니다.)
                      </p>
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">장바구니 담기</div>
                      <p className="mb-2 text-muted font-14">
                        가격, 시스템 요구사항 등의 상품 정보와 유의사항을 확인하고,{" "}
                        <span className="text-warning">`장바구니 담기`</span> 버튼을 클릭하여 상품을
                        장바구니에 담습니다. 장바구니에 정상적으로 담겼으면, 알림 메시지를 확인할 수
                        있습니다.
                      </p>
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">주문하기</div>
                      <p className="mb-2 text-muted font-14">
                        주문하실 상품목록을 확인 후,{" "}
                        <span className="text-warning">`주문하기`</span> 버튼을 클릭하여 결제
                        페이지로 이동하여 주문정보를 확인 후,{" "}
                        <span className="text-warning">`결제하기`</span> 버튼을 클릭하여 다음 단계로
                        이동합니다. <br />
                        (기입하신 이메일주소로 주문내역서가 발송됩니다. 가급적 올바른 이메일주소를
                        기입해 주시기 바랍니다.)
                      </p>
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">결제하기</div>
                      <p className="mb-2 text-muted font-14">
                        상품명, 상품금액, 결제금액, 결제수단 등의 정보를 꼼꼼히 확인 후, 결제하기
                        버튼을 클릭해 결제를 완료합니다.
                      </p>
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">주문완료</div>
                      <p className="mb-2 text-muted font-14">
                        주문이 완료되었습니다!{" "}
                        <span className="text-warning">`주문내역 확인하기`</span>를 클릭하여 다음
                        담계로 이동합니다.
                        <br /> (주문하신 제품 코드(키)는{" "}
                        <span className="text-warning">
                          `마이페이지` → `주문완료 내역` → `주문내역 상세보기`
                        </span>
                        를 통해서도 확인이 가능합니다.)
                      </p>
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">제품 코드(키) 활성화 및 수취확인</div>
                      <p className="mb-2 text-muted font-14">
                        <span className="text-warning">`주문내역 상세보기`</span>에서{" "}
                        <span className="text-warning">`수취확인` </span>버튼을 클릭하고 주의사항과
                        환불정책을 확인합니다. 내용을 충분히 숙지하신 후,{" "}
                        <span className="text-warning">`코드 활성화`</span> 버튼을 클릭하여 제품
                        코드를 수취합니다.
                      </p>
                    </div>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="font-15 mb-2">제품 코드(키) 확인</div>
                      <p className="mb-2 text-muted font-14">
                        활성화가 성공적으로 완료되면,{" "}
                        <span className="text-warning">`코드확인`</span> 버튼을 클릭해서 언제든지
                        제품 코드(키)를 확인할 수 있습니다. 해당 제품 코드는 스팀, 에픽 게임즈 등 각
                        플랫폼에 등록하여 게임을 플레이하실 수 있습니다.
                      </p>
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
