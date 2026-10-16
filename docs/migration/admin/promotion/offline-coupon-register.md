# 오프라인 쿠폰 등록/수정 (등록/수정 겸용 폼)

> P1 #181. legacy `offline_coupon_register.php` + `offline_coupon_ps.php`. 오프라인 쿠폰(`tbl_offline_coupon`, DGKR) 등록/수정 겸용 폼. 3섹션(기본정보/발급정보/포인트) + 조건부 필드(발급유형·인당제한). #180 목록의 수정 링크 대상.

## 원본
- 파일: `pc/_Admin_/promotion/offline_coupon_register.php` (라이브)
- 처리기: `offline_coupon_ps.php` (register/update)
- 도메인: `AdminPromotion::getOfflineCouponInfo(sno)`(update 프리필), `setPaperCoupon(sno,cnt,code_type,promotion_code)`(register 시 코드 생성)
- 참조: #180 문서

## 화면·플로우
- 진입 URL: `/promotion/offline_coupon_register` (register) · `?sno=N&mode=update` (#180 수정 링크). `param`(base64 목록 복귀)도 legacy는 받음.
- page_title: register="오프라인 쿠폰 등록", update="오프라인 쿠폰 수정". h4/breadcrumb 동일.
- **mode**: GET mode=="update"→update, else register (register.php는 mode로 판정, list와 달리 sno 아님).
- 폼(col-8, `#frm` POST multipart, hidden mode/sno). 3개 카드(각 card-header `bg-secondary fw-bold font-15`):

### 기본정보
| 필드 | 컨트롤 | required |
|------|--------|:---:|
| * 쿠폰명 | `coupon_name` text | ✓ |
| * 쿠폰 사유 | `reason` text | ✓ |
| * 쿠폰 발행 수량 | `issueLimitCnt` number + "장" | ✓ |
| * 쿠폰 사용기간 | `sdate`·`edate` **datetime-local** + `~` + 삭제버튼(둘 다 clear) | ✓ |
| * 쿠폰 사용처 | `partner` text | ✓ |

### 발급정보
| 필드 | 컨트롤 |
|------|--------|
| * 발급 유형 | `code_type` radio: STATIC(지정코드 발급)/DYNAMIC(난수코드 발급). **update 시 disabled**. 기본 DYNAMIC. (DOWNLOAD은 폼 옵션 아님) |
| 프로모션코드 | `promotion_code` text. **STATIC일 때만 required**(JS `togglePromotionRequired`), `#req_mark` "*" 토글 |
| * 인당 발급 제한 | `issuePerPersonLimitYn` radio: Y(발급 무제한)/""(발급 제한). 기본 제한("") |
| 기간전체 발급제한 | `issuePerPersonLimitCnt` number(min1, 기본1) — `.limit-fields`(제한일 때만 표시) |
| 1일 발급제한 | `dailyIssuePerPersonLimitCnt` number — `.limit-fields` |

### 포인트설정
| * 포인트 | `coupon_price` number + "원" | ✓ |

- 하단: `목록`(back_btn) + `등록`/`수정`(submit).
- **JS**: `togglePromotionRequired`(code_type STATIC→promotion_code required+req_mark"*", else 해제+숨김), `toggleLimitFields`(issuePerPersonLimitYn==""(제한)→.limit-fields show, 무제한→hide). 초기 실행.

### 저장 (offline_coupon_ps.php)
- register: INSERT(전 필드 + `currency='원'`, `status=1`, `regdt=NOW()`; issuePerPersonLimitYn 빈값→NULL) → `setPaperCoupon`(수량만큼 코드 생성, 백엔드) → alert("저장되었습니다.") → go(HTTP_REFERER).
- update: UPDATE(전 필드, currency/status/regdt/코드생성 없음) → alert("수정되었습니다.") → go(HTTP_REFERER).
- go(HTTP_REFERER)=목록 복귀.

## API 계약 (백엔드 전달)
`entities/promotion` 확장.

- `GET /admin/promotion/offline-coupons/:sno` → `OfflineCouponDetail` (update 프리필)
  - `{ sno, coupon_name, reason, issueLimitCnt, sdate, edate, partner, code_type, coupon_price, promotion_code, issuePerPersonLimitYn, issuePerPersonLimitCnt, dailyIssuePerPersonLimitCnt }`. **sdate/edate는 datetime-local 포맷('YYYY-MM-DDTHH:MM')로 반환**(입력 프리필용, 아래 결정①).
- `POST /admin/promotion/offline-coupons` (`OfflineCouponSaveRequest`) → `{ success }` (register: currency='원'·status=1·코드생성 백엔드)
- `PUT /admin/promotion/offline-coupons/:sno` (`OfflineCouponSaveRequest`) → `{ success }` (update)
  - SaveRequest: 위 폼 필드(숫자 필드 number, issuePerPersonLimitYn "Y"|"" — 백엔드 빈값→NULL).
- 저장 성공 → 목록(#180) 이동.

## 타겟 매핑
- 라우트: `routes/promotion/offline_coupon_register.tsx` (validateSearch mode/sno)
- 스크린: `screens/offline-coupon-register/` (상태로 code_type·limitYn 조건부 처리)
- entities: `entities/promotion` 확장(detail/create/update + `OfflineCouponRegisterSearch`/`OfflineCouponDetail`/`OfflineCouponSaveRequest`).
- mock: `handlers/promotion.ts` 확장 — GET/:sno·POST·PUT/:sno. `OFFLINE_COUPON` fixture에 reason/promotion_code/issuePerPersonLimit* 필드 추가.
- **#180 수정 링크 활성화**.

## 파리티 결정 사항 (게이트 확인 대상)
1. **datetime-local 프리필 포맷**: DB는 'YYYY-MM-DD HH:MM:SS'인데 datetime-local은 'YYYY-MM-DDTHH:MM'만 허용 → legacy는 raw 전달로 **수정 시 날짜 빈칸 quirk** 가능. 사용성 위해 detail에서 'T'포맷 변환해 프리필(개발자 확인).
2. **code_type update 시 disabled**·**promotion_code STATIC만 required**·**limit-fields 조건부 표시**(제한일 때).
3. register만 currency='원'·status=1·코드생성(setPaperCoupon).
4. 저장 후 목록 이동(go referer).

## Parity 체크리스트
- [ ] register 빈 폼(DYNAMIC·제한 기본) / update 프리필·code_type disabled
- [ ] promotion_code STATIC required 토글·req_mark
- [ ] limit-fields 제한 시만 표시
- [ ] datetime-local 기간·삭제버튼
- [ ] 저장 → register/update → 목록 이동
