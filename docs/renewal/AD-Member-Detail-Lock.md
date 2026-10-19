# 회원 상세 — 계정 잠금

- Figma: 스위치·툴팁 `30048:1662`, 확인 알럿 `30099:4708`(두 번째 `alert_modal`)
- 구현: `screens/member-detail/ui/member-detail-screen.tsx`, 데이터 `src/renewal/entities/member-lock`, mock `src/renewal/mocks/member-lock.ts`
- mock 등록: `src/shared/mocks/handlers.ts`에 한 줄(`memberLockHandlers`) 추가(리뉴얼 격리 원칙의 예외)

## 동작
1. 스위치를 켜면 알럿("해당 회원의 계정 잠금 처리 시 회원이 로그인 할 수 없게 됩니다.")이 뜬다.
2. 확인 → `POST /admin/member/lock { m_no, locked: true }` → 성공하면 스위치가 켜진 상태로 바뀐다. 취소하면 그대로다.
3. 스위치를 끄면(해제) 디자인에 알럿이 없어 바로 `locked: false`를 보낸다.

## 신규 API 계약 (legacy에 없음 — 백엔드 전달용)
- `GET /admin/member/lock?m_no=` → `{ "locked": boolean }`
- `POST /admin/member/lock` `{ "m_no": string, "locked": boolean }` → `{ "locked": boolean }`
- 실제 API에서는 별도 GET 대신 회원 상세 응답(`member_view`)에 `locked`를 포함하는 편이 자연스럽다. 그때는 `useMemberLock`만 `useMemberView`에서 읽도록 바꾸면 된다.

## mock 특성
잠금 상태를 메모리에만 유지한다(새로고침하면 초기화). 회원 목록/로그인에는 영향이 없다.

## 확인 필요
1. 잠금 해제에도 확인 알럿이 필요한지(디자인 없음).
2. 잠금 시 기존 세션 만료 여부, 잠금 사유/일시 표시 여부.
