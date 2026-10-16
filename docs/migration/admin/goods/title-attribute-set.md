# 대표상품 상품정보 제공고시 설정 (#22)

> 영역: 상품 > 대표상품 관리 > (단일) 상품정보 제공고시 설정. sub_sidebar_title "상품정보 제공고시 설정".

## 원본
- 파일: `pc/_Admin_/goods/title_attribute_set_register.php` (319줄). 처리: `title_ps.php` mode=attribute_set(166~211) / attribute_set2(212~225). 포함: sub_sidebar_title(attribute_set active).
- 참조: [title-modify](title-modify.md), [title-view](title-view.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_attribute_set_register.php?title_id=` → 타겟 `/goods/title_attribute_set_register?title_id=`. `$page_title="대표상품 상품정보 제공고시 설정"`.
- 로드: tbl_goods(title_code/명), tbl_title_attribute_set(attribute_data). 레이아웃 col-2 sub-nav + col-10.
- breadcrumb: 홈/상품/대표상품 관리/상품정보 제공고시 설정. 타이틀 `{title_name}` + `<small>({en})</small>`.
- **폼1 frm2**(mode=attribute_set): 카드 "품목별 재화 등에 관한 정보 (상품 정보 제공 고시)". **title_code 분기**:
  - **33(디지털 콘텐츠)**: manufacturer(제작자/공급자), terms_use(이용조건), applicable_period(이용기간), product_supply_method(상품 제공 방식), main_requirements(최소 시스템 사양, 필수 소프트웨어), cancel_right(청약철회/해제·해지 효과), as_information(소비자 상담 전화번호).
  - **12(소형전자)**: model_name, product_name(품명), kc_safety_infomartion(KC 인증정보), rated_voltage(정격전압), power(소비전력), size(크기mm), weight(무게kg), manufacturing_date(동일모델 출시년월), manufacturer(제조자/수입자), manufacture_country(제조국), main_requirements(주요사양), warranty_service(품질보증기준), as_information(A/S 책임자 전화번호).
  - **그 외 title_code**: 본문 없음(카드 헤더+저장버튼만). ⚠️ legacy는 case 12에서만 card-body div를 닫는 마크업 quirk(브라우저 자동보정) — 타겟은 정상 중첩으로 동일 시각 재현.
  - footer: 저장 "상품 정보 제공 고시 저장"(product_viewer 숨김).
- **폼2 frm3**(mode=attribute_set2): 카드 "거래조건에 관한 정보"(**title_code 무관 항상**): delivery_method_info(재화 배송방법), as_information2(재화 A/S 전화번호). footer: "거래조건에 관한 정보 저장"(product_viewer 숨김).
- 제출: 각 폼 독립. UPSERT 후 `go("title_attribute_set_register.php?title_id=")` = 자기 페이지 reload.

## 데이터 (legacy)
- 로드: `SELECT * FROM tbl_title_attribute_set WHERE title_id`(없으면 빈값).
- **attribute_set UPSERT**(title_ps 166~211): tbl_title_attribute_set SET title_id, model_name, product_name, kc_safety_infomartion, rated_voltage, power, manufacturing_date, manufacturer, manufacture_country, size, weight, main_requirements, warranty_service, as_information, terms_use, applicable_period, product_supply_method, cancel_right ON DUPLICATE KEY UPDATE(동일 필드). 폼 미제공 필드(현재 title_code에 없는)는 filter_input null → 빈값 저장.
- **attribute_set2 UPSERT**(212~225): delivery_method_info, as_information2 ON DUPLICATE KEY UPDATE.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId/attribute-set`** — 응답 `{ title_id, title_name, title_name_en, title_code, attribute: AttributeSet }`. AttributeSet = 위 전체 컬럼(없으면 빈 문자열). 없으면 404.
- **`PUT /admin/goods/titles/:titleId/attribute-set`** — mode=attribute_set UPSERT. body: 제공고시 필드(33/12 합집합; 현재 title_code에 해당하는 값만 채워짐, 나머지 빈값). 응답 `{ success }`.
- **`PUT /admin/goods/titles/:titleId/trade-terms`** — mode=attribute_set2 UPSERT. body: `{ delivery_method_info, as_information2 }`. 응답 `{ success }`.

## 타겟 매핑
- 라우트: `routes/goods/title_attribute_set_register.tsx`(search title_id) → `screens/title-attribute-set`.
- 위젯: `widgets/title-sub-nav`(active="attribute_set").
- entities/goods-title 확장: `AttributeSet`/`TitleAttributeSet` 타입, `fetchAttributeSet`+`useAttributeSet`, `updateAttributeSet`/`updateTradeTerms` + 훅(성공 시 invalidate=페이지 유지).
- mock: 모듈 Map<title_id, AttributeSet>(upsert). GET attribute-set(row+attribute), PUT attribute-set/trade-terms.
- 시각: 카드/폼 legacy 클래스 그대로. title_code 분기 렌더. product_viewer 저장버튼 숨김은 미반영(기존 단위 동일).

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 레이아웃(col-2 sub-nav) + 2개 카드/폼(frm2/frm3)
- [x] title_code 33/12 필드셋 분기, 그 외 빈 본문
- [x] 거래조건 폼(무관 항상), 로드값 반영
- [x] 각 폼 독립 저장 → UPSERT → 페이지 유지(invalidate)
- 보류: product_viewer 저장버튼 숨김 미반영(기존 단위 동일). legacy card-body 미닫힘 마크업 quirk는 정상 중첩으로 동일 시각 재현.
- 기계 검증: tsc 0 / lint 0 / build 성공.
