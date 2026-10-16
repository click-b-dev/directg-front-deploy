# 청소년보호정책 (youthpolicy)

## 원본
- 파일: `pc/service/youthpolicy.html` (라이브 — service 도메인, aside **없음**)
- 본문: PHP에 **직접 인라인된 정적 HTML**. `youthpolicy.txt`(0B)는 **어디서도 include 안 되는 죽은 파일** → 복사·사용 안 함.
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/OPERATION-POLICY-MAP.md`

## 화면·플로우
- 진입 URL/파라미터: `/service/youthpolicy.html` (파라미터 없음, GET)
- 화면 요소 (legacy 기준):
  - `div.container` > `main.mb-5` (※ `my-3 pb-5` 없음)
  - `h3.page-title.py-3.fw-bold` "청소년보호정책"
  - `div.card.shadow-none.rounded-0` > `div.card-body.text-body.font-14.p-4`
    - `p.mt-2` 도입문 (청소년보호정책 수립·시행 안내) — **legacy 오타 "반사회적 행위에 대해세는" 그대로 보존**
    - `ul.ps-2.list-unstyled` 활동 목록 5항목("- " 프리픽스)
    - `strong.font-16` "청소년보호 책임자"
    - `ul.ps-2.list-unstyled` 책임자 정보 5항목(이름/직책/소속부서/전화/이메일)
- 폼/검증/리다이렉트: 없음
- 세션/권한 의존: 없음(비로그인 접근)

## SSR·SEO (legacy)
- title `청소년보호정책`, viewport `width=device-width, initial-scale=1.0`
- `description=""`, **`author=""` (빈값 — epic 이용안내와 동일, agreement/private/refund와 다름)**, canonical/OG/구조화데이터 없음
- 페이지 CSS: head `<style>` 블록 없음. 전역 CSS(Bootstrap/directg)만.
- SSR/CSR: 전 구간 정적 SSR. 인터랙션 없음.

## 데이터 (legacy)
- 도메인 클래스·SQL·AJAX·txt: 없음. (0B `youthpolicy.txt`는 미참조 죽은 파일)

## 결제(PG)
- 해당 없음

## API 계약 (백엔드 전달)
- **없음** — 완전 정적. entity/fetcher/MSW/자산 불필요.

## 타겟 매핑
- 라우트: `app/service/youthpolicy.html/page.tsx` → `/service/youthpolicy.html` (파라미터 없음)
  - metadata/viewport: title 청소년보호정책 / description "" / **author "" (빈값)** / initial-scale 1
- screen: `screens/service-youthpolicy` (신규) — 정적 서버 컴포넌트. 인라인 HTML→JSX 전사.
- entities/mock/자산: 없음

## 단위 경계 결정 / legacy quirk
1. `youthpolicy.txt` 0B 죽은 파일 → 미복사·미참조.
2. 인라인 HTML → JSX 전사.
3. container에 `my-3 pb-5` 없음, `main.mb-5`.
4. author 메타 빈값 유지(epic 선례와 동일 `authors: [{ name: "" }]`).
5. 도입문 오타 "대해세는" 원문 보존(parity).

## Parity 체크리스트
- [ ] 화면 요소 일치 (도입문 + 활동 5항목 ul + 책임자 strong + 책임자 5항목 ul)
- [ ] 도입문 오타 "대해세는" 보존
- [ ] 책임자 정보(이름 김지훈/직책 부장/소속 사업개발부/전화 02-6929-3861/이메일 mojh@h2int.com) 일치
- [ ] SEO(title/viewport/description/**author 빈값**) 일치, canonical/OG 없음 유지
- [ ] container에 my-3 pb-5 없음 / main.mb-5
