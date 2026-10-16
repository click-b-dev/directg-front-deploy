# 승인대기 할인 프로모션 (목록 + 파일업로드 + 승인/삭제 + 다운로드)

> P1 #170. legacy `promotion_ready.php` + `promotion_ps.php` + `promotion_ready_download.php`. 할인 프로모션(`tbl_promotion_schedule`)의 `confirm='N'`(승인대기) 목록 + 엑셀 업로드 등록 + 승인처리/전체삭제/개별삭제 + xls 다운로드.

## 원본
- 파일: `pc/_Admin_/promotion/promotion_ready.php` (라이브, 사이드바 `할인 프로모션 관리 > 승인대기 할인 프로모션`)
- 처리기: `pc/_Admin_/promotion/promotion_ps.php` (mode: file_register/confirm/delete_all/delete; register는 빈 케이스 dead)
- 다운로드: `pc/_Admin_/promotion/promotion_ready_download.php` (POST, application/vnd.ms-excel `.xls`)
- 도메인: `src/classes/AdminPromotion.php::getPromotionReady`(line 11), `src/classes/AdminGoods.php::getPublisherName`(611)·`getGoodsItemPublisher`
- 참조: `docs/legacy-admin/50-promotion-event.md` §승인대기, `../legacy-project/docs/PROMOTION-EVENT-OPS.md`

