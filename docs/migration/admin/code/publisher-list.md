# 코드 관리 - 공급처 설정

## 원본

- 파일: `pc/_Admin_/code/publisher_list.php` (라이브)
- 형제: `platform_list.php`(#65), `delivery_method.php`(후속), `publisher_ps.php`(처리)
- 엔티티: 기존 `code` 확장.

## 화면·플로우

- 진입 URL/파라미터: `/code/publisher_list`
  - `page`, `search_type`(=`publisher_name`), `search_value`
- 성격: **목록 + 검색 + (슈퍼관리자만) 공급처 등록.**

- 화면 요소 (legacy 기준):
  - page_title `공급처 설정` / breadcrumb: 홈 > 상품 > 코드 관리 > 공급처 설정
  - 검색필터 카드(`검색필터`): `공급처명` 라벨 + `search_type` select(`.d-none` 숨김, publisher_name만) + `search_value` text + submit `검색`
  - 상단바: `{total} 개` + **admin_level==99일 때** `공급처 등록` 버튼(모달 트리거)
  - 테이블(`table-hover table-centered w-100 nowrap table-sm table-bordered`, colgroup 5/5/15/5/20/*/5, thead `table-light font-13`, tbody `font-12`), 7컬럼:
    - 번호 = `total-(page-1)*30-num` (num 0-base, **내림차순**)
    - 공급처코드 = `publisher_code` / 공급처명 = `publisher_name` / 사용여부 = `is_view`(raw)
    - 공급처 홈페이지 = `publisher_site`(링크 target=_blank) / 공급처 로고 이미지 = `publisher_image`(있으면 img w-100) / 옵션상품수 = `getPublisherGoodsItemCount(publisher_code)`
  - 페이지네이션(30/page)

### 공급처 등록 모달 (admin_level==99)

- 트리거/모달 모두 `admin_level==99`(슈퍼관리자)만 노출 → `useSuperAdmin()`(session role==="99") 게이트.
- 필드: 공급처코드(등록시 자동생성 안내문구) / 공급처명 *(required) / 공급처 홈페이지 / 공급처 로고 이미지.
- `registerPublisher()`: publisher_name 빈값 → alert("공급처명을 입력해주세요.") + focus. 아니면 `POST publisher_ps.php {mode:register, publisher_name, publisher_link, publisher_logo}` → `{success,message}` → alert(message), success면 reload.
- Bootstrap JS 미로드 → 모달은 React state + `.modal.fade.show`/`.modal-backdrop` + rAF fade-in(기존 패턴 재사용).

## 데이터 (legacy)

- `Admin::getPublisherList($page, $add_where, $orderby=' publisher_name ASC', $param)` — 30/page, base `is_view='Y'`.
- `search_value` 있으면 `{search_type} LIKE '%val%'`(search_type=publisher_name).
- `Admin::getPublisherGoodsItemCount(publisher_code)` — 옵션상품 수.
- 컬럼: `publisher_code, publisher_name, is_view, publisher_site, publisher_image`.

## API 계약 (백엔드 전달)

### `GET /admin/code/publishers`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 30개/page |
| `search_type` | string | `publisher_name` |
| `search_value` | string | LIKE %val% |

백엔드 책임: base `is_view='Y'`, `order by publisher_name ASC`, 항목별 옵션상품수 포함.

응답 `200`: `{ items: [{ publisher_code, publisher_name, is_view, publisher_site, publisher_image, goods_count }], pagination }`

### `POST /admin/code/publishers` (admin_level==99)

legacy `publisher_ps.php mode=register`.
- 요청: `{ publisher_name, publisher_link, publisher_logo }`
- 응답 `200`: `{ success: boolean, message: string }`
- 백엔드 책임: publisher_code 자동 채번, 권한(99) 서버측 강제.

## 타겟 매핑

- 라우트: `routes/code/publisher_list.tsx` → `/code/publisher_list`
- screens: `screens/code-publisher-list`
- entities: `code` 확장 — `PublisherSearch`/`PublisherItem`/`PublisherListResponse`/`RegisterPublisherRequest`, `fetchPublisherList`, `registerPublisher`, `usePublisherList`, `useRegisterPublisher`
- shared: 신규 `shared/lib/use-super-admin`(role==="99"), `shared/ui/ServerPagination`
- mock: `code.ts` — `PUBLISHER_LIST` + `GET /admin/code/publishers` + `POST /admin/code/publishers`

## Parity 체크리스트

- [ ] 화면 요소 일치 (검색/7컬럼/번호 역순/로고 img)
- [ ] 필드/검증 일치 (publisher_name LIKE, 등록 required)
- [ ] 분기/플로우 일치 (99 게이트 등록 모달, register→reload, publisher_name ASC)
- [ ] 엣지케이스 일치 (로고 없음, 홈페이지 링크, 30/page)
