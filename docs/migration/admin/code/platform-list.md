# 코드 관리 - 플랫폼 설정

## 원본

- 파일: `pc/_Admin_/code/platform_list.php` (라이브)
- 형제: `publisher_list.php`(공급처, 후속), `delivery_method.php`(배송방법, 후속)
- 신규 도메인(코드) — `code` 엔티티 신설.

## 화면·플로우

- 진입 URL/파라미터: `/code/platform_list` (파라미터 없음)
- 성격: **읽기 전용 목록(필터·페이지네이션·수정 없음).**

- 화면 요소 (legacy 기준):
  - page_title `플랫폼 설정` / breadcrumb: 홈 > 상품 > 코드 관리 > 플랫폼 설정
  - `col-6` 카드(우측 col-6 빈칸), 테이블(`table-centered mb-0 table-sm`, thead `table-dark font-14`, tbody `font-13`), 3컬럼:
    - 플랫폼코드 = `idx` / 플랫폼명 = `platform` / 사용여부 = `flag` (raw)
  - 필터·페이지네이션 없음.

## 데이터 (legacy)

- `Admin::getPlatformList()` — idx, platform, flag.

## API 계약 (백엔드 전달)

### `GET /admin/code/platforms`

- 파라미터 없음.

응답 `200`: `{ "items": [{ "idx": 1, "platform": "Steam", "flag": "Y" }] }`

## 타겟 매핑

- 라우트: `routes/code/platform_list.tsx` → `/code/platform_list`
- screens: `screens/code-platform-list`
- entities: **신규 `code`** — `PlatformCodeItem`/`PlatformListResponse`, `fetchPlatformList`, `usePlatformList`
- mock: **신규 `shared/mocks/handlers/code.ts`**(handlers.ts 등록) — `PLATFORM_LIST` + `GET /admin/code/platforms`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/col-6/3컬럼)
- [ ] 필드 일치 (idx/platform/flag)
- [ ] 분기/플로우 일치 (필터·페이지네이션 없음)
- [ ] 엣지케이스 일치 (빈 목록)
