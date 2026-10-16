# 어드민 — 사이트 설정 · 정책 · 태그 · 템플릿 · API

> 대상: 레거시 PHP 어드민 `pc/_Admin_/` 의 `site/`, `policy/`, `tag/`, `templete/`, `api/` 영역.
> 원본은 읽기 전용. 본 문서는 Next.js 재구현을 위한 동작 계약 기반 문서다.
> 공통 인프라(세션 인증 `$_SESSION['admin']`, `lib/lib.php` 세션가드, DB 2개 `$conn`/`$conn_dgkr`, admin_head+topbar+sidebar+footer 레이아웃, jQuery/Bootstrap5, smarteditor2, `*_list`/`*_view`/`*_form`/`*_ps`/`*_json` 유형 규칙)는 별도 기반 문서를 참조하며 여기서 반복 서술하지 않는다.
> SEO/채널 도메인 계약은 `docs/SEO-CHANNEL.md`, 정책 운영값 지도는 `docs/OPERATION-POLICY-MAP.md`, 운영자 권한 계약은 `docs/ADMIN-AUTHORIZATION.md` 를 단일 진실 원천으로 참조한다.

---

## 개요 (각 영역 정체와 역할)

| 영역 | 정체 | 실제 구현 상태 |
|------|------|----------------|
| `site/` | **사이트 관리** — 유저 스토어프론트에 노출되는 큐레이션 콘텐츠. 메인 배너, 추천/특집 편성, 추천 검색어, 운영서비스 현황. | 배너·추천·검색어 3종은 **DB 연동 완전 동작**. 운영서비스 현황·배너그룹은 골격만 존재하는 미완성 화면. |
| `policy/` | **정책 설정** — 기본정보/약관/상품이미지/운영자권한 등 운영 정책 설정값 관리. | **거의 전부 정적 목업/빈 화면**. 저장 로직이 없는 하드코딩 폼이 대부분. 유일한 실제 저장 동작은 `base_guide_info.php`(안내문구→txt 파일 쓰기)뿐이며 그마저도 부분 구현. `policy/system/*`는 운영자권한 목업(비동작). |
| `tag/` | **상품/콘텐츠 태그 관리** — Steam에서 수집한 태그를 국문 매핑하고 자사 태그그룹 체계(장르/카테고리/플랫폼)에 편성. | 목록·집계는 동작. 태그그룹 지정/등록/삭제 AJAX 동작. **주의: `topmenu`는 `tag`, sidebar는 `sidebar_goods.php`로 사이트 관리가 아닌 상품(goods) 메뉴 소속.** |
| `templete/` | **개발용 페이지 스캐폴드 템플릿**. | `blank.php` 1개만 내용(통계 화면 껍데기 복사본)이 남아있고 `form/list/view.php`는 전부 0바이트 빈 파일. 유저 노출 화면 아님. |
| `api/` (루트) | 담당 범위상 **api/ 루트 공통 엔드포인트**. | **루트에 파일이 존재하지 않음.** `api/`는 `genba/`(14), `naverpay/`(1), `youtube/`(2) 하위 디렉토리만 존재하며 이들은 다른 에이전트 담당. → 본 담당 범위에 마이그레이션할 공통 API 엔드포인트는 **없음**. |

**중요한 사이드바 사실**
- `site/` 화면들의 사이드바는 `inc/sidebar_site.php`. topbar 진입점은 `site/banner_list.php`(=`$topmenu['site']`).
- `policy/*` 화면들도 모두 `$sidebar_file="sidebar_site.php"` + `$topmenu['site']`를 쓴다. 즉 정책 화면은 별도 정책 메뉴가 아니라 사이트 메뉴 트리 하위로 편성될 의도였으나 sidebar_site.php에서 **전부 주석 처리되어 실제 노출 메뉴에는 없다**.
- `tag/*` 화면들은 `$sidebar_file="sidebar_goods.php"` + `$topmenu['tag']` → 상품 메뉴 소속.
- `inc/sidebar_design.php` 와 `inc/sidebar.php` 는 **로고 마크업만 있는 껍데기**(side-nav 메뉴 항목 없음). 실질 메뉴 정보 없음.

---

## 사이트 설정 (site/)

### 메뉴 트리 (`inc/sidebar_site.php`)

활성 노출 메뉴 (주석 아닌 항목만):

```
운영서비스 현황            → /site/dg_operation_service.php
사이트 관리 (collapse)
 ├ 메인배너 관리           → /site/banner_list.php
 ├ 추천 및 특집 관리       → /site/main_recommand.php
 ├ 추천 검색어 관리        → /site/search_recommand.php
 ├ [X] 기획배너 관리       → #   (미구현, href="#")
 └ [X] 인기 게임 관리      → #   (미구현, href="#")
```