## 화면·플로우
- 진입 URL: `/promotion/promotion_ready` (파라미터 `page`)
- `$page_title="승인대기 프로모션"`. breadcrumb: 홈 / 프로모션 / 할인 프로모션 관리 / **승인대기 프로모션**(active). h4 동일.
- **검색필터 카드는 legacy에서 전체 HTML 주석 처리 → 미노출.** (PHP는 `search_key`/`search_value`(search_name=product_name/en LIKE, search_product_code=등호)·`search_confirm`을 GET에서 읽어 where 구성하나 이를 구동하는 UI가 없음 → dead. 이식 시 검색 UI 없음, 목록 엔드포인트는 `page`만.)
- 상단 카드 "할인 프로모션 등록": `<form method=post enctype=multipart action=promotion_ps.php>` hidden `mode=file_register` + `<input type=file name=promotion_file required>` + 제출 버튼 "할인 프로모션 등록".
- 카운트 줄: `총 <strong id=total class=text-danger>{number_format(total)}</strong> 개` (float-start).
- 버튼(**total>0일 때만**, float-end): `승인처리`(btn-primary btn-sm #btn_promotion_confirm) · `전체삭제`(btn-danger btn-sm #btn_promotion_delete) · `승인대기 프로모션 다운로드`(btn-success btn-sm #btn_promotion_ready_download).
- 목록 테이블(10컬럼, `table-centered nowrap table-sm table-bordered`, thead `table-light font-13`, tbody `font-12 bg-white`):

| # | 헤더 | 셀 | 비고 |
|---|------|----|------|
| 1 | 공급처 | `getPublisherName(publisher_code)` | text-center |
| 2 | 옵션상품코드 | product_code | text-center |
| 3 | 옵션상품명 | product_name`<br/>`(product_name_en) | text-start(기본) |
| 4 | 할인률<br/>(승인할인률) | discount_rate%`<br/>`(p_discount_rate%) | text-end |
| 5 | SRP<br/>(승인SRP) | number_format(consumer_price) 원`<br/>`(number_format(promotion_srp) 원) | text-end |
| 6 | 프로모션<br/>할인 판매가 | number_format(sale_price) 원 | text-end |
| 7 | 시작일자(w150) | `<span class=num>`promotion_start | text-center p-0 |
| 8 | 종료일자(w150) | `<span class=num>`promotion_end | text-center p-0 |
| 9 | 승인상태(w80) | confirm(raw, 목록은 항상 'N') | text-center |
| 10 | 비고(w90) | 삭제버튼 `<button class="btn btn_delete" data-idx data-product><i class=mdi mdi-delete font-18>` | text-center |

- 빈 목록: `<td colspan=10>승인대기중인 할인 프로모션이 없습니다.</td>`
- 페이지네이션: `links_html`(ServerPagination), **30/page**, order `a.promotion_start desc,a.promotion_end desc`.
- 목록 SQL(getPromotionReady): `select a.*,b.product_srp,b.product_name,b.product_name_en from tbl_promotion_schedule a inner join tbl_goods_item b on a.product_code=b.product_code where a.confirm='N'` + order.

### 분기/JS 동작
- **승인처리**: `confirm("승인처리 하시겠습니까?")` → AJAX POST `mode=confirm` → `update tbl_promotion_schedule set confirm='Y' where confirm='N'`(전체) → success `location.relaod()`.
- **전체삭제**: `confirm("전체삭제 하시겠습니까?")` → AJAX POST `mode=delete_all` → `delete ... where confirm='N'` → success `location.relaod()`.
- **개별삭제**: `confirm(product_name+" 할인 프로모션 일정을 삭제하시겠습니까?")` → AJAX POST `mode=delete&idx` → `delete ... where idx` → success `location.relaod()`.
- **다운로드**: 동적 `<form action=promotion_ready_download.php method=post>` 생성·submit → xls 다운로드(confirm='N'만, `tbl_promotion_schedule a join tbl_goods_item b join tbl_publisher c`).
- **업로드(file_register)**: MIME `type`을 `/`로 분해 → 뒷부분이 `vnd.openxmlformats-officedocument.spreadsheetml.sheet`(xlsx) 또는 `csv`만 허용, else `echo "엑셀파일 확장자(xls,xlsx,csv)외에는 사용이 불가합니다."; exit`. **quirk: 실제 `.xls`(application/vnd.ms-excel)는 거부됨**(라벨과 불일치). 통과 시 `tmp/YmdHis.ext` 저장 → PHPExcel 파싱(2행부터 A~J) → `tbl_promotion_schedule` `ON DUPLICATE KEY UPDATE`(할인율은 `round(x*100)`, publisher_code는 `getGoodsItemPublisher(product_code)` 보강) → `go("promotion_ready.php")`(리다이렉트).

### legacy 버그 (이식 대상)
- **`location.relaod()` 오타**(reload 아님): 승인처리·전체삭제·개별삭제 AJAX success 콜백이 ReferenceError로 실패 → **목록이 자동 갱신되지 않음**. 서버 반영은 되지만 수동 새로고침 전까지 화면 변화 없음. → **뮤테이션 성공 후 invalidate 하지 않음(오타 버그 이식)**. 업로드만 서버 `go()` 리다이렉트가 정상 동작 → invalidate(신규 로드 재현).

## 데이터 (legacy)
- 도메인: `AdminPromotion::getPromotionReady($page,$add_where,$orderby,$param)` — 위 SQL, 30/page.
- 퍼블리셔명: `AdminGoods::getPublisherName(publisher_code)` = `select publisher_name from tbl_publisher where publisher_code=:code`.
- 뮤테이션 SQL: 위 JS 동작 참조.

## API 계약 (백엔드 전달)
신규 슬라이스 `entities/promotion`. 엔드포인트:

- `GET /admin/promotion/promotion-ready?page` → `{ items: PromotionReadyListItem[], pagination }`
  - SQL: `tbl_promotion_schedule a join tbl_goods_item b on a.product_code=b.product_code where a.confirm='N'` order `a.promotion_start desc,a.promotion_end desc`, 30/page.
  - `publisher_name`은 백엔드가 `tbl_publisher`(publisher_code)로 resolve해 응답에 포함(행별 lookup 대체).
  - item: `{ idx, publisher_name, product_code, product_name, product_name_en, discount_rate, p_discount_rate, consumer_price, promotion_srp, sale_price, promotion_start, promotion_end, confirm }` (금액/할인율 number, 날짜 'YYYY-MM-DD HH:MM:SS').
- `POST /admin/promotion/promotion-ready/upload` (`{ file_name, file_type }`) → `{ success, message? }`
  - **백엔드 책임**: 확장자 검증(MIME 뒷부분 xlsx/csv만, `.xls` 거부 quirk 유지) → 엑셀 A~J 파싱 → `tbl_promotion_schedule` upsert(할인율 round×100, publisher_code=getGoodsItemPublisher). 검증 실패 시 `{ success:false, message:"엑셀파일 확장자(xls,xlsx,csv)외에는 사용이 불가합니다." }`.
  - 프론트는 파일 실체 대신 `file_name`+`file_type`(MIME)만 전송(#27 title-image 업로드 선례). 실제 저장/파싱은 백엔드.
- `POST /admin/promotion/promotion-ready/confirm` → `{ success }` (`update ... set confirm='Y' where confirm='N'`, 전체).
- `DELETE /admin/promotion/promotion-ready` → `{ success }` (`delete ... where confirm='N'`, 전체=delete_all).
- `DELETE /admin/promotion/promotion-ready/:idx` → `{ success }` (개별삭제).
- `POST /admin/promotion/promotion-ready/download` → xls 스트리밍(application/vnd.ms-excel attachment `promotion_ready_list_{Ymd}.xls`, confirm='N', join tbl_publisher). **native form POST**(브라우저 다운로드), MSW mock 불가(#155/#168 선례). 백엔드 책임.

응답 타입: `entities/promotion/model/types.ts`.

## 타겟 매핑
- 라우트: `routes/promotion/promotion_ready.tsx` (validateSearch page) → `PromotionReadyScreen`
- 스크린: `screens/promotion-ready/`
- entities: `entities/promotion/` (신규 슬라이스)
- mock: `shared/mocks/handlers/promotion.ts` (신규) + `handlers.ts` 등록. fixture는 legacy 형태(confirm='N' 승인대기 행) 재현. 업로드 mock은 file_type MIME 검증만 재현(파싱 없음).

## 파리티 결정 사항 (게이트 확인 대상)
1. **`location.relaod()` 오타 버그 이식**: 승인처리·전체삭제·개별삭제 성공 후 **목록 자동 갱신 안 함**(legacy 관찰 동작). 서버 반영은 되므로 수동 새로고침 시 반영. 다른 단위(`location.reload()`→invalidate) 관례와 달리 여기선 오타로 미동작 → 미invalidate로 이식. (대안: 정상 reload 의도로 보고 invalidate. 원하시면 변경.)
2. **검색필터 미노출**: legacy 검색 카드가 전체 주석 → UI 없음. 목록은 page만.
3. **업로드 `.xls` 거부 quirk**: MIME `application/vnd.ms-excel`(.xls)는 거부, xlsx/csv만 허용(라벨 "xls,xlsx,csv"와 불일치) 이식.
4. **다운로드 native form POST**: 백엔드 스트리밍 엔드포인트로 직접 POST, mock 불가(dev에서 백엔드 부재 시 미동작) — #155/#168 선례.
5. **승인상태 컬럼**: 목록은 항상 confirm='N'(raw 'N' 표시), legacy 그대로.

## Parity 체크리스트
- [ ] 업로드 카드(file required + 등록 버튼) 마크업 일치
- [ ] 카운트/버튼(total>0 조건) 일치
- [ ] 10컬럼 헤더·셀 포맷(할인율/SRP 2줄·number_format 원·span.num 날짜) 일치
- [ ] 빈 목록 colspan=10 메시지 일치
- [ ] 승인처리/전체삭제/개별삭제 confirm 문구·미갱신 동작 일치
- [ ] 다운로드 form POST 일치
- [ ] 30/page·정렬 일치
