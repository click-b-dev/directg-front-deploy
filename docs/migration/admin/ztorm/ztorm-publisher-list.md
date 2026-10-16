# Ztorm API - 퍼블리셔 현황

## 원본

- 파일: `pc/_Admin_/goods/ztorm/ztorm_publisher_list.php` (라이브)
- 엔티티: 기존 `ztorm` 확장.

## 화면·플로우

- 진입 URL/파라미터: `/goods/ztorm/ztorm_publisher_list` (파라미터 없음)
- 성격: **읽기 전용 목록(필터·페이지네이션·mutation 없음).**

- 화면 요소 (legacy 기준):
  - page_title `Ztorm 퍼블리셔 현황` / breadcrumb: 홈 > 상품 > Ztorm 관리 > Ztorm 퍼블리셔 현황
  - 테이블(`table-centered w-100 nowrap table-sm table-bordered border-light`, thead `table-light font-14`, tbody `font-13 bg-white`), 4컬럼:
    - 퍼블리셔번호 = `publisher_id` / 퍼블리셔명 = `publisher_name` / 상품수 = `cc` / 동기화 = **빈칸**(legacy 버튼 없음)

## 데이터 (legacy)

- `AdminGoods::getZtormPublisher()` — publisher_id, publisher_name, cc(상품수).

## API 계약 (백엔드 전달)

### `GET /admin/ztorm/publishers`

- 파라미터 없음.

응답 `200`: `{ "items": [{ "publisher_id": "...", "publisher_name": "...", "cc": 12 }] }`

## 타겟 매핑

- 라우트: `routes/goods/ztorm/ztorm_publisher_list.tsx` → `/goods/ztorm/ztorm_publisher_list`
- screens: `screens/ztorm-publisher-list`
- entities: `ztorm` 확장 — `ZtormPublisherItem`/`ZtormPublisherListResponse`, `fetchZtormPublisherList`, `useZtormPublisherList`
- mock: `ztorm.ts` — `ZTORM_PUBLISHER_LIST` + `GET /admin/ztorm/publishers`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/4컬럼)
- [ ] 필드 일치 (publisher_id/name/cc, 동기화 빈칸)
- [ ] 분기/플로우 일치 (필터·mutation 없음)
