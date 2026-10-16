# 파트너 영역 기반 (사이드바 전환 + 파트너 계정 관리)

> P2 파트너·정산 영역의 첫 단위. order/statistics 영역 기반 선례를 따라 **사이드바 전환**(PARTNER_SIDE_NAV + resolveSideNav `/partner`)과 **topbar 진입 화면**(`partner_list.php` = 파트너 계정 관리)을 한 단위로 이관한다.

## 원본
- 파일:
  - `pc/_Admin_/inc/sidebar_partner.php` (사이드바, 라이브 — 변형/테스트 파일 없음)
  - `pc/_Admin_/partner/partner_list.php` (진입 화면, `$topmenu['partner']='active'`, page_title "파트너 계정 관리")
  - 데이터: `src/classes/AdminPartner.php::getPartnerMemberList()`
- 참조 문서: `docs/legacy-admin/70-partner-code-china.md`, `../legacy-project/docs/PARTNER-SETTLEMENT.md`

## 화면·플로우

### 사이드바 (sidebar_partner.php)
- 로고 링크 `/_Admin_/main.php` + 2개 그룹, **둘 다 `collapse show`(초기 펼침)** → order/statistics의 아코디언과 달리 `expandAll=true`(site/board/china 방식).
- 그룹 아이콘 legacy `<i class="uil-shop">`(기본 크기). 대시보드 link 없음.
- 트리(라벨 → href, `.php` 제거):
  ```
  파트너 관리 (id=sidebarPartner)
  ├─ 파트너 현황            /partner/partner_code
  ├─ 파트너 계정 관리       /partner/partner_list
  ├─ 파트너 PG수수료 관리   /partner/partner_pg_fee
  └─ 파트너 알림 주소록 관리 /partner/partner_email
  리포트 관리 (id=sidebarPartnerReport)
  ├─ Sales list 동기화     /partner/sales_list
  ├─ Refund list 동기화    /partner/refund_list
  ├─ 리포트 생성           /partner/report_register
  └─ 리포트 내역           /partner/report_list
  ```
- 주의: "파트너 현황" 라벨의 링크는 `partner_code.php`(파트너 코드 관리). 라벨/href 그대로 유지. 이번 단위는 사이드바 전 항목을 노출하되 실제 라우트는 `partner_list`만 생성(나머지는 순차 이관 시 생성 — goods/order 선례).

### 진입 화면 (partner_list.php = 파트너 계정 관리)
- 진입 URL: `/partner/partner_list` (topbar `partner` 메뉴 진입점, 이미 배선됨: `widgets/topbar/model/menu.ts`)
- GET 파라미터: `page`(기본 1), `search_publisher_name`(LIKE), `report_term`(등호), `is_system`(등호)
  - **검색 폼 UI는 렌더링되지 않음.** 파라미터는 서버 코드가 읽어 WHERE에 반영하나 화면에 폼 요소가 없다(URL로만 필터 가능). `getSupplierList()` 결과도 화면에서 미사용(dead fetch). → 이관 시 검색 폼 미구현, URL 파라미터만 계약에 유지.
- 화면 요소:
  - breadcrumb: 홈 / 파트너 / 파트너 관리 / 파트너 계정 관리 (앞 3개 `href="javascript: void(0)"`)
  - `h4.page-title`: 파트너 계정 관리
  - 상단 바(`d-flex justify-content-between mb-2`): 좌 `{number_format(total_results)} 개`, 우 `파트너 계정 등록` 버튼(`partner_member_register.php`, `btn btn-danger shadow-none`)
  - 테이블(`table table-centered w-100 nowrap table-sm table-bordered border-light`), thead `table-light`, tbody `bg-white font-12`
  - 6컬럼: 번호 / 파트너(publisher_name, text-start) / 파트너 담당자(name) / 파트너 담당자 계정(id, `partner_member_view.php?idx=` 링크) / 계정상태(flag: `Y`→접속가능, else→접속불가) / 정보수정(**빈 셀**)
  - 하단 `links_html` 서버 페이지네이션(`text-center mt-3 fs-5`)
