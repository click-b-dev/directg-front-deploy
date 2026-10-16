# 포인트 지급/차감

M6(회원 관리) — 포인트 관리 그룹 두 번째 화면. legacy `member_point_form.php` — 대상회원 검색 → 회원 정보/포인트 표시 → 지급/차감 폼(AJAX mutation).

## 원본
- 파일: `pc/_Admin_/member/member_point_form.php` (라이브, 326줄) + `member_point_proc.php` (처리기, 130줄)
- `src/classes/AdminV1.php` getMemberNo/getMemberInfo/getMemberPoint
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§회원), `../legacy-project/docs/MEMBER-LIFECYCLE.md`

## 화면·플로우

### 진입 URL/파라미터
- `/member/member_point_form` (GET). 파라미터: `search_type`(값 `tm.m_id`), `search_value`. (page 없음)
- #188 목록의 아이디 링크 대상.
- topmenu member active. sidebar_member.

### 화면 요소
- page-title-box: breadcrumb(홈/회원/회원관리/**포인트 지급/차감**), h4.
- **대상회원 검색 카드**(bg-secondary "대상회원 검색"), `<form method=get>`: 검색어(select search_type 단일[아이디, value=`tm.m_id`] + text search_value). **submit 버튼 없음**(Enter로 제출).
- **대상회원 table** (table-centered ...): thead 7컬럼(아이디/닉네임/이름/회원등급/포인트/회원가입일/최종로그인. 구매횟수·구매금액 2컬럼은 주석). tbody:
  - 검색결과 있으면 1행: 아이디(member_view 링크)/닉네임/이름/등급 label/포인트/reg_date/log_date.
  - 없으면 `<td colspan="8">대상회원을 검색 후 이용해주세요.</td>` (**colspan=8 quirk — 실제 7컬럼**).
- **지급/차감 폼**(검색결과 있을 때만, `#point_form`): hidden m_no·member_point. 필드:
  - 대상회원 — readonly m_id
  - 지급/차감 여부 — radio(add=지급 / sub=차감)
  - 금액 — number(min 1) + "원"
  - 지급/차감사유 — select memo_type(12옵션) + etc 선택 시 memo text(`#etc_text`, 기본값 "기타", 평소 숨김)
  - 버튼 "포인트 지급/차감" → `member_point_proc()`
- 페이지 hover 스타일 #FFF0F0 이식.

### memo_type 옵션 (12)
`""` =지급/차감사유 선택= / `discount` 상품구매 시 포인트 사용 / `repay` 상품구매 시 포인트 지급 / `refound` 상품주문 취소시 사용포인트 환불 / `add_member_level` 회원등급에 따른 추가포인트 지급 / `renewal` 리뉴얼 기념 포인트 지급 / `change` 차액보정 / `reward` 스펠포스 3 소울 하베스트 출시 기념 / `reward2` 시스템 장애로 인한 주문 오류 보상 지급 / `reward3` 이스 9: 몬스트룸 녹스 차액 보정 / `mobile_refund1` 휴대폰결제 부분취소 / `mobile_refund2` 휴대폰결제 익월취소 / `etc` 기타

### JS 검증 (member_point_proc)
1. point_type 미선택 → alert "지급/차감 여부를 체크해주세요."
2. point 빈값 → alert "금액을 입력해주세요." + focus
3. point_type=sub AND member_point < point → alert "대상회원의 포인트보다 차감할 금액이 큽니다."
4. memo_type 미선택 → alert "지급/차감사유를 선택해주세요."
5. memo_type=etc AND memo 빈값 → alert "기타 사유를 작성해주세요." + focus
- 통과 시 POST → 성공(`{success,message}`): `alert(message)` + reload.

### 서버 처리 (member_point_proc, 백엔드)
- memo_type→memo 텍스트 매핑(etc·""는 제출 memo 유지). INSERT tbl_emoney_log:
  - add: emoney_type='+', emoney=point, amt_delta=+point, admin_id=세션, ordno=m_no
  - sub: emoney_type='-', emoney=point, amt_delta=-ABS(point), admin_id=세션, ordno=m_no
- 응답: `{success:true, message:"포인트 지급완료"|"포인트 차감완료"}`. m_no 무효 → "잘못된 요청입니다."

### 분기/세션
- search_value 있을 때만 회원 조회·폼 노출. 없으면 placeholder. mutation 성공 시 reload(포인트 갱신). admin_id는 세션(백엔드).

## 데이터 (legacy)
- getMemberNo(search_value) → m_no, getMemberInfo(m_no) → 회원, getMemberPoint(m_no)['point'] → 포인트.

## API 계약 (백엔드 전달)

### `GET /admin/member/point/target?search_value={m_id}`
지급/차감 대상 회원 조회(아이디 완전일치). search_value 없으면 호출 안 함.

**응답 200** `MemberPointTargetResponse`:
```jsonc
{ "member": { "m_no": 100231, "m_id": "hong123", "nickname": "길동이", "name": "홍길동",
              "mem_level": 2, "point": 15400, "reg_date": "2024-05-01 12:03:11",
              "log_date": "2026-07-25 09:12:00" } }
```
- 미존재 시 `{ "member": null }`.

### `POST /admin/member/point`
포인트 지급/차감(member_point_proc).

**요청**: `{ m_no, point_type: "add"|"sub", point: number, memo_type: string, memo: string }`
**응답 200**: `{ success: true, message: "포인트 지급완료" | "포인트 차감완료" }`. m_no 무효 → 비 JSON "잘못된 요청입니다."
- 백엔드: memo_type→memo 매핑, tbl_emoney_log INSERT(±amt_delta), admin_id 세션. 트랜잭션.

## 타겟 매핑
- 라우트: `/member/member_point_form` (`routes/member/member_point_form.tsx`, validateSearch search_type/search_value)
- entities: `entities/member` 확장 — MemberPointTarget/Response, MemberPointSubmitRequest/Result, `fetchMemberPointTarget`·`useMemberPointTarget`(enabled), `submitMemberPoint`·`useSubmitMemberPoint`(invalidate)
- screen: `screens/member-point-form` — 검색폼 + 회원 table + 지급/차감 폼(controlled, 5단계 검증)
- mock: `handlers/member.ts` 확장 — point/target(members 재사용 + point) + point(mutation)
- **#188 목록 아이디 링크 활성화**

## Parity 체크리스트
- [ ] 대상회원 검색(search_type tm.m_id·Enter 제출) 일치
- [ ] 회원 table(7컬럼·member_view 링크·colspan=8 placeholder) 일치
- [ ] 지급/차감 폼(radio·금액·memo_type 12·etc 텍스트 토글) 일치
- [ ] JS 검증 5단계(문구·조건) 일치
- [ ] 성공 alert(message)·reload 일치
- [ ] hover 스타일 이식
