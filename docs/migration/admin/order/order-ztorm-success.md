# Ztorm 주문완료 리스트 (order_ztorm_success)

O1 영역 Ztorm 주문 관리 첫 화면. tbl_order_item_ztorm(Ztorm API 주문완료) 목록. #208 Asset 주문완료 자매.

## 원본
- 파일: `pc/_Admin_/order/order_ztorm_success.php` (라이브, 변형/테스트 파일 없음)
- 도메인: `AdminOrder::getOrderZtormSuccess()` (`src/classes/AdminOrder.php:443`)
- 참조: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`
- 자매: `order_asset_success.php`(#208) — 목록/기간 로직 유사, 검색필터·컬럼 구성 상이

## 화면·플로우
- 진입 URL: `/order/order_ztorm_success.php` → `/order/order_ztorm_success`
- 파라미터: `page`, `search_ordno`, `search_ztorm_id`, `search_m_id`, `search_start_date`, `search_end_date`, `date_label`
- breadcrumb: 홈 / 주문 / Ztorm 주문 관리 / Ztorm 주문완료. h4 "Ztorm 주문완료"
- sidebar_order.php: Ztorm 주문 관리 그룹(주문대기·**주문완료**·주문실패·주문조회) 중 주문완료

### 검색필터 (card)
- **개별 input 3종**(asset의 search_key select와 다름):
  - 주문번호 `search_ordno` (col-lg-3, 라벨 col-sm-4 / input col-sm-8)
  - Ztorm Product ID `search_ztorm_id` (col-lg-4, 라벨 col-sm-4 / input col-sm-8)
  - 회원아이디 `search_m_id` placeholder "회원아이디(이메일)" (col-lg-4, 라벨 col-sm-3 / input col-sm-9)
- 기간검색: daterangepicker(기본 프리셋 세트 = 선택/오늘/어제/지난7일/지난30일/이번달/지난달/직접선택, autoApply:false, **기본 라벨 "이번달"**). 라벨 col-sm-1 + reportrange col-sm-2 + input-group col-sm-4
- 제출 버튼: "Ztorm 주문 검색"

### 검색·기본값 로직 (legacy 27~72행)
- 기본 기간 **이번달 1일(`date('Y-m-01')`)~이번달 말일(`date('Y-m-t')`)**.
- `search_ztorm_id`→`ztorm_item_id='...'`, `search_ordno`→`ordno='...'`, `search_m_id`→`m_id='...'` (모두 등호).
- **3개 키워드 중 하나라도 있으면** 기간 조건 무시 → start/end 비움, `date_label="전체기간"`.
- 키워드 없고 `date_label=="전체기간"`이면 라벨 초기화("").
- 키워드 없으면 `ord_ymd >= start`, `ord_ymd <= end`.
- 정렬 `idx desc`. `results_per_page=20`(화면이 넘긴 5번째 인자 `'30'`은 4-param 메서드라 무시 — quirk).

### 목록 (table, 8컬럼)
1. **번호** = `total_results-(num+(page-1)*20)` 역순(num 0부터, ×20)
2. 주문일자 (order_date) text-center
3. 주문번호 (ordno) text-center
4. 회원아이디 (m_id) — **text-center 없음(기본 좌측), m_no 없음**(asset과 다름)
5. 상품정보 (product_code + `<br/>` + product_name) text-start — **text-wrap div 없음**(asset과 다름)
6. **Ztorm 정보** (`[`ztorm_item_id`]` + `<br/>` + ztorm_item_name + `<br/>` + `<span class="badge bg-secondary text-light font-11 fw-normal">`ztorm_publisher`</span>`) text-start
7. customer_product_id text-center
8. **키확인** — `<button type="button" class="btn btn-sm btn-info shadow-none" data-customerproductid="...">키확인</button>` (legacy에 클릭 핸들러 없음 → **inert 버튼, 클릭 무동작** 그대로 이식) text-center

- 상단 "N 개"(number_format total_results), 20/page, ServerPagination
- **row 강조 없음**(asset의 bg-danger 없음, 평범한 `<tr>`)
- legacy th `</td>` 오타(키확인 헤더, 215행)는 정상 `</th>`로 정규화
- dead: `$checked['search_pg_provider']`/`$checked['search_payment_method']`(103~104행) — 템플릿에서 미참조 죽은 코드, 미이식

## 데이터 (legacy)
- `AdminOrder::getOrderZtormSuccess($page,$add_where,$orderby,$param)` (5번째 인자 '30'은 시그니처에 없어 무시)
- SQL: `select * from tbl_order_item_ztorm where ztorm_item_id>0 <add_where> order by idx desc`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/ztorm-success`
- 요청: `page`, `search_ordno`/`search_ztorm_id`/`search_m_id`(각 등호, 우선 시 기간무시), `search_start_date`/`search_end_date`(ord_ymd 범위)
- 백엔드: `tbl_order_item_ztorm`, `ztorm_item_id>0`, `idx desc`, `results_per_page=20`.
- 에러: 없음(목록 조회, PDOException 시 legacy는 die).

**응답 200**
```json
{
  "items": [
    {
      "order_date": "2026-07-29 10:03:11",
      "ordno": "ORD2026ZT01",
      "m_id": "ztormuser@example.com",
      "product_code": "GOPT7001",
      "product_name": "사이버펑크 2077",
      "ztorm_item_id": "88123",
      "ztorm_item_name": "Cyberpunk 2077 (Ztorm)",
      "ztorm_publisher": "CD PROJEKT",
      "customer_product_id": "CPID-77-001"
    }
  ],
  "pagination": { "current_page": 1, "total_results": 22, "total_pages": 2 }
}
```

## 타겟 매핑
- 라우트: `src/routes/order/order_ztorm_success.tsx` → `/order/order_ztorm_success` (validateSearch)
- 스크린: `screens/order-ztorm-success`
- entities: `entities/order` 확장 — `OrderZtormSuccessItem`/`OrderZtormSuccessResponse`/`OrderZtormSuccessSearch`, `resolveOrderZtormSuccessSearch`(기본 이번달 1일~말일), `fetchOrderZtormSuccess`/`useOrderZtormSuccess`.
- 공용 UI: `shared/ui/DateRangePicker`(기본 프리셋, emptyLabel="이번달")·`ServerPagination`
- mock: `shared/mocks/handlers/order.ts` 확장(`GET /admin/order/ztorm-success`)

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(3개 개별 input)·8컬럼(Ztorm 정보·customer_product_id·키확인 버튼)
- [ ] 필드/검증 일치 — 기본 이번달 1일~말일·키워드 3종 등호+기간무시·publisher 뱃지·row 강조 없음
- [ ] 분기/플로우 일치 — idx desc·20/page·번호 ×20·키확인 버튼 무동작
- [ ] 엣지케이스 일치 — 빈 목록·m_id 단일(m_no 없음)·상품정보 text-wrap 없음·93일/역순 alert