- 정렬: `a.idx desc`
- 페이지 크기: **50/page**
- **행 번호 quirk(legacy 버그, 그대로 이관)**: `total_results - ($num + ($page-1)*20)`. 페이지 크기는 50인데 오프셋 계수는 **20**을 사용 → 2페이지 이상에서 번호가 어긋남(중복). 원문 동작 유지.
- 분기/리다이렉트: 없음(단순 목록). 등록 버튼은 미이관 라우트(`partner_member_register.php`)로 링크만.
- 세션/권한 의존: `$_SESSION['admin']` 가드(공통 route-guard로 이미 처리). admin_level 서버차단 없음(partner_list는 게이트 대상 아님 — code/publisher만 99 게이트).

## 데이터 (legacy)
- 도메인 클래스·메서드: `AdminPartner->getPartnerMemberList($page,$add_where,$orderby,$param,'50')`, `getSupplierList()`(dead)
- SQL 요약:
  ```sql
  select a.idx,a.id,a.name,a.flag,a.publisher_code,b.publisher_name
  from directgames.tbl_admin_publisher a
  inner join tbl_partner b on a.publisher_code=b.publisher_code
  where b.publisher_code>0 [add_where]
  order by a.idx desc
  -- add_where: and publisher_name like '%{search_publisher_name}%'
  --            and report_term='{report_term}'
  --            and is_system='{is_system}'
  -- 50/page
  ```
  - 조회 대상은 **퍼블리셔 포털 로그인 계정**(`tbl_admin_publisher`)을 파트너 마스터(`tbl_partner`)와 조인한 것. 관리자가 배급사 포털 계정을 관리하는 화면.

## API 계약 (백엔드 전달)

### `GET /admin/partner/members` — 파트너 계정 목록
- 요청(query):
  | 파라미터 | 타입 | 필수 | 설명 |
  |----------|------|------|------|
  | `page` | number | N | 기본 1 |
  | `search_publisher_name` | string | N | 파트너명 부분일치(`publisher_name LIKE '%v%'`) |
  | `report_term` | string | N | 리포트주기 등호(`M`/`T`). UI 없음, URL 전용 |
  | `is_system` | string | N | 시스템 사용 등호(`Y`/`N`). UI 없음, URL 전용 |
- 응답 `200`:
  ```json
  {
    "items": [
      { "idx": 12, "id": "contact@bethesda.com", "name": "홍길동",
        "flag": "Y", "publisher_code": 38, "publisher_name": "Bethesda" }
    ],
    "pagination": { "current_page": 1, "results_per_page": 50, "total_results": 1, "total_pages": 1 }
  }
  ```
- 정렬: `a.idx desc` 고정(전달 orderby 무시).
- 백엔드 책임: `directgames.tbl_admin_publisher a inner join tbl_partner b on a.publisher_code=b.publisher_code where b.publisher_code>0`. 세션 관리자 가드. SQL 인젝션 방지(파라미터 바인딩)는 보안 개선이므로 계약상 동작 동일 전제(원문은 문자열 보간).

## 타겟 매핑
- 라우트: `/partner/partner_list` (`routes/partner/partner_list.tsx`)
- screens: `screens/partner-member-list`
- entities: `entities/partner` (types `PartnerMemberListSearch`/`PartnerMemberItem`/`PartnerPagination`/`PartnerMemberListResponse`, fetcher `fetchPartnerMemberList`, query `usePartnerMemberList`)
- widgets: `widgets/sidebar`(PARTNER_SIDE_NAV + resolveSideNav `/partner`, expandAll=true)
- mock: `shared/mocks/handlers/partner.ts`(`GET /admin/partner/members`) + `handlers.ts` 등록
- 공용: `shared/ui/ServerPagination`

## Parity 체크리스트
- [ ] 사이드바 2그룹·8링크 라벨/순서/href 일치, 둘 다 초기 펼침(expandAll)
- [ ] breadcrumb 4단계 + h4 "파트너 계정 관리"
- [ ] 상단 `{n} 개` + `파트너 계정 등록` btn-danger(미이관 링크)
- [ ] 6컬럼·계정상태 Y=접속가능/else=접속불가·정보수정 빈 셀·계정 링크(partner_member_view 미이관)
- [ ] 검색 폼 미노출(URL 파라미터만)
- [ ] 행 번호 quirk(`($page-1)*20` 오프셋, 50/page)·idx desc·50/page
- [ ] 서버 페이지네이션(links_html → ServerPagination)
