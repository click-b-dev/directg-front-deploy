# 회원 상세 — 주문 내역 (회원_회원내역_상세_주문내역)

- Figma 파일 `DxqbeoDNTxs5WBpqb25APg`
  - **디자인(구현 기준)**: `[AD] design` 페이지 `회원_회원내역_상세_주문내역` — node `30053:11762`
  - 기획서: `AD-Member-Detail-01`(주문 내역) — 상세 탭 4개의 기획은 `AD-Member-Detail-01~04`
  - 형제 디자인(미구현): 혜택 내역 `30164:10942`, 리뷰 내역 `30164:12141`
- 라우트: `/renewal/member/detail?m_no=` (`src/routes/renewal/member/detail.tsx`)
- 구현: `src/renewal/screens/member-detail`. 회원 내역 목록의 "상세"에서 진입한다.
- 데이터: 기존 `useMemberView(m_no)` (legacy member_view 통합 스냅샷)

## 화면 ↔ 데이터

| 화면 | 데이터 |
|------|--------|
| 이름 / 등급 태그 | `member.name` / `MEMBER_LEVEL_LABEL[member.mem_level]` |
| 누적 주문 금액 | `order_stats.step2_price` |
| 누적 주문 완료 / 취소 | `order_stats.success_cnt` / `cancel_cnt` |
| 보유 포인트 | `member.point` |
| 가입일 / 최근 접속일 | `member.reg_date` / `member.log_date` |
| 생년월일 | `member.birth_day` (6자리는 legacy `getMemberAge`와 같은 세기 규칙) |
| 휴대폰 번호 태그 | `member.is_auth` — legacy "본인인증 여부"(Y=인증완료) |
| 소셜 연동 | `member.sns_type` (가입 방법 1개만 표시) |
| 주문 표 | `orders.items` — 주문일/주문번호(`ordno`)/결제번호(`settle_no`)/상품/금액/상태 |
| 계정 열 | `member.email` |

주문번호 링크는 legacy 주문 상세(`/order/order_view?settle_no=`)로 이동한다(리뉴얼 주문 화면 구현 전까지).

## 백엔드/기획 확인 필요

1. **성별, Steam 연동, 계정 통합(일시·상세), 정책 동의(이용약관/개인정보/마케팅)** — 현재 응답에 없어 `-`로 표시한다.
2. **소셜 연동 복수 표시** — 디자인은 "네이버, 카카오, 페이코"처럼 여러 연동을 보여주지만 응답은 가입 방법(`sns_type`) 하나뿐이다.
3. **이메일 인증 상태·수동 승인** — 이메일 옆 태그/버튼은 데이터가 없어 표시하지 않는다. (아래 4번 참조)
4. **`is_auth` 의미 불일치(목록 화면 포함)** — legacy `is_auth`는 "본인인증 여부"(휴대폰/실명)다. 새 디자인의 "이메일 인증"과는 별개 개념으로 보인다. 목록의 "이메일 인증" 필터·열은 현재 `is_auth`로 임시 연결되어 있다 → 이메일 인증 전용 필드 확정 필요.
5. **계정 잠금 스위치** — API가 없어 비활성 표시만 한다. 툴팁 문구는 디자인 그대로.
6. **APP 알림 발송 / 이메일 발송 / 쿠폰 발급** — 버튼은 그렸지만 동작을 연결하지 않았다. "포인트 적립"은 legacy 포인트 지급 화면(`/member/member_point_form`)으로 이동한다.
7. **주문 필터(전체/주문완료/주문취소)** — 클라이언트에서 `status` 코드로 거른다(주문완료=2, 취소=8·9). 서버 필터가 필요한지, 코드 매핑이 맞는지 확인 필요.
8. **페이지 크기** — 주문 내역 API는 페이징 파라미터가 없어 클라이언트에서 20개씩 나눈다. 페이지당 개수 드롭다운은 비활성.
9. **탭** — 회원 등급 변동 탭은 구현했다(아래 문서). 혜택 내역·리뷰 내역 탭은 비활성이다.
10. **회원 탈퇴** — 확인 알럿(`회원을 탈퇴 처리할까요?`) 후 `useLeaveMember`를 호출하고 성공하면 목록으로 이동한다.