sidebar_site.php 하단에는 아래 정책 메뉴 블록이 **전부 HTML 주석(`<!-- -->`)으로 비활성화**되어 있다 (참고용 — 실제 링크 안 됨):
- 기본정책: base_info / base_agreement / base_private / base_refund / base_youth / base_guide_info
- 시스템관리정책: system/admin_list / system/auth_list / system/menu_list
- 상품관리정책: goods/goods_images_config
- 회원관리정책: member/member_sleep_config / join_auth_config / join_domain_config
- 주문관리정책: order/order_setting / cart_setting / wishlist_setting / point_setting

> `sidebar_site.php`의 `href`는 `<?=$document_root?>` 접두사를 사용한다.

### 페이지별 정의

#### 운영서비스 현황 — `site/dg_operation_service.php`
- 유형: view (정적 골격)
- 기능: 운영 중인 외부 서비스(시스템분류/서비스분류/용도/내용/기간/제공업체/운영관리업무) 표를 보여주려는 화면.
- 정책·규칙: 없음. **테이블 `<thead>`만 있고 `<tbody>` 및 데이터 조회 로직이 전혀 없다** → 빈 표.
- 데이터소스: 없음.
- 폼필드·파라미터: 없음.
- 연계: topbar `$topmenu['site']` 진입 시 사이드바 첫 항목.
- 참조: 마이그레이션 시 데이터 원천 미정 → 정적 안내표 또는 보류 대상.

#### 메인배너 관리 (목록) — `site/banner_list.php`
- 유형: list (검색필터 + 페이지네이션 + 정렬 AJAX + 삭제 AJAX)
- 기능: 스토어프론트 메인 상단 배너 목록/검색/노출상태 표시/정렬 순서 조정/삭제.
- 정책·규칙:
  - 목록 기본 필터 `is_del='N'`, 정렬 `banner_sort asc`, 페이지당 20건(`AdminSite::getMainbannerList`).
  - 검색: `banner_title` LIKE, `flag`(노출여부 Y/N) 라디오.
  - 상태 뱃지 계산(서버 렌더): `bannerPeriodOutputFl='N'`(상시노출)이면 `flag=Y`→"게시중" / `flag=N`→"게시종료". `bannerPeriodOutputFl='Y'`(기간노출)이면 현재시각과 `banner_start`/`banner_end`(unixtime) 비교로 게시예정/게시중/게시종료.
  - 기간 표기: `date('Y-m-d H:i:s', banner_start~end)`.
  - 배너 이미지 셀은 `banner_pc`를 `banner_link` 링크(target=_blank)로 감싸 표시.
- 데이터소스: `AdminSite`(`src/classes/AdminSite.php`) · 테이블 `tbl_main_banner`.
- 폼필드·파라미터(GET): `page`, `search_banner_title`, `search_flag`.
- 연계: 등록→`banner_register.php`, 수정→`banner_modify.php?idx=`, 정렬/삭제 AJAX→`banner_proc.php`(mode: `banner_sort_up`/`banner_sort_down`/`banner_delete`).
- 참조: SEO-CHANNEL(메인 노출 콘텐츠).

#### 메인배너 등록 — `site/banner_register.php`
- 유형: form (등록)
- 기능: 신규 메인배너 입력 폼. POST `banner_proc.php` (`mode=register`).
- 정책·규칙:
  - 필수(required): banner_title, banner_pc, banner_mobile, banner_link, banner_target, banner_publisher, flag, banner_sort. 기간노출 선택 시 banner_start/banner_end required(JS 토글).
  - 노출여부 `flag` 기본 N, 기간 `bannerPeriodOutputFl` 기본 Y(기간노출). 상시노출(N) 선택 시 날짜 필드 숨김+required 해제(JS).
  - **링크 URL 자동생성**: `product_code`(옵션상품코드, maxlength 8) 입력 후 버튼 → AJAX `banner_proc.php`(`mode=banner_link_search`). 서버가 `tbl_goods_item`에서 game_type별로 유저 URL을 조립해 반환(아래 proc 참조).
  - `show_prod_info`(라벨/상품명 노출), `show_sale_info`(퍼블리셔/가격/출시일 노출) Y/N 라디오.
- 데이터소스: 폼 자체 조회 없음. 저장은 proc.
- 폼필드: banner_title, banner_pc, banner_mobile, product_code, banner_link, banner_target(_self/_blank), banner_publisher, flag(Y/N), bannerPeriodOutputFl(Y/N), banner_start, banner_end, banner_sort, show_prod_info(Y/N), show_sale_info(Y/N).
- 연계: `banner_proc.php`.
- 참조: 날짜는 `data-mask-format="0000-00-00 00:00:00"` 입력마스크, 저장 시 `strtotime()`으로 unixtime 변환.

