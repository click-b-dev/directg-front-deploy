# 코드 관리 - 배송방법 설정

## 원본

- 파일: `pc/_Admin_/code/delivery_method.php` (라이브)
- 형제: `platform_list.php`(#65), `publisher_list.php`(#66)
- 엔티티: 기존 `code` 확장.

## 화면·플로우

- 진입 URL/파라미터: `/code/delivery_method` (파라미터 없음)
- 성격: **읽기 전용 목록(필터·페이지네이션·수정 없음).**

- 화면 요소 (legacy 기준):
  - page_title `배송방법 설정` / breadcrumb: 홈 > 상품 > 코드 관리 > 배송방법 설정
  - 테이블(`table-centered mb-0 table-sm table-bordered`, thead `table-dark font-13`, tbody `font-12 bg-white`), 11컬럼:
    - 배송방법코드 = `DELIVERY_METHOD_ID` / 배송방법명 = `METHOD_NAME` / 배송유형 = `DELIVERY_TYPE`
    - 기본 배송비 = `{BASE_FEE}원` (콤마, 붙임) / 무료배송 조건금액 = `{FREE_THRESHOLD} 원` (콤마, **띄어쓰기**)
    - 추적 가능 여부 = `IS_TRACKABLE` / 평균 소요 기간 = `{EXPECTED_DAYS} 일` / 당일 발송 마감시간 = `CUT_OFF_TIME`
    - 도서산간 추가비 여부 = `AREA_SURCHARGE_YN` / 반품 배송비 = `{RETURN_FEE} 원` (콤마, 띄어쓰기) / 사용 여부 = `USE_YN`
  - 필터·페이지네이션 없음.

### 특이/참고

- 금액 포맷 3종: 기본배송비는 `{n}원`(붙임), 무료배송/반품배송비는 `{n} 원`(띄어쓰기) — legacy 그대로.

## 데이터 (legacy)

- `Admin::getDeliveryMethodList()` — DELIVERY_METHOD_ID, METHOD_NAME, DELIVERY_TYPE, BASE_FEE, FREE_THRESHOLD, IS_TRACKABLE, EXPECTED_DAYS, CUT_OFF_TIME, AREA_SURCHARGE_YN, RETURN_FEE, USE_YN.

## API 계약 (백엔드 전달)

### `GET /admin/code/delivery-methods`

- 파라미터 없음.

응답 `200`:
```jsonc
{
  "items": [{
    "DELIVERY_METHOD_ID": "STD", "METHOD_NAME": "일반택배", "DELIVERY_TYPE": "택배",
    "BASE_FEE": 3000, "FREE_THRESHOLD": 50000, "IS_TRACKABLE": "Y", "EXPECTED_DAYS": 2,
    "CUT_OFF_TIME": "14:00", "AREA_SURCHARGE_YN": "Y", "RETURN_FEE": 3000, "USE_YN": "Y"
  }]
}
```

## 타겟 매핑

- 라우트: `routes/code/delivery_method.tsx` → `/code/delivery_method`
- screens: `screens/code-delivery-method`
- entities: `code` 확장 — `DeliveryMethodItem`/`DeliveryMethodListResponse`, `fetchDeliveryMethodList`, `useDeliveryMethodList`
- mock: `code.ts` — `DELIVERY_METHOD_LIST` + `GET /admin/code/delivery-methods`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/11컬럼)
- [ ] 필드 일치 (11필드, 금액 포맷 붙임/띄어쓰기)
- [ ] 분기/플로우 일치 (필터·페이지네이션 없음)
- [ ] 엣지케이스 일치 (빈 목록)
