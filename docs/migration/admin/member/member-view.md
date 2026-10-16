# 회원 상세보기

M6(회원 관리) 세 번째 단위. legacy `member_view.php` — 회원 프로필 + 포인트 + 등급이력 + 주문/문의 요약(크로스도메인 read-only) + 인증 초기화(authReset).

## 원본
- 파일:
  - `pc/_Admin_/member/member_view.php` (라이브 — 변형 없음, 465줄)
  - `pc/_Admin_/member/member_proc.php` (mode=authReset 사용; leave는 #184)
  - `src/classes/AdminV1.php` getMemberInfo/getMemberPoint/getMemberAge
  - `src/classes/AdminOrder.php:151` getOrderAll, `:552` getCheckoutStatus, `:573` getOrderStatus
  - `src/classes/AdminBoard.php` getQnaList
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§회원), `../legacy-project/docs/MEMBER-LIFECYCLE.md`, `ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우

### 진입 URL/파라미터
- `/member/member_view?m_no={m_no}` (GET). #184 목록 아이디 링크 대상.
- topmenu member active. sidebar_member(트리 display:none 링크).

### 화면 요소 (2컬럼: 좌 col-xl-4 / 우 col-xl-8)
- page-title-box: breadcrumb(홈/회원/회원관리/**회원 상세보기**), h4 "회원 상세보기".
- **[좌1] 회원 정보 카드** (table-bordered, col 30%/70%):
  - 회원고유번호 m_no / 아이디(이메일 조건부) / 이름(닉네임) / 생년월일(나이 조건부, getMemberAge) / 휴대폰 / 회원등급(badge bg-primary) / 회원가입일 / 최종로그인(접속IP) / 방문횟수(number_format "회") / 가입방법(sns_type badge) / 회원분류 / **포인트**(number_format + "내역보기" 링크 → member_point_list, target=_blank) / **본인인증**(인증/미인증, is_auth=Y면 "인증 초기화" 버튼 → authReset)
- **[좌2] 회원등급 변동이력 카드**: "총 N 건 / 최근 5건". table(월 history_date / 등급 mem_level label / 대상금액 ₩order_price). 최대 5행.
- **[우1] 집계 타일 3개** (col-sm-3, tilebox-one):
  - 결제완료 건수/금액: `{step2_cnt}건 / ₩{step2_price}` (tbl_order step=2)
  - 주문완료 건수: `{success_cnt}건` (tbl_order_item status=2)
  - 취소완료 건수: `{cancel_cnt}건` (tbl_order_item status=9)
- **[우2] 회원 주문내역 카드**: 헤더 "회원 주문내역" + 주문내역보기/(과거)주문내역보기 링크(target=_blank). "총 N 건 / 최근 5건". table(주문일자 order_date / 결제번호 settle_no→order_view 링크 / 결제상태 getCheckoutStatus(step) / 주문번호 ordno / 상품정보 product_name / 주문금액 number_format(price) / 주문상태 getOrderStatus(status)). 최대 5행.
- **[우3] 회원 문의내역 카드**: 헤더 "회원 문의내역" + 전체보기 링크. "총 N 건 / 최근 5건". table(구분 gubun label / 제목 subject→qna_view 링크 + file_cnt시 photo icon / 작성일 reg_date / 답변상태 answer≠""?O:X + admin_id 조건부). 최대 5행.

### 라벨 맵 (page-local / domain)
- 회원등급 1일반/2정회원/3VIP, 회원분류 P일반/R리셀러/S휴면/E이벤트 (#184 재사용)
- sns_type badge(strtolower): ""→이메일(primary)/naver→네이버(success)/kakao→카카오(warning)/payco→페이코(danger), 미매핑 ""
- qna gubun: 1 게임 설치,플레이 / 2 주문,결제 / 5 제품 코드(키) 오류 / 7 한글,제공 콘텐츠 / 6 계정,회원,인증 / 4 취소,환불 / 8 할인,가격 / 9 이용방법 / 3 기타
- **checkout status(step, 백엔드)**: 1 입금대기/2 결제완료/8 환불요청/9 환불완료/99 취소완료
- **order status(status, 백엔드)**: 1 주문대기/2 주문완료/3 배송준비/4 배송중/5 배송완료/6 구매확정/8 취소요청/9 취소완료

### 인증 초기화 플로우
- `isAuthReset(m_no)` → `confirm('인증 초기화시 이름, 휴대폰, 생년월일 정보가 삭제됩니다.')` → POST authReset →
  - 성공(`{success:true}`): `alert("초기화완료")` + reload(view invalidate).
- 서버(백엔드): `tbl_member` is_auth=N, name/birth_day/hp/dupinfo/sex/auth_type = NULL.

### 분기/세션
- 단일 GET 렌더. is_auth=Y일 때만 인증초기화 버튼. 링크 다수 target=_blank(미이관 order/point 포함).
- 크로스DB: `dsn`(directgames? — 주문/order) + `dsn_dgkr`(DGKR — 회원/포인트/등급이력/qna). → 백엔드 책임.

## 데이터 (legacy)
- getMemberInfo(m_no): `SELECT * FROM tbl_member WHERE m_no`.
- getMemberPoint(m_no): `SELECT SUM(amt_delta) AS point FROM tbl_emoney_log WHERE m_no`.
- 집계: step2 `count/sum(total_price) FROM tbl_order WHERE m_no>0 AND step=2 AND m_id` / success `count/sum(price) FROM tbl_order a JOIN tbl_order_item b WHERE b.status=2 AND b.m_id` / cancel 동일 status=9.
- 등급이력: `SELECT * FROM tbl_member_level_history WHERE m_id ORDER BY idx DESC`.
- 주문: getOrderAll `select b.*,a.step FROM tbl_order a JOIN tbl_order_item b ON settle_no WHERE a.m_no>0 AND b.m_id='{m_id}' ORDER BY b.order_date DESC` (20/page, 화면 5건).
- 문의: getQnaList `WHERE user_id='{m_id}' ORDER BY idx DESC` (화면 5건).

## API 계약 (백엔드 전달)

### `GET /admin/member/view?m_no={m_no}`
회원 상세 통합 스냅샷(read-only). 백엔드가 크로스DB 집계·라벨 계산.

**응답 200** `MemberViewResponse`:
```jsonc
{
  "member": {
    "m_no": 100231, "m_id": "hong123", "email": "hong@x.com", "name": "홍길동",
    "nickname": "길동이", "birth_day": "900115", "hp": "010-1234-5678", "mem_level": 2,
    "reg_date": "2024-05-01 12:03:11", "log_date": "2026-07-25 09:12:00", "ip": "1.2.3.4",
    "visited": 142, "sns_type": "kakao", "mem_type": "P", "is_auth": "Y", "point": 15400
  },
  "level_history": [ { "history_date": "2026-06", "mem_level": 2, "order_price": 320000 } ],
  "level_history_total": 3,
  "order_stats": { "step2_cnt": 12, "step2_price": 540000, "success_cnt": 10, "cancel_cnt": 2 },
  "orders": {
    "total_results": 34,
    "items": [ { "order_date": "2026-07-20 10:00:00", "settle_no": "S123", "step": 2, "step_label": "결제완료",
                 "ordno": "O456", "product_name": "젤다", "price": 62000, "status": 2, "status_label": "주문완료" } ]
  },
  "qna": {
    "total_results": 5,
    "items": [ { "gubun": "2", "idx": 88, "subject": "결제 문의", "file_cnt": 1,
                 "reg_date": "2026-07-01 09:00:00", "answer": "확인했습니다", "admin_id": "admin1" } ]
  }
}
```
- `level_history`/`orders.items`/`qna.items`는 최근 5건. `*_total`은 전체 건수(표 상단 "총 N 건").
- 백엔드: step_label=getCheckoutStatus, status_label=getOrderStatus, point=SUM(amt_delta), 크로스DB 조인.
- 에러: 500(`Error!: {msg}`). m_no 무효 시 legacy는 빈값 렌더.

### `POST /admin/member/auth-reset`
본인인증 초기화(member_proc mode=authReset).

**요청**: `{ m_no: number }` · **응답 200**: `{ success: true }`
- 백엔드: is_auth=N, name/birth_day/hp/dupinfo/sex/auth_type=NULL.

## 타겟 매핑
- 라우트: `/member/member_view` (`routes/member/member_view.tsx`, validateSearch m_no)
- entities: `entities/member` 확장 — MemberView/MemberViewResponse/history/orderStat/orderItem/qnaItem 타입, SNS_TYPE_BADGE·QNA_GUBUN_LABEL, `fetchMemberView`·`useMemberView`, `resetMemberAuth`·`useResetMemberAuth`(view invalidate)
- screen: `screens/member-view` — 2컬럼 5카드, 인증초기화 confirm→alert
- mock: `handlers/member.ts` 확장 — view(members 재사용+합성 이력/주문/문의) + auth-reset
- **#184 목록 아이디 링크 활성화**. member_point_list/order_*/qna 링크는 각 도메인 라우트(일부 미이관) target=_blank

## Parity 체크리스트
- [ ] 회원정보 12행(조건부 email/age·badge·포인트 링크·인증초기화 버튼) 일치
- [ ] 등급변동이력(총N/최근5·라벨·₩) 일치
- [ ] 집계 타일 3종(건/금액) 일치
- [ ] 주문내역(총N/최근5·라벨 매핑·링크) 일치
- [ ] 문의내역(총N/최근5·gubun·답변상태 O/X+admin) 일치
- [ ] sns badge/gubun/step/status 라벨 매핑 일치
- [ ] 인증초기화(confirm 문구·alert·reload) 일치
- [ ] getMemberAge quirk 일치