#### 메인배너 수정 — `site/banner_modify.php`
- 유형: form (수정)
- 기능: `idx`로 `tbl_main_banner` 단건 조회 후 값 채운 폼. POST `banner_proc.php` (`mode=modify`, hidden idx).
- 정책·규칙: register와 동일 필드/검증. 추가로 우측 컬럼에 PC/모바일 배너 이미지 미리보기(`banner_pc`, `banner_mobile`). 조회 시 `banner_start/end`를 `date()`로 문자열 복원, target/flag/기간/show_* 는 selected/checked 매핑.
- 데이터소스: `tbl_main_banner` 직접 `select * where idx=:idx` (클래스 미경유).
- 폼필드·파라미터: GET `idx`. 폼필드는 register와 동일 + hidden idx.
- 연계: `banner_proc.php`.

#### 메인배너 처리 — `site/banner_proc.php`
- 유형: ps (POST 처리, 화면 없음)
- 기능: 배너 CRUD + 링크 자동생성 + 정렬. `AdminGoods` 인스턴스 사용(`getTitleInfo`).
- mode별 동작:
  - `register`: `INSERT INTO tbl_main_banner SET ... reg_date=now()` → `banner_list.php` 이동. banner_start/end는 `strtotime()`.
  - `modify`: `UPDATE tbl_main_banner SET ... WHERE idx=:idx` → 목록 이동.
  - `delete`: **빈 case (동작 없음)**.
  - `banner_link_search`: `tbl_goods_item`에서 `goods_sku,game_type,product_platform` 조회 후 game_type(game/dlc/music/bundle/accessories)별 유저 상세 URL 조립하여 echo. game/accessories는 `getTitleInfo(product_code)['sku']`(product_id)도 사용.
  - `banner_sort_up`: `banner_sort=banner_sort-1`.
  - `banner_sort_down`: `banner_sort=banner_sort+1`.
  - `banner_delete`: `is_del='Y'` (소프트 삭제).
- 데이터소스: `tbl_main_banner`, `tbl_goods_item`, `AdminGoods`.
- 파라미터(POST): mode, idx, banner_* 전체, product_code, show_prod_info, show_sale_info.
- **마이그레이션 주의**: 정렬 up/down이 인접 스왑이 아니라 자기 값만 ±1 (중복/충돌 허용되는 순진한 구현). legacy 동작 그대로 재현할 것.

#### 배너 그룹 — `site/banner_group.php`
- 유형: 스텁 (미완성/오배치)
- 기능: **내용이 "문의하기 목록"이라는 다른 게시판 껍데기.** 배너 그룹과 무관한 복붙 잔재. 데이터/폼 없음.
- 참조: 사이드바에서 링크되지 않음(고아 파일). 마이그레이션 제외.

#### 추천 및 특집 관리 (목록) — `site/main_recommand.php`
- 유형: list
- 기능: 메인 "추천 및 특집" 편성(배너 1 + 연결 상품 4개) 목록/검색/정렬/삭제.
- 정책·규칙:
  - 필터 `is_del='N'`, 정렬 `recommand_sort asc`, 20건/페이지(`getMainRecommandList`).
  - 검색: `recommand_name` LIKE (GET 파라미터명은 혼선 있음 — 입력 name은 `search_recommand_name`이나 코드가 `search_banner_title`도 함께 참조. legacy 그대로 둘 것).
  - 각 행에서 상품 4칸(`recommand_goods_1~4`)을 `AdminGoods::getGoodsOptionSearch()`로 조회해 `product_code / product_name / game_type` 표기.
  - 상태 뱃지: `recommand_start/end`(unixtime)와 현재시각 비교 + `is_view='Y'` → 게시예정/게시중/게시종료.
- 데이터소스: `AdminSite::getMainRecommandList` · 테이블 `tbl_main_recommand`, 상품조회 `AdminGoods`.
- 폼필드·파라미터(GET): page, search_recommand_name(/search_banner_title).
- 연계: 등록→`main_recommand_register.php`, 수정→`main_recommand_modify.php?idx=`, 정렬/삭제 AJAX→`main_recommand_ps.php`(mode: `recommand_sort_up`/`recommand_sort_down`/`delete`).

#### 추천 및 특집 등록 — `site/main_recommand_register.php`
- 유형: form (등록/수정 겸용)
- 기능: idx가 있으면 조회해 `mode=modify`, 없으면 `mode=register`. POST `main_recommand_ps.php`.
- 정책·규칙: 필수 — recommand_name, recommand_start/end(기간 required), recommand_banner(디스크엔 이미지 URL), recommand_banner_link + recommand_banner_target(_self/_blank), recommand_goods_1~4(4칸 모두 required), is_view(Y/N).
- 데이터소스: `tbl_main_recommand` 직접 조회(idx>0 시).
- 폼필드·파라미터: GET idx/mode. 폼: recommand_name, recommand_start, recommand_end, recommand_banner, recommand_banner_link, recommand_banner_target, recommand_goods_1~4, is_view.
- 연계: `main_recommand_ps.php`.

