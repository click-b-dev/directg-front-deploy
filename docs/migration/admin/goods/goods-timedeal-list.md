# 관리자 타임딜 목록 goods_timedeal_list

## 원본
- 파일: `pc/_Admin_/goods/goods_timedeal_list.php` (725줄, 라이브 — 사이드바 `sidebar_goods.php` L319 `[타임딜] 목록` 링크, 주석 아님). 변형 없음(`timedeal_register.php`는 별도 등록 화면).
- 참조: `docs/legacy-admin/`(goods), G1 감사(2026 세션).

## 화면·플로우
- 진입 URL: `/_Admin_/goods/goods_timedeal_list.php?page&search_*`.
- **`goods_option_list.php`와 동일 구조** — 동일 도메인 메서드 `Admin::getGoodsOptionList($page,$add_where,$orderby,$param,N)` 사용. 유일한 차이:
  - `$where[] = "display_type='timedeal'"` **고정**(option_list은 진열그룹 radio로 선택).
  - page_title `[타임딜] 목록`.
  - per-page **30**(option_list 20).
- 검색 필터(legacy): product_code/product_name/product_name_en/platform/status/game_type/supplier/is_free/is_special/is_view/is_bonus/soldout/interface·spoken·exclusive_korean/genre_code.
- 테이블 컬럼: 플랫폼명(getPlatformName)/상태(getProductStatus)/배송(getGoodsItemDeliveryList)/장르·카테고리·태그(getTagName)/타이틀(getTitleID) — option_list과 동일.
- 세션/권한: 관리자 세션(lib.php). 권한은 사이드바 노출(서버 강제는 백엔드).

## 데이터 (legacy)
- 도메인: `Admin::getGoodsOptionList` (= option_list과 동일), `Admin::getSupplierList`(공급사 셀렉트), `AdminGoods::getPlatformName`, `Admin::getProductStatus`/`getTagName`, `AdminGoods::getTitleID`.
- SQL 요약: `tbl_goods`(옵션) WHERE `display_type='timedeal'` + 검색조건, orderby, LIMIT 30/page.

## API 계약 (백엔드 전달)
- **재사용** `GET /admin/goods/options`(기존 option_list 계약, `entities/goods-option` `fetchGoodsOptionList`) — 쿼리 `search_display_type='timedeal'` 고정 전달.
  - 응답: `OptionListResponse`(기존). **신규 계약/증분 없음.**
  - per-page 차이(30 vs 20)는 백엔드 파라미터/기본값 소관(caveat).

## 타겟 매핑
- 라우트: `/goods/goods_timedeal_list` (`src/routes/goods/goods_timedeal_list.tsx`)
- 화면: **`GoodsOptionListScreen` 파라미터화 재사용** — 신규 optional prop `variant`(baseUrl/title/lockedDisplayType). timedeal은 `{ baseUrl:"/goods/goods_timedeal_list", title:"[타임딜] 목록", lockedDisplayType:"timedeal" }`:
  - `search_display_type`를 "timedeal"로 고정(쿼리 강제).
  - 진열그룹(display_type) 검색 radio 블록 숨김(고정값이므로).
  - BASE_URL(페이지네이션·검색폼 링크) = baseUrl.
  - 제목 = title.
  - 기본값(prop 미전달 시) = 현행 option_list 동작 그대로(하위호환).
- entities: `goods-option`(`useGoodsOptionList`/`fetchGoodsOptionList`) **재사용**. mock: 기존 `/admin/goods/options` 핸들러 재사용(필요 시 timedeal fixture 소량 추가).
- **option_list 이관 패턴 계승**: 자유검색이 key/value로 통합된 sibling(option_list) 방식을 그대로 따른다(legacy 개별 필드 → 이미 승인된 통합 검색). timedeal도 동일.

## Parity 체크리스트
- [ ] display_type=timedeal 고정 목록
- [ ] 제목 "[타임딜] 목록"
- [ ] 진열그룹 radio 숨김, 나머지 검색/테이블 = option_list과 동일
- [ ] 페이지네이션/검색폼이 /goods/goods_timedeal_list로 유지
- caveat: per-page 30(백엔드), 자유검색 key/value(option_list 패턴 계승)
