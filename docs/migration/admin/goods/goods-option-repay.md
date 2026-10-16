# 옵션상품 포인트 설정 (#45)

> 영역: 상품 > 옵션상품 관리 > 포인트 설정. 옵션 sub-nav "포인트 설정"(repay active). 단일 컬럼 3카드: 기본 포인트 설정 + 추가 포인트 설정 + 추가 포인트 진행이력. (sub-nav 라벨은 #39 fix에서 "적립금 설정"→"포인트 설정" 교정 완료. 페이지도 page_title "포인트 설정".)

## 원본
- 파일: `goods_option_repay_register.php`(272줄) + `goods_option_ps.php`(repay_config/add_repay_config). 이력: `AdminGoods::getAddRepayHistory`.
- 포함: `inc/sub_sidebar_option.php`(repay active).
- 참조: [goods-option-sales](goods-option-sales.md), [goods-option-timedeal](goods-option-timedeal.md)(이력 누적 패턴).

## 화면·플로우
- 진입: `?product_code=` → `/goods/goods_option_repay_register?product_code=`. col-2 sub-nav + col-10(단일 컬럼).
- page-title: `product_name(product_name_en)` (page-title 클래스, 뱃지/sku 없음). breadcrumb "포인트 설정".
- **기본 포인트 설정 카드**(repay_config form): 포인트 지급여부(is_repay 라디오 Y 지급/N 미지급) + 포인트 지급방법(readonly plaintext "회원등급별 차등 지급"). "포인트 설정저장".
- **추가 포인트 설정 카드**(add_repay_config form): 추가 포인트("주문금액의" + add_repay number + repay_type select[%/원]) + 추가 포인트 지급기간(start_dt ~ end_dt, input-mask "0000-00-00 00:00", required). "추가 포인트 설정".
- **추가 포인트 진행이력 카드**: 테이블 — 추가 포인트(repay_type=="%"→"주문금액의 {point} %" / 그 외→"{number_format(point)} {type}") · 지급기간(start_dt~end_dt) · 지급여부(repay_flag) · 비고(빈칸). getAddRepayHistory.
- 인터랙션: 각 저장 self 리다이렉트(reload). 기본=UPDATE, 추가=INSERT(이력 누적).

## 데이터 (legacy)
- 로드: tbl_goods_item(is_repay/product_name/product_name_en) + getAddRepayHistory(tbl_add_repay).
- **repay_config**: UPDATE tbl_goods_item.is_repay → self.
- **add_repay_config**: INSERT tbl_add_repay(product_code, start_dt(strtotime→Y-m-d H:i:s), end_dt, repay_point=add_repay, repay_type, reg_date=now()) → self.
- 초기 start_dt/end_dt 미정의(빈값).

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/repay`** — `{ product{product_name,product_name_en}, is_repay, add_repay_history[{repay_point,repay_type,start_dt,end_dt,repay_flag}] }`. 없으면 404.
- **`PUT /admin/goods/options/:productCode/repay`** — body `{ is_repay }`(Y|N) → UPDATE. `{ success }`. reload.
- **`POST /admin/goods/options/:productCode/repay/add`** — body `{ add_repay, repay_type, start_dt, end_dt }` → tbl_add_repay INSERT(이력 추가). `{ success }`. reload.
  - 백엔드: start_dt/end_dt strtotime 정규화, reg_date, repay_flag 산정.

## 타겟 매핑
- 라우트: `routes/goods/goods_option_repay_register.tsx`(search product_code) → `screens/goods-option-repay`.
- 위젯: `widgets/option-sub-nav`(active="repay", gameType=""(sales처럼) — repay 응답에 game_type 없음).
- entities/goods-option 확장: `OptionRepayData`/`OptionRepayHistory`/요청 타입 + `fetchOptionRepay`/`saveRepay`/`addRepay` + `useOptionRepay`/`useSaveRepay`(invalidate)/`useAddRepay`(invalidate).
- 헬퍼: `shared/lib/input-mask`(start_dt/end_dt).
- mock: `repayStore`(is_repay) + `addRepayHistoryStore` + 핸들러.
- 시각: 카드/라디오/입력/이력 legacy 클래스 그대로. product_viewer 시 저장 버튼 숨김.

## Parity 체크리스트
- [ ] page-title product_name(영문), breadcrumb "포인트 설정"
- [ ] 기본 포인트: is_repay 라디오 + 지급방법 readonly + 저장
- [ ] 추가 포인트: add_repay/repay_type/기간(input-mask) + 저장(INSERT 이력)
- [ ] 진행이력 테이블(%/원 표기 분기, 지급기간, repay_flag)
- [ ] product_viewer 버튼 숨김