#### 추천 및 특집 수정 — `site/main_recommand_modify.php`
- 유형: form (수정)
- 기능: `main_recommand_register.php`와 거의 동일한 폼(제목만 "추천 및 특집 수정", `mode=modify`). register가 이미 수정 겸용이라 **기능 중복 파일**.
- 연계: `main_recommand_ps.php`.
- 참조: 마이그레이션 시 register/modify를 단일 폼 라우트로 통합 가능(동작 동일 범위 내). 단 legacy는 별도 URL이므로 라우트 매핑 시 두 진입점 모두 지원.

#### 추천 및 특집 처리 — `site/main_recommand_ps.php`
- 유형: ps
- 기능: `tbl_main_recommand` CRUD + 정렬.
- mode별:
  - `register`: INSERT (recommand_name/start/end/banner/banner_link/banner_target/goods_1~4/is_view, reg_date=now()), start/end는 `strtotime()` → `main_recommand.php` 이동.
  - `modify`: UPDATE WHERE idx → 목록 이동.
  - `delete`: `is_del='Y'`.
  - `recommand_sort_up`: `recommand_sort-1`. `recommand_sort_down`: `recommand_sort+1` (배너와 동일한 순진한 정렬).
- 데이터소스: `tbl_main_recommand`, `AdminGoods`(인스턴스만 생성).
- **주의**: `site/main_recommand_view.php`는 **0바이트 빈 파일**.

#### 추천 검색어 관리 — `site/search_recommand.php`
- 유형: list + 슬롯 관리 UI (모달)
- 기능: 유저 페이지에 노출되는 추천 검색어를 **4칸 고정 슬롯(sort 1~4)** 으로 관리. 상단 4슬롯 카드 + 하단 보관/전체 목록.
- 정책·규칙:
  - 슬롯 데이터: `tbl_search_recommand where is_del='N' and is_view='Y' order by recommand_sort asc, idx asc`. `recommand_sort`(1~4)를 슬롯 번호로 사용, 슬롯당 첫 1건만 채택(중복 시 이후 건은 "슬롯밖"으로 하단 노출).
  - 하단 목록: 슬롯에 매핑된 idx 제외 + `is_del='N'` + `keyword` LIKE 검색. 정렬 `is_view desc, recommand_sort asc, idx desc`, 20건/페이지(`getSearchRecommandList`).
  - 클릭수 `click_count` 표시. 링크: `link_url` 있으면 사용, 없으면 자동으로 `/game/game_search_thumb.html?q={keyword}` (유저 검색결과 URL).
  - 슬롯 지정 시 select(1~4)로 노출 슬롯 선택, 기존 슬롯 검색어는 비노출 처리.
- 데이터소스: `AdminSite::getSearchRecommandList` + 직접 쿼리 · 테이블 `tbl_search_recommand`.
- 폼필드·파라미터: GET page/search_keyword. 모달 폼: keyword(필수), link_url(선택).
- 연계 AJAX/POST → `search_recommand_ps.php` (mode: `slot_register`/`slot_assign`/`slot_clear`/`modify`/`delete`).
- 참조: SEO-CHANNEL(검색 채널).

#### 추천 검색어 처리 — `site/search_recommand_ps.php`
- 유형: ps (트랜잭션 사용)
- mode별:
  - `slot_register`: 슬롯(1~4) 유효성 검사. link_url 비면 `/game/game_search_thumb.html?q=keyword`로 채움. 트랜잭션 — 해당 슬롯의 기존 노출건 `is_view='N'`(보관) 후 새 검색어 INSERT(`is_view='Y', recommand_sort=slot`) → 목록 이동.
  - `slot_assign`: 트랜잭션 — 해당 슬롯 기존 노출건 비노출 → 선택 검색어를 `is_view='Y', recommand_sort=slot`으로 노출.
  - `slot_clear`: 해당 idx `is_view='N'` (노출해제/보관).
  - `modify`: keyword/link_url 수정(link_url 비면 자동 URL) → 목록 이동.
  - `delete`: `is_del='Y'` (완전삭제=소프트).
- 데이터소스: `tbl_search_recommand`.
- 파라미터(POST): mode, idx, slot(1~4), keyword, link_url.
- **마이그레이션 주의**: 슬롯 교체는 반드시 트랜잭션(기존 노출 해제 + 신규 노출)으로 원자성 유지. link_url 자동 채움 규칙 준수.

---

## 정책 (policy/ — basic / goods / member / order / system)

> **전체 요지: `policy/` 화면 대부분은 저장 로직 없는 정적 목업 또는 0바이트 빈 파일이다.** 유일하게 실제 파일 I/O가 있는 것은 `basic/base_guide_info.php`↔`base_guide_ps.php`뿐이며 그마저 부분 구현. 정책 설정값을 담는 DB 스키마가 사실상 부재. sidebar_site.php에서 정책 메뉴는 모두 주석 처리됨.

### basic/

