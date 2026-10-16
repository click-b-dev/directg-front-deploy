# 대표상품 심의정보 설정확인 (#51)

> 영역: 상품 > 대표상품 관리 > 심의정보 등록확인. sidebar_goods "심의정보 등록확인". **title 레벨 단순 테이블** — `age_limit is null`(심의정보 미등록 대표상품 확인용). 검색폼은 결정등급 라디오만.

## 원본
- 파일: `title_grac_chk.php`(301줄). page_title "대표상품 심의정보 설정확인". 데이터: `Admin::getGoodsList($page,$where,'release_date desc',$param)`, `getGameGrac(rateno)`(등급 상세).
- 참조: [title-list](../../MIGRATION-MAP.md)(#16, getGoodsList), [accessories-list](accessories-list.md)(#50).

## 화면·플로우
- 진입: `?page&search_age_limit` → `/goods/title_grac_chk`. page_title/breadcrumb "대표상품 심의정보 설정확인"(상위 대표상품 관리).
- **기본 필터(고정)**: `age_limit is null`(+ is_view='Y' 기본). 정렬 release_date desc.
- **검색필터**: 결정등급(search_age_limit radio 10 전체이용가/12/15/18 청불/0 미등록, 색상 뱃지) + "대표상품 검색". (⚠️ 주1: 기본 age_limit IS NULL이라 특정 등급 선택 시 결과 없음 — legacy quirk.)
- 상단: 총 개수.
- **테이블(9열)**: 대표상품코드(title_id) / 대표상품명(title_name + en) / 출시일(release_date) / 등급분류번호(rateno) / 등급분류기관(grac.orgname) / 신청업체명(grac.entname) / **결정등급(grac.rateddate)** / **등급분류일자(grac.givenrate)** / 비고(심의정보 설정 버튼 → title_grac_register). (⚠️ 주2: 결정등급/등급분류일자 열의 헤더-값 매핑이 legacy에서 rateddate/givenrate로 어긋남 — 그대로 이식.)
- grac 상세는 rateno 있을 때만 getGameGrac 조회.
- 페이지네이션: links_html → ServerPagination.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/grac-chk`** — query `{ page, search_age_limit }` → `{ items: GracChkListItem[], pagination }`. **백엔드: age_limit IS NULL && is_view='Y' 고정 + search_age_limit 적용(=선택 시 사실상 빈결과).** 정렬 release_date desc.
  - `GracChkListItem = { title_id, title_name, title_name_en, release_date, rateno, grac: GracInfo | null }` (rateno 있을 때 getGameGrac).

## 타겟 매핑
- 라우트: `routes/goods/title_grac_chk.tsx`(search 필터) → `screens/goods-title-grac-chk`.
- entities/goods-title 확장: `GracChkSearch`/`GracChkListItem`/`GracChkListResponse`(경량) + `fetchGracChkList` + `useGracChkList`. `GracInfo`/`GoodsTitlePagination` 재사용.
- 공용: `shared/ui/ServerPagination`.
- mock: `GRAC_CHK_LIST`(age_limit 미설정 title + rateno + grac) + GET 핸들러(:titleId보다 먼저 등록).
- 시각: 검색폼/테이블 legacy 클래스 그대로. 결정등급 색상 뱃지, 열 매핑 legacy 유지.

## Parity 체크리스트
- [ ] page-title "대표상품 심의정보 설정확인", age_limit is null 목록
- [ ] 결정등급 라디오(색상 뱃지 10·12·15·18·0)
- [ ] 9열 테이블(rateno/grac orgname·entname·rateddate·givenrate) + 심의정보 설정 버튼
- [ ] 열 매핑·quirk 그대로, ServerPagination
