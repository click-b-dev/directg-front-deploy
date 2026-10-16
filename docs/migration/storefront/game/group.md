# group 번들/그룹 목록 (thumb/list/grid) — 하드 게이트(세션/기간 가드)

## 원본
- 파일: `pc/game/group_{thumb,list,grid}.html`(라이브 — header GNB "group_thumb.html"(idx 없음)·프로모션 배너/그룹 링크 `?idx=`).
- 참조 문서: `docs/design-system/client.md`. 선례: `screens/promotion-weekend`(access-guard + config 백엔드 위임), `screens/game-list`(목록 동형).

## 화면·플로우
- 진입 URL: `/game/group_{thumb,list,grid}.html?idx={group_idx}` (+ page/필터).
- **접근 가드 (legacy 순서)**:
  1. `tbl_group WHERE idx=:idx AND use_flag='Y'` 조회. `use_flag != 'Y'`(미존재 포함) → `msg("잘못된 접근입니다.", "/")` = alert + `/` redirect.
  2. **관리자 화이트리스트**(`$_SESSION['member']['m_id']` ∈ {`sati@h2interactive.co.kr`, `kch821012@gmail.com`})가 **아닐 때만** 기간 체크: `start_date>0 && start_date>time()` 또는 `end_date>0 && end_date<time()` → `msg("프로모션 기간이 아닙니다. 일정을 확인해 주시기 바랍니다.", "/")` = alert + `/` redirect. 관리자는 기간 무관 열람(alert 없음).
  - GNB `/game/group_thumb.html`(idx 없음) → 무효 → 항상 redirect(legacy verbatim 버그).
- page_title = `group_info['subject']`.
- banner: `group_info['banner']` 있으면 `#publisher_info > .card > img src="{banner_domain}upload/banner/{banner}" alt="{subject}"`.
- 목록: `getGoodsGroupList`(INNER JOIN `tbl_group_item`, `b.group_idx={idx}`) — thumb `#thumb_list`/list `#card_list>.row.g-3`/grid `#grid_list`.
- 세션/권한: 공개 SSR(가드는 리다이렉트). **관리자 미리보기 = session 이메일 판정(백엔드 위임)**.

## 필터(game_filter) aside
- aside: product_type=group, promotion=false. → 상품유형(group→표시)·플랫폼·한국어·장르·가격 표시, **프로모션 체크박스 숨김**. `<GameFilter aside={{ productType: true, promotion: false }} />`.

## breadcrumb
- product_type=group → header breadcrumb 렌더. sub_title=""·page_title=subject·sub_title2 없음 → `다이렉트 게임즈 > {subject}`(텍스트).

## SSR·SEO (legacy)
- title={subject} 동적, description/author 빈. **amazonbot meta 없음**(타 게임 페이지와 달리). viewport 동일. canonical/OG/구조화 없음. card-list.css. Splide 없음.

## 데이터 (legacy)
- `tbl_group`(idx,subject,banner,banner_domain,start_date,end_date,use_flag,type…) — 그룹 설정/배너/기간.
- `Goods::getGoodsGroupList($page,$add_where,$orderby,$param,60)` — `tbl_goods_item ⨝ tbl_group_item(b.group_idx=idx)`, 프로모션가/추가적립 LEFT JOIN, `is_view=Y && status=0`.
- 관리자 화이트리스트: `$_SESSION['member']['m_id']`. AJAX/POST: 없음.

## API 계약 (백엔드 전달)
- **`GET /api/game/group`** — 요청: `idx`(필수), `page`, 필터. 응답 `GroupResponse`:
  ```
  {
    access: "ok" | "invalid" | "closed",  // 백엔드 판정(use_flag/기간/관리자세션)
    subject: string,                       // group_info.subject (page_title/breadcrumb)
    banner: string,                        // group_info.banner 파일명("" 이면 배너 없음)
    bannerDomain: string,                  // group_info.banner_domain
    list: ProductThumb[], page, totalPages, total
  }
  ```
  - `access`: `invalid`=use_flag≠Y/미존재 → alert "잘못된 접근입니다."+/redirect. `closed`=기간밖 & 비관리자 → alert "프로모션 기간이 아닙니다. 일정을 확인해 주시기 바랍니다."+/redirect. **관리자(session)면 기간밖이어도 `ok`**(alert 없이 열람).
  - `ok` 아니면 list/subject 등은 무의미(가드가 redirect).
- 백엔드 책임: tbl_group 조회, 기간+관리자 세션 판정, getGoodsGroupList(b.group_idx), 필터/정렬/페이징.

## 타겟 매핑
- 라우트: `app/(pc)/game/group_{thumb,list,grid}.html/page.tsx`(viewType, idx).
- screen: `screens/game-group` — `GroupAccessGuard`(access invalid/closed 분기 메시지+redirect) + banner 조건부 + filter(promotion 숨김)/order(basePath `/game/group`)/pagination + breadcrumb(subject).
- entities: `entities/game-group`(`getGameGroupList` + `GroupResponse`). widget: `widgets/game-filter`·`game-filter-order`·`breadcrumb`·`entities/product-thumb` 재사용.
- mock: `/api/game/group` handler + fixture(access=ok 샘플 + subject/banner).

## Parity 체크리스트
- [ ] 가드: invalid→"잘못된 접근입니다."+/, closed→"프로모션 기간이 아닙니다. 일정을 확인해 주시기 바랍니다."+/, 관리자 ok
- [ ] idx 없음 → invalid redirect(verbatim)
- [ ] banner 조건부(`#publisher_info`, `{banner_domain}upload/banner/{banner}`)
- [ ] 목록 3뷰 + filter(promotion 숨김) + pagination baseUrl `/game/group_{viewType}.html`+idx
- [ ] breadcrumb `다이렉트 게임즈 > {subject}`
- [ ] SEO title={subject}, amazonbot **없음**