#### 기본정보 관리 — `policy/basic/base_info.php`
- 유형: form (정적 목업)
- 기능: 쇼핑몰 기본정보/고객센터/회사정보/파비콘 입력 폼 UI만.
- 정책·규칙: **저장 없음**. `<form>`에 action/method/hidden 없음, 모든 input의 `id="simpleinput"` 중복, value 비어있음.
- 데이터소스: 없음. 폼필드: 쇼핑몰명(국/영), 대표자명, 대표도메인, 쇼핑몰 타이틀, 대표전화/팩스(3분할), 이메일, 운영시간, 상호, 사업자등록번호, 사업장주소, 통신판매신고번호. (전부 미저장)
- 참조: OPERATION-POLICY-MAP. 실제 사이트 기본정보 원천은 별도(코드/conf) 추정 → 마이그레이션 시 실데이터 원천 재확인 필요.

#### 이용약관 관리 — `policy/basic/base_agreement.php`
- 유형: 빈 화면 (헤더/브레드크럼만, `<div class="row"></div>` 비어있음). 목업.

#### 개인정보처리방침 관리 — `policy/basic/base_private.php`
- 유형: 빈 화면. 목업 (base_agreement와 동일 골격).

#### 환불정책 관리 — `policy/basic/base_refund.php`
- 유형: 빈 화면. 목업.

#### 청소년보호정책 관리 — `policy/basic/base_youth.php`
- 유형: 빈 화면. 목업.

#### 안내문구 관리 — `policy/basic/base_guide_info.php`
- 유형: form (부분 동작 — **파일 기반**)
- 기능: 장바구니/주문/문의/마이페이지 각종 안내문구 관리. **DB 아님 — 텍스트 파일 저장.**
- 정책·규칙:
  - 장바구니 안내문구: `fopen("/home/dgkrshop/www/conf/cart.txt", 'r')` 로 읽어 textarea에 출력. POST `base_guide_ps.php`(`mode=cart`).
  - 주문하기 안내문구: textarea만 있고 초기값 로드 없음. `mode=order`.
  - 문의/마이페이지(정보수정/회원탈퇴/사은품/포인트/쿠폰/위시리스트/주문내역) 안내문구: **카드 헤더만 있고 본문 비어있음** (미구현).
- 데이터소스: 파일 `conf/cart.txt` (읽기 경로와 쓰기 경로가 불일치 — 아래 ps 주의).
- 폼필드: cart_msg(textarea), order_msg(textarea).
- 연계: `base_guide_ps.php`.

#### 안내문구 처리 — `policy/basic/base_guide_ps.php`
- 유형: ps (파일 쓰기)
- 기능/규칙:
  - `mode=cart`: `frontend/conf/cart.txt` 존재 시 삭제 후 재생성, 탭(`\t`) 제거(`preg_replace`)하여 append 저장 → `base_guide_info.php` 이동.
  - `mode=order`: `order_msg`만 받고 **저장 로직 없음(빈 처리)**.
  - 자체적으로 `backend/conf/conf.php` + `backend/lib/lib.php`를 include하고 DSN을 직접 조립(다른 정책 파일과 include 경로 상이).
- **마이그레이션 주의(경로 불일치 버그)**: base_guide_info.php는 **읽기 시 `/home/dgkrshop/www/conf/cart.txt`**, base_guide_ps.php는 **쓰기 시 `{DOCUMENT_ROOT}/frontend/conf/cart.txt`** 로 경로가 다르다. legacy에서도 저장 후 화면 재조회 시 반영 안 될 수 있는 상태. 동일성 재현 시 이 경로 계약을 그대로 옮기되(회귀 방지), 유저 프론트가 실제 읽는 경로가 어느 쪽인지 확인 필요.

### goods/

#### 상품이미지 설정 — `policy/goods/goods_images_config.php`
- 유형: form (정적 목업)
- 기능: 대표상품/옵션상품 이미지 규격(width×height) 설정 UI. header/capsule/library/screenshot 등.
- 정책·규칙: **저장 없음**. `<form>` action 없음. value가 하드코딩된 픽셀값으로만 표기:
  - 대표상품: header 460×215, capsule 231×87, library 600×900. 스크린샷 856×481(16:9), 썸네일 120×90(4:3).
  - 옵션상품: header 460×215, capsule 231×87, package (빈값).
  - input type이 전부 `email`인 오타(무해).
- 데이터소스: 없음(하드코딩). 참조: 이 규격값은 유저 스토어프론트 이미지 렌더 계약과 연동 가능성 있음 → 마이그레이션 시 실제 사용처(리사이즈/CDN) 확인.

#### 스크린샷 설정 — `policy/goods/goods_screenshot_config.php`
- 유형: 빈 화면 (헤더/브레드크럼만). 목업.

> `policy/goods/join_auth_config.php` 는 **0바이트 빈 파일** (member 쪽 파일이 오배치된 이름). 사이드바에서도 member 하위로 링크됨.

