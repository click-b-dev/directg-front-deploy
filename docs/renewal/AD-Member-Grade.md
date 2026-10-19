# 회원 등급 설정 (회원_회원등급설정)

- Figma 파일 `DxqbeoDNTxs5WBpqb25APg`
  - 목록 `30186:16759` (`회원_회원등급설정`)
  - 삭제 알럿 `30186:17058` (`회원_회원등급설정_등급삭제_모달`)
  - 미구현: 등급 추가 모달 `30186:17100`, 등급 수정(디자인 미확인)
- 라우트: `/renewal/member/grade` (SNB "회원 등급 설정")
- 구현: `src/renewal/screens/member-grade`, 데이터 `src/renewal/entities/member-grade`, mock `src/renewal/mocks/member-grade.ts`
- mock 등록: `src/shared/mocks/handlers.ts`에 한 줄 추가(리뉴얼 격리 원칙의 예외)

## 화면
- 제목 + 공지 2줄(빨강: 변경은 다음 산정일부터 적용 / 보조색: 산정일 기준 최근 6개월 구매 총액으로 등급 결정), "다음 산정일" + `등급추가` 버튼.
- 표: No(등급 순위, 1이 최상위) / 등급 / 구매 총액 범위 / 혜택 / 관리(수정·삭제). 혜택이 없으면 "혜택 없음".
- 혜택 태그: 포인트 적립=초록, 할인쿠폰 지급=파랑, 상시 할인=노랑. 쿠폰은 보조 설명(최소 주문 금액 | 최대 할인 금액)을 한 줄 더 보여 준다.

## 삭제
`삭제` → 알럿 "[등급명] 등급을 삭제할까요?" → 확인 시 `POST /admin/member/grades/delete { id }` → 목록 재조회. mock은 새로고침 전까지 메모리에서 삭제를 유지한다.

## 신규 API 계약 (legacy에 없음 — 백엔드 전달용)
- `GET /admin/member/grades` → `{ items: MemberGrade[], next_calc_date: "YYYY-MM-DD" }`
  - `MemberGrade`: `id`, `rank`(1=최상위), `name`, `min_amount`(이상), `max_amount`(미만, null=상한 없음), `benefits[]`
  - `benefit`: `kind`(point|coupon|discount), `label`, `description`, `detail?`
- `POST /admin/member/grades/delete { id }` → `{ success }`

## 확인 필요
1. **삭제 규칙** — 해당 등급 회원이 있을 때 삭제 가능한지, 구간(구매 총액)이 비게 되는 경우 막을지(예: 가운데 등급 삭제). 기획의 "다음 산정일부터 적용"에 따라 삭제도 즉시가 아니라 산정일에 반영되는지(현재 mock은 즉시 제거).
2. **번호(No)** — 표 순서가 3→2→1이고 No가 등급 순위다. 회원 등급 값(`mem_level` 1/2/3)과 순위의 매핑(현재 코드는 legacy 1=일반/3=VIP)이 이 화면의 순위(1=VIP)와 반대다.
3. **등급 목록 연동** — 회원 내역의 "회원 등급" 필터·표기가 아직 상수(`entities/member-level`)다. 이 API가 확정되면 거기서 받도록 바꾼다.
4. 등급 추가/수정 모달 디자인과 검증 규칙(구간 겹침, 이름 중복 등).
