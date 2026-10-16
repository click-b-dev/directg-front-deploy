# Genba API - 프로모션 조회

## 원본

- 파일: `pc/_Admin_/goods/genba/genba_promotion_sync.php` (라이브, page_title "Genba 프로모션 조회")
- mutation: `genba_api.php`(api_type=promotion), 다운로드: `genba_ps.php`(mode=download, 엑셀)
- 데이터: `AdminGoods::getGenbaPromotionSchedule()` (`AdminGoods.php:842`)

## 화면·플로우

- 진입 URL: `/goods/genba/genba_promotion_sync?page&promotion_status`
- page_title `Genba 프로모션 조회` / breadcrumb: 홈 > 상품 > Genba 관리 > Genba 프로모션 조회

### 검색필터 (method=get)

- promotion_status: radio 3개 (Scheduled 진행예정 / Live 진행중 / Completed 종료). **기본값 "Scheduled"**.
- 제출: "Genba 프로모션 검색"
- 상태별 where + 페이지 크기:
  - Scheduled: `fromDate>NOW-9h and toDate>NOW-9h`, 50/page
  - Live: `fromDate<=NOW-9h and toDate>=NOW-9h`, 50/page
  - Completed: `fromDate<NOW-9h and toDate<NOW-9h`, **20/page**

### 목록

- 상단: `number_format(total) 개` + 버튼 2개:
  - "Genba 프로모션 동기화"(`btn_genba_promotion_sync`): `GET genba_api.php {api_type:"promotion"}` → alert + reload
  - "Genba 프로모션 다운로드"(`btn_genba_promotion_download`): hidden `downloadFrm`(`method=post action=genba_ps.php target=_blank`, `mode=download`) submit → 엑셀 다운로드
- card-header `Genba 프로모션 일정`
- 테이블 6컬럼:
  1. 번호 = `num + (page-1)*results_per_page` (정순 증가, num 1부터)
  2. Promotion ID (PromotionId)
  3. Promotion Name (Name)
  4. From = `+9h` fromDate
  5. To = `+9h` toDate
  6. Products = `cc` (PromotionId 그룹 count)
- 페이징 (상태별 50/20)

## 데이터 (legacy)

- `getGenbaPromotionSchedule`: `select PromotionId,Name,fromDate,toDate,DiscountPercentage,count(*) as cc from genba_promotion where 1=1 <add_where> group by PromotionId order by fromDate asc,toDate asc,Name asc` · results_per_page 50 or 20

## API 계약 (백엔드 전달)

### `GET /admin/genba/promotions`

- 쿼리: `page`(1), `promotion_status`(기본 Scheduled)
- 백엔드 책임: 상태별 where(NOW-9h 기준 from/to 비교) + group by PromotionId + 정렬. 상태별 페이지 크기(Scheduled/Live=50, Completed=20). fromDate/toDate는 +9h 표시 문자열.
- 응답 `200`:
  ```
  { items: {
      PromotionId, Name,
      fromDate, toDate,  // +9h "YYYY-MM-DD HH:mm:ss"
      cc                 // number (그룹 count → Products)
    }[],
    pagination: { current_page, results_per_page, total_results, total_pages }
  }
  ```

### `POST /admin/genba/promotion-sync`

- 요청: `{}` (legacy api_type=promotion)
- 응답 `200`: `{ message: string }` — 성공 후 재조회.

### `POST /admin/genba/promotion-download`

- 요청: `mode=download` (legacy genba_ps.php download)
- 백엔드 책임: genba_promotion+catalogue 조인 엑셀(`.xls`) 반환(PreLiveState=1, KR 제외 등 서버 SQL). `Content-Disposition: attachment`.
- 프론트: hidden form POST(`target=_blank`)로 트리거(legacy 동일). **MSW로는 파일 응답 재현 불가** → 실제 다운로드는 백엔드 준비 후 검증.

## 타겟 매핑

- 라우트: `routes/goods/genba/genba_promotion_sync.tsx` → `/goods/genba/genba_promotion_sync` (validateSearch: page + promotion_status 기본 Scheduled)
- screens: `screens/genba-promotion-sync`
- entities: `genba` 확장 — `GenbaPromotionItem`, `GenbaPromotionSearch`, `GenbaPromotionListResponse`, `fetchGenbaPromotionSchedule`, `syncGenbaPromotion`, 훅
- mock: `handlers/genba` 확장 — promotions/promotion-sync (download는 백엔드 전용)

## Parity 체크리스트

- [ ] 상태 radio 3종(기본 Scheduled) + 상태별 페이지 크기(50/20)
- [ ] 6컬럼·번호 정순·From/To +9h·Products cc
- [ ] 동기화 버튼 alert+재조회 / 다운로드 폼 제출(target=_blank)
- [ ] 정렬 fromDate/toDate/Name asc