### member/  — 전부 0바이트 빈 파일 (미구현)

| 파일 | 사이드바 라벨(주석) | 상태 |
|------|--------------------|------|
| `policy/member/member_sleep_config.php` | 휴면 회원 정책 설정 | 0바이트 |
| `policy/member/join_auth_config.php` | 이메일 가입인증 유효기간 | 0바이트 |
| `policy/member/join_domain_config.php` | 회원가입 가능도메인 | 0바이트 |

→ 화면 자체가 없음. 마이그레이션 대상 아님(정책값 원천은 MEMBER-LIFECYCLE 계약 확인).

### order/  — 전부 0바이트 빈 파일 (미구현)

| 파일 | 사이드바 라벨(주석) | 상태 |
|------|--------------------|------|
| `policy/order/order_setting.php` | 주문 설정 | 0바이트 |
| `policy/order/cart_setting.php` | 장바구니 설정 | 0바이트 |
| `policy/order/wishlist_setting.php` | 위시리스트 설정 | 0바이트 |
| `policy/order/point_setting.php` | 포인트 설정 | 0바이트 |

→ 화면 없음. 마이그레이션 대상 아님(정책은 OPERATION-POLICY-MAP / ORDER-WORKFLOW-AUDIT 참조).

### system/  — 운영자 권한 관리 (목업)

> **`policy/system/*` 3종은 전부 동작하지 않는 목업이다.** ADMIN-AUTHORIZATION.md의 실제 권한 계약이 단일 진실 원천이며, 이 화면들은 UI 껍데기일 뿐이다.

#### 운영자 계정 관리 — `policy/system/admin_list.php`
- 유형: 빈 화면 (page-title-box만, 본문 없음). 목업.

#### 운영자 사용권한 관리 — `policy/system/auth_list.php`
- 유형: **비동작 목업 (명시적 제외 대상)**
- 기능: "메뉴 목록"(좌) + "메뉴 등록"(우) 정적 테이블/폼. 하드코딩 예시 행("기본설정 > 시스템관리정책 / 운영자관리 / July 24, 1950") 1개, 수정/삭제 아이콘은 `javascript:void(0)`.
- 정책·규칙: **저장/조회/AJAX 전혀 없음**. 등록 폼 input 전부 `id="simpleinput"` 중복, action 없음.
- 데이터소스: 없음.
- 참조: **운영자 권한 관리 목업 — 마이그레이션 제외.** 실제 권한 모델은 ADMIN-AUTHORIZATION.md 참조.

#### 시스템 메뉴권한 관리 — `policy/system/menu_list.php`
- 유형: 빈 화면 (page-title-box만). 목업.

---

## 태그 (tag/)

> sidebar_file=`sidebar_goods.php`, topmenu=`tag` → **상품 메뉴 소속**(사이트 관리 아님). 도메인 클래스는 `Admin`(AdminSite 아님). Steam 수집 태그를 국문화하고 자사 태그그룹 체계로 편성.

#### TAG 그룹현황 — `tag/tag_group_list.php`
- 유형: list (계층 아코디언)
- 기능: 태그그룹 depth1(대분류) → depth2(중분류 아코디언) → 태그 목록(list-group)의 3계층 조회.
- 정책·규칙: `Admin::getTagGroupList("1")`(depth1), `getTagGroupList("2", parentIdx)`(depth2), `getTagGroupTagList(tags_group_code)`(태그). 하드코딩 `$group_code` 매핑(G=장르,P=플레이어지원,M=분위기/세계관,T=테마/주제,F=기능/콘텐츠,V=시점/그래픽,A=평가,E=기타) 존재하나 화면 렌더에는 미사용.
- 데이터소스: `Admin` · 태그그룹/태그 테이블(클래스 내부). 컬럼: tags_group_code, tags_group_name, tag_code, tag_name, idx.
- 삭제 AJAX(`btn_tag_delete`) → `tag_group_ps.php`(mode 동적).

#### TAG 그룹설정 — `tag/tag_group_setting.php`
- 유형: list + 편성 (AJAX)
- 기능: 태그그룹 미지정 태그 목록에 대해 select로 그룹코드를 골라 배정.
- 정책·규칙: `Admin::getTagGroupNonList()`(그룹 미지정 태그). select 옵션은 **하드코딩된 방대한 그룹코드 목록**(G0, GT001~GT009 게임장르 / C0001~C0005 게임카테고리 / T0001~T0006 게임태그 / P0001~P0005 PlayStation). 배정 버튼(`btn_tag_group`, mode=`tag_group_config`) → `tag_group_ps.php` AJAX, 성공 시 reload.
  - **주의**: 옵션의 selected 매핑 로직(`$selected['tag_group_code'][...]`)이 모든 옵션에 동일 변수로 걸려 있어 실제 selected 동작이 부정확(legacy 버그) — 그대로 옮길 것.
