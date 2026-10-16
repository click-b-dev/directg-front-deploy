/**
 * 청소년보호정책 (legacy `pc/service/youthpolicy.html`).
 * 완전 정적 SSR. aside/txt/세션 없음(0B `youthpolicy.txt`는 미참조 죽은 파일).
 * container에 `my-3 pb-5` 없음(legacy 예외) · `main.mb-5`. 도입문 오타 "대해세는" 원문 보존.
 */
export function ServiceYouthpolicyScreen() {
  return (
    <div className="container">
      <main className="mb-5">
        <h3 className="page-title py-3 fw-bold">청소년보호정책</h3>
        <div className="card shadow-none rounded-0">
          <div className="card-body text-body font-14 p-4">
            <p className="mt-2">
              다이렉트 게임즈는 청소년의 건전한 성장과 인격 형성을 위해 청소년보호정책을 수립 및
              시행하고 있습니다. 다이렉트 게임즈는 청소년이 음란, 불법 등의 유해정보에 접근할 수
              없도록 방지하고, 비윤리적, 반사회적 행위에 대해세는 엄격하게 제재하기 위해 다음과 같이
              활동하고 있습니다.
            </p>
            <ul className="ps-2 list-unstyled">
              <li>- 유해정보로부터의 청소년보호정책 수립</li>
              <li>- 유해정보에 대한 청소년 접근제한 및 관리조치</li>
              <li>- 유해정보로부터의 청소년보호를 위한 업무 담당자의 교육</li>
              <li>- 유해정보로 인한 피해상담 및 고충처리</li>
              <li>- 그 밖에 유해정보로부터 청소년을 보호하기 위해 필요한 사항</li>
            </ul>

            <strong className="font-16">청소년보호 책임자</strong>
            <ul className="ps-2 list-unstyled">
              <li>- 이름 : 김지훈</li>
              <li>- 직책 : 부장</li>
              <li>- 소속부서 : 사업개발부</li>
              <li>- 전화 : 02-6929-3861</li>
              <li>- 이메일 : mojh@h2int.com</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
