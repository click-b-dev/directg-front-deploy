import { MobileSubHeader } from "@widgets/mobile-sub-header";

/**
 * 모바일 자료실 (legacy `mobile/board/dataroom.html`).
 * 실제 자료실이 아니라 **"PC 전용" 정적 안내 화면** — 데이터/목록/다운로드 없음(모바일은 PC로 유도).
 */
export function MobileDataroomScreen() {
  return (
    <>
      <MobileSubHeader pageTitle="자료실" />
      <div id="appCapsuleSub">
        <div className="pc-only-container">
          <div className="pc-only-card">
            <div className="icon-wrapper">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4H4C2.89543 4 2 4.89543 2 6V16C2 17.1046 2.89543 18 4 18H10V20H8V22H16V20H14V18H20C21.1046 18 22 17.1046 22 16V6C22 4.89543 21.1046 4 20 4ZM20 16H4V6H20V16Z"
                  fill="#6c757d"
                />
              </svg>
            </div>

            {/* legacy 주석: <h5 class="pc-only-title">PC 버전 전용 메뉴입니다</h5> — 미출력 */}
            <p className="pc-only-desc">자료실은 PC 환경에서만 지원됩니다.</p>

            <a href="/" className="btn btn-primary btn-home">
              메인으로 이동
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