- 데이터소스: `Admin` · `tbl_tags`.
- 폼필드: tag_group_code[](select), 숨은 idx(data-num).

#### TAG 그룹 처리 — `tag/tag_group_ps.php`
- 유형: ps (AJAX 처리)
- mode별:
  - `tag_group_config`: `UPDATE tbl_tags SET tag_group_code=:tag_group_code, tag_code=:tag_code WHERE idx=:idx`. tag_code는 `Admin::setTagcode(tag_group_code)`로 생성. (디버그 `print_r` 잔존)
  - `tag_register`: `INSERT INTO tbl_tags SET tag_name, tag_name_en`.
  - `tag_delete`: `UPDATE tbl_tags SET tag_group_code=null, tag_code=null WHERE tag_name=:tag_name` (그룹 해제).
- 데이터소스: `tbl_tags`, `Admin`.
- 파라미터(POST): mode, tag_group_code, num(idx), tag_name, tag_name_en.

#### TAG별 옵션상품현황 — `tag/tag_goods_count.php`
- 유형: list (집계)
- 기능: Steam 태그별 옵션상품(Game/DLC/Music) 개수 집계 표 + 태그 국문명 인라인 수정/사용등록.
- 정책·규칙: `Admin::getSteamTagCount_v2()`로 태그별 app_type(game/dlc/music) 카운트 집계(music은 dlc_count에 합산). 각 태그마다 `getTagGroupCode()`/`chkTag()` 호출(현재 조건 주석처리되어 전부 표기). 합계 tfoot.
  - **include 경로 특이**: 이 파일만 `document_root="/backend"` 지정 + `backend/conf/conf.php`·`backend/lib/lib.php` include + DSN 직접 조립(다른 tag 파일과 상이).
- 데이터소스: `Admin` · Steam 태그 집계(steam_tag_ko 등), `tbl_goods_item` 계열.
- 폼필드: tag_name[](국문, 수정), tag_name_en[](hidden). 버튼: `btn_tag_modify`(mode=tag_modify), `btn_tag_register`(mode=tag_register) → **`tag_group_ps.php`** AJAX.
  - 주의: `tag_modify` mode는 `tag_group_ps.php`에 **case가 없음**(무동작). legacy 그대로.

#### TAG별 대표상품현황 — `tag/tag_title_count.php`
- 유형: list (집계) — `tag_goods_count.php`와 거의 동일 구조.
- 기능: Steam 태그별 대표상품 수 집계(game_count만 표시, DLC 열 없음) + 국문명 수정/사용등록.
- 데이터소스/연계: 동일(`getSteamTagCount_v2`, `tag_group_ps.php`). include는 표준(`_Admin_/lib/lib.php`).

#### steam 태그 동기화 처리 — `tag/tag_ps.php`
- 유형: ps (배치성 처리)
- 기능: 특정 `appid`의 Steam 태그 JSON 파일을 읽어 DB 반영.
- 정책·규칙:
  - 입력 `appid`(POST 우선, 없으면 GET).
  - 먼저 `DELETE FROM steam_tag_ko WHERE appid=:appid`.
  - `/home/dgkrshop/www/upload/tag/tag_{appid}_ko.json` 읽어(`file_get_contents`+`json_decode`) appid/app_name/tag 추출.
  - 기본 장르 태그(앞서 해보기/멀티플레이어/캐주얼/인디/어드벤처/액션/스포츠/레이싱/전략/시뮬레이션/RPG/싱글 플레이어) **제외**한 나머지를 `steam_tag_ko`에 `INSERT ... ON DUPLICATE KEY UPDATE tag_name`.
  - 모든 태그명을 `tbl_tags`에 `INSERT ... ON DUPLICATE KEY UPDATE update_dt=now()`.
  - 파일 없으면 "저장된 tag정보가 없습니다." echo.
- 데이터소스: 파일 `upload/tag/tag_{appid}_ko.json`, 테이블 `steam_tag_ko`, `tbl_tags`.
- **마이그레이션 주의**: 절대경로 파일 의존 + 하드코딩 제외 태그 목록. 배치/스크립트 성격이라 화면 라우트 아님. Steam 수집 파이프라인 이관 시 별도 취급.

---

## 템플릿 (templete/)

- `templete/blank.php`: 개발용 스캐폴드. 내용은 통계 화면("누적판매순위", topmenu=statistics, sidebar.php) 골격의 빈 복사본. 유저 노출 아님.
- `templete/form.php`, `templete/list.php`, `templete/view.php`: **전부 0바이트 빈 파일**.
- → 마이그레이션 대상 아님(개발 편의용 껍데기).

---

## 공통 API (api/)

- **`api/` 루트에는 파일이 존재하지 않는다.** 하위 디렉토리만 존재:
  - `api/genba/` (14 파일), `api/naverpay/` (1), `api/youtube/` (2) — **모두 다른 에이전트 담당(범위 제외)**.
