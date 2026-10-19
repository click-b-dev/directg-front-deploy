# 이메일 인증 상태 · 수동 승인 (회원 내역 목록 + 회원 상세)

- 기획: AD-Member-List-01 7번 / AD-Member-Detail-01 — "이메일 수동 인증(Btn): 인증 상태가 '미인증'인 경우 노출. 클릭 시 '인증'으로 변경되며, 사용자가 직접 인증하지 않더라도 완료로 간주"
- 구현: `src/renewal/entities/member-approval`(공통), 목록 `screens/member-list`, 상세 `screens/member-detail`, mock `src/renewal/mocks/member-approval.ts`
- mock 등록: `src/shared/mocks/handlers.ts` — legacy `apply` mock보다 **먼저** 등록해야 한다(승인 상태를 반영하려고 같은 경로를 덮어쓴다).

## legacy에서 이메일 인증을 나타내는 방식
전용 컬럼이 없고 `tbl_member.status`로 표현한다.
- `5` = 승인대기 — 가입 후 인증메일의 `[인증완료]`(`join_confirm.php`)를 누르지 않음. 로그인 시 `NO_AUTH_CONFIRM`("미승인된 회원입니다").
- `0` = 승인 완료(정상). 링크 클릭 시 `approvalMember`가 `status=0`(+`mem_level=1`)로 바꾼다.
- 관리자 수동 승인 = legacy 승인대기 목록의 "가입승인"(`member_proc mode=apply` → `status=0`) → 이관 API `POST /admin/member/apply` (`applyMember`).
- 참고: `mailling`은 뉴스레터 수신 동의, `is_auth`는 휴대폰 본인인증이라 이메일 인증과 무관하다.

## 동작 (목록·상세 동일 기준)
- 인증 상태: `status === 0` → 인증완료(초록 태그) / `status === 5` → 미인증(빨강 태그).
- `수동승인` 버튼은 **미인증(status 5)일 때만** 보인다. 누르면 `POST /admin/member/apply { m_no }` 후 상태를 다시 조회하고, 목록과 상세가 같은 값을 본다. 확인 알럿은 디자인에 없어 바로 적용한다.
- 상태는 현재 `useMemberStatuses`(`GET /admin/member/status?m_no=1,2,3` → `{ statuses: { "<m_no>": 0|5 } }`)로 따로 조회한다. **임시 계약**이다.

## 백엔드/기획 확인 필요
1. **응답에 `status` 포함** — 회원 목록·상세 응답에 `status`가 들어오면 임시 조회(`/admin/member/status`)와 mock을 지우고 응답 값을 바로 쓰면 된다.
2. **목록 조회 범위** — legacy 목록은 `status=0`만 조회하고 미인증(5)은 별도 승인대기 목록에만 나온다. 새 디자인은 목록에 "미인증 + 수동승인"이 있으므로 새 목록 API가 `status=5`도 포함해야 한다.
3. **목록 필터("이메일 인증")** — 지금은 기존 파라미터(`is_auth`)로 임시 전송한다(mock에서는 시드가 같아 동작이 맞는다). 실제로는 `status` 기준 필터 파라미터가 필요하다.
4. 수동 승인의 감사 로그(누가 승인했는지), 승인 시 `mem_level=1` 설정 여부(legacy `approvalMember` 동작).
