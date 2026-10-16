# 옵션상품 타임딜 설정 (#42, sales 분리 후속)

> 영역: 상품 > 옵션상품 관리 > 판매 설정의 **타임딜 블록**(display_type=="timedeal" 조건부). #40(sales)에서 분리한 후속. 타임딜 설정 폼 + 진행이력. 저장은 tbl_timedeal INSERT(이력 누적).

## 원본
- 파일: `goods_option_sales_register.php`(624~745, display_type==timedeal 조건부) + `goods_option_ps.php`(case `timedeal_config`). 이력: `AdminGoods::getTimedealHistory`.
- 참조: [goods-option-sales](goods-option-sales.md). (별도 `timedeal_register.php`(미이관)로 저장 후 리다이렉트 — 주3.)

## 화면·플로우
- 위치: sales 화면 하단, **display_type=="timedeal"일 때만** 렌더.
- **타임딜 설정 카드**(timedeal_config form): 타임딜 진행기간(timedeal_start_date ~ timedeal_end_date, required) · 퍼블리셔 SRP(product_srp) · 퍼블리셔 PPR(product_ppr) · 타임딜 판매가(timedeal_price) · 타임딜 진행수량(timedeal_stock) · 타임딜 승인여부(timedeal_confirm Y/N 라디오). "타임딜 설정 저장".
  - 초기값: start/end는 legacy `$bonus_start_date/$bonus_end_date` **미정의 → 빈값**. srp/ppr/price/stock은 tbl_goods_item 현재값. confirm은 `$checked` 미설정 → 미선택.
- **타임딜 진행이력 카드**: 테이블 — 회차 / 진행기간(start~end) / 진행수량(timedeal_stock) / 퍼블리셔 SRP(timedeal_srp) / 퍼블리셔 PRR(timedeal_ppr) / 타임딜 판매가(timedeal_price) / 타임딜 판매수량(timedeal_order) / 진행상태(timedeal_status). number_format.

## 데이터 (legacy)
- 로드: tbl_goods_item(product_srp/product_ppr/timedeal_price/timedeal_stock) + getTimedealHistory(tbl_timedeal rows).
- **timedeal_config**(ps 852): `INSERT into tbl_timedeal set product_code, timedeal_status, timedeal_start(strtotime), timedeal_end(strtotime), timedeal_stock, timedeal_srp(=product_srp), timedeal_ppr(=product_ppr), timedeal_price`. → `go(timedeal_register.php?product_code=)`.
  - **⚠️ 주1 (legacy 버그)**: 폼 필드는 `timedeal_confirm`(Y/N)인데 ps는 `timedeal_status`를 읽음 → **승인여부 라디오값은 저장에 반영 안 됨**(timedeal_status 항상 빈값 INSERT). recommand 검색버그(#11~13)와 동류. → **그대로 이식**(개발자 지시 시 교정).
  - 저장은 UPDATE가 아니라 **INSERT** → 매 저장마다 이력 1건 누적.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/timedeal`** — 응답 `{ config{ timedeal_start_date, timedeal_end_date, product_srp, product_ppr, timedeal_price, timedeal_stock, timedeal_confirm }, history[{ timedeal_start, timedeal_end, timedeal_stock, timedeal_srp, timedeal_ppr, timedeal_price, timedeal_order, timedeal_status }] }`. start/end는 포맷 문자열, 수치는 number. 없으면 404.
- **`POST /admin/goods/options/:productCode/timedeal`** — body `{ timedeal_start_date, timedeal_end_date, product_srp, product_ppr, timedeal_price, timedeal_stock, timedeal_confirm }` → tbl_timedeal INSERT(이력 추가). `{ success }`.
  - **백엔드 주1**: legacy는 timedeal_status를 timedeal_confirm과 별개로 읽어 빈값 저장(버그 재현). timedeal_order는 실제 판매수량(백엔드 집계).

## 타겟 매핑
- feature: `features/option-timedeal`(설정 폼 + 이력 테이블). sales 화면에서 `display_type==="timedeal"`일 때만 렌더.
- entities/goods-option 확장: `OptionTimedealConfig`/`OptionTimedealHistory`/`OptionTimedealData`/`SaveOptionTimedealRequest` + `fetchOptionTimedeal`/`saveOptionTimedeal` + `useOptionTimedeal`/`useSaveOptionTimedeal`(저장 후 invalidate → 이력 갱신).
- mock: `timedealConfigStore` + `timedealHistoryStore` + timedeal 옵션 시드(display_type=timedeal). 저장 시 history append(status="" 버그 재현).
- 시각: 카드/입력/라디오/이력 테이블 legacy 클래스 그대로. product_viewer 무관(legacy 타임딜 저장 버튼엔 product_viewer 가드 없음 — 그대로).

## 주요 결정/보류
- **주1**: timedeal_confirm→timedeal_status 필드 불일치 버그 그대로 이식(승인여부 미저장).
- **주2**: 저장 후 legacy는 `timedeal_register.php`(미이관)로 리다이렉트. 타겟은 **invalidate+잔류**(이력 갱신으로 INSERT 결과 표시) — 미이관 라우트 이동 불가에 따른 불가피한 대체. timedeal_register.php는 별도 단위.
- **주3**: 초기 start/end 빈값(legacy 미정의) 그대로.

## Parity 체크리스트
- [ ] display_type==timedeal일 때만 타임딜 블록 렌더
- [ ] 설정 폼(기간/SRP/PPR/판매가/수량/승인여부) + 저장
- [ ] 진행이력 테이블(8컬럼, number_format)
- [ ] 저장 시 이력 INSERT 누적(status 빈값 버그), invalidate 갱신