- → 본 담당 범위(api/ 루트 공통 엔드포인트)에 **마이그레이션할 공통 API는 없음.**

---

## 변형/테스트 파일

- `site/banner_group.php` — "문의하기 목록" 복붙 잔재. 사이드바 미링크 고아. (스텁)
- `site/main_recommand_modify.php` — `main_recommand_register.php`와 기능 중복(register가 수정 겸용).
- `site/main_recommand_view.php` — 0바이트 빈 파일.
- `site/dg_operation_service.php` — thead만 있는 미완성 표.
- `policy/basic/base_agreement.php`, `base_private.php`, `base_refund.php`, `base_youth.php` — 헤더만 있는 빈 목업.
- `policy/basic/base_info.php`, `policy/goods/goods_images_config.php` — 저장 로직 없는 정적 폼 목업.
- `policy/goods/goods_screenshot_config.php` — 빈 목업.
- `policy/goods/join_auth_config.php` — 0바이트(오배치 파일명).
- `policy/member/*` (3), `policy/order/*` (4) — 전부 0바이트 빈 파일.
- `policy/system/admin_list.php`, `menu_list.php` — 빈 목업. `policy/system/auth_list.php` — 비동작 목업(운영자권한).
- `templete/blank.php` — 개발용 스캐폴드. `templete/form.php`/`list.php`/`view.php` — 0바이트.
- `tag/tag_ps.php` — 화면 아닌 Steam 태그 동기화 배치 스크립트.

---

## 마이그레이션 유의점

1. **실제 이관 대상은 site/ 3종뿐**: `banner_*`(목록/등록/수정/proc), `main_recommand_*`(목록/등록/수정/ps), `search_recommand*`(목록/ps). 나머지 site 화면(운영서비스현황·배너그룹)과 policy·templete·api-root는 목업/빈 파일이라 재구현 대상이 아니다. MIGRATION-MAP.md에 "목업/제외"로 표기.

2. **정책설정값 스키마 부재**: policy/ 화면은 정책값을 담는 DB 테이블/폼 저장이 사실상 없다(예외: cart.txt 파일). 정책 실데이터의 진짜 원천은 화면이 아니라 OPERATION-POLICY-MAP / MEMBER-LIFECYCLE / ORDER-WORKFLOW-AUDIT / ADMIN-AUTHORIZATION 계약 문서다. 화면을 그대로 옮기지 말고 계약을 기준으로 설계할 것.

3. **목업 화면 제외 명시**: `policy/system/auth_list.php`(운영자 사용권한 관리)를 비롯한 system/·member/·order/ 화면은 비동작 목업 → 이관 제외. 권한 모델은 ADMIN-AUTHORIZATION.md.

4. **SEO/채널 정확성**: 배너·추천·검색어는 스토어프론트 메인/검색 노출 콘텐츠로 SEO-CHANNEL 계약과 직결. 특히 (a) 배너 링크 자동생성(`banner_link_search`)의 game_type별 유저 URL 조립 규칙, (b) 추천검색어 link_url 미입력 시 `/game/game_search_thumb.html?q={keyword}` 자동 채움, (c) 상태 뱃지의 시간 계산(unixtime `strtotime`/`date`)을 정확히 재현해야 노출·링크 회귀가 없다.

5. **시간/정렬 계약**: 모든 기간 필드는 unixtime로 저장(`strtotime`), 표시는 `date('Y-m-d H:i:s')`. 입력마스크 `0000-00-00 00:00:00`. 정렬 up/down은 인접 스왑이 아니라 자기 sort값 ±1 하는 순진한 구현 → legacy 동작 그대로(중복 sort 허용).

6. **소프트 삭제**: 배너/추천/검색어 삭제는 물리 삭제가 아닌 `is_del='Y'`. banner_proc.php의 `delete` case는 빈 case이고 실제 삭제는 `banner_delete` mode임에 주의.

7. **파일 경로 계약(cart.txt) 불일치**: base_guide_info.php 읽기 경로(`/home/dgkrshop/www/conf/cart.txt`)와 base_guide_ps.php 쓰기 경로(`{DOCUMENT_ROOT}/frontend/conf/cart.txt`)가 다르다. 재구현 시 유저 프론트가 실제 참조하는 경로를 확인하고, 안내문구를 파일이 아닌 DB/설정으로 옮길지 사용자 확인 필요(동작 변경이므로).

8. **태그 영역 소속 주의**: tag/는 사이트가 아니라 상품(goods) 메뉴 소속(`sidebar_goods.php`, `Admin` 클래스). `tag_goods_count.php`는 include 경로가 `/backend`로 특수. `tag_ps.php`/`getSteamTagCount_v2`는 Steam 수집 파이프라인 의존(절대경로 JSON, 하드코딩 제외 태그) → 화면 라우트가 아닌 배치로 별도 이관.
