# 실물상품 목록 (대표상품 레벨) (#50)

> 영역: 상품 > 대표상품 관리 > 실물상품 목록. sidebar_goods "실물상품 목록"(대표상품 관리 그룹). **title 레벨** — tbl_goods, `title_code='12'` + `sales_status<>'E'`. #16 디지털상품 목록(title_list)의 자매(카드형)이나 카드 내용 상이(관련옵션상품 택배 카운트 + 상품정보제공고시).

## 원본
- 파일: `accessories_list.php`(533줄). page_title "실물상품 목록". 데이터: `Admin::getGoodsAccessoriesList($page,$where,'title_id desc',$param)`, `AdminGoods::getGoodsAccessoriesCount(title_id, status, delivery_type)`, tbl_title_attribute_set.
- 참조: [title-list](../../MIGRATION-MAP.md)(#16, 카드 셸), [goods-etc-list](goods-etc-list.md)(#49, 옵션 레벨 실물).

## 화면·플로우
- 진입: `?page&search_*` → `/goods/accessories_list`. page_title/breadcrumb "실물상품 목록"(상위 대표상품 관리).
- **기본 필터(고정)**: `sales_status<>'E' and title_code='12'`. 정렬 title_id desc.
- **검색필터**(대표상품): search_key(대표상품명/코드/퍼블리셔/개발사)+value · 심의등급(radio 10 전체이용가/12/15/19 청불, 색상 뱃지) · 게임 페이지 노출(radio all 전체/Y/N, 기본 all) · 판매상태(radio C 판매예정/S 판매중/E 판매종료). "대표상품 검색".
- 상단: 총 개수 + "대표상품 등록" → title_register.
- **카드(제목당 1개)**:
  - card-header: dropdown(9액션: 자세히보기/기본정보/**상품정보 제공고시**/태그정보/동영상/스크린샷/이미지/상세설명/관련상품) + `title_name (en) [sku]`.
  - card-body 2컬럼(title-a / title-b):
    - **title-a**: 기본정보(대표상품번호/퍼블리셔/제조사) · 진열정보(진열상태 is_view / 판매상태 [판매예정/판매중/판매종료]) · 태그정보(카테고리 뱃지) · **관련옵션상품** 테이블(행: 택배발송/코드+택배발송 × 열: 판매예정(9)/판매중(0)/판매종료(3), getGoodsAccessoriesCount).
    - **title-b**: **상품정보제공고시** 테이블(모델명/품명/KC인증정보(+확인 링크)/정격전압/소비전력/크기/무게/출시년월/제조자/제조국/주요사양/품질보증/AS) — tbl_title_attribute_set.
- 페이지네이션: links_html → ServerPagination.
- 데드코드: btn_steam_sync(트리거 미렌더) → 제외.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/accessories`** — query `{ page, search_key, search_value, search_age_limit, search_is_view, search_sales_status }` → `{ items: AccessoriesListItem[], pagination }`. **백엔드: sales_status≠E && title_code=12 고정 + AND 검색(is_view=all이면 미적용).** 정렬 title_id desc.
  - `AccessoriesListItem = { title_id, title_name, title_name_en, sku, publisher, developer, is_view, sales_status, categories: GoodsTag[], counts: { taekbae_9/0/3, code_9/0/3 }(getGoodsAccessoriesCount dt=2/3), attribute: AttributeSet }`.

## 타겟 매핑
- 라우트: `routes/goods/accessories_list.tsx`(search 필터) → `screens/goods-accessories-list`.
- entities/goods-title 확장: `AccessoriesSearch`/`AccessoriesCounts`/`AccessoriesListItem`/`AccessoriesListResponse` + `fetchAccessoriesList` + `useAccessoriesList`. `GoodsTag`/`AttributeSet`/`GoodsTitlePagination` 재사용.
- 공용: `shared/ui/ServerPagination`.
- mock: `ACCESSORIES_LIST`(title_code=12 샘플 + counts + attribute) + GET 핸들러.
- 시각: 필터폼/카드/2컬럼 테이블 legacy 클래스 그대로.

## Parity 체크리스트
- [ ] page-title "실물상품 목록"(대표상품 관리), sales_status≠E + title_code=12 고정
- [ ] 검색필터(심의등급 색상 뱃지/노출 all·Y·N/판매상태 C·S·E)
- [ ] 카드: 기본정보/진열정보/태그(카테고리)/관련옵션상품 택배 카운트 / 상품정보제공고시 13필드
- [ ] dropdown 9액션, ServerPagination
