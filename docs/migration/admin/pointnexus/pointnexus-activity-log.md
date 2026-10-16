# PointNexus API - 활동로그

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_activity_log.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runActivityLog($offset, $limit, $sort, $sortDirection, $filters)`

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_activity_log?mode&offset&limit&sort&sortDirection&filters`
- 파라미터 정규화: offset(<0 → 0), limit(미지정/<10 → 50, >100 → 100), sort(∈{createdAt,productID,type}, 아니면 createdAt), sortDirection(!=ASC → DESC), filters(null → '')
- page_title `PointNexus 활동 로그 목록` + h4 `<small>GET /activitylog</small>`
- inline style: `.uuid`(11px)
- 검색필터 카드: 환경(autoSubmit=false)/limit(number min10 max100)/sort(select createdAt·productID·type)/sortDirection(DESC·ASC)/filters(text) + hidden `offset=0` + 검색 버튼
- type 색상 맵: sale=success, cancel=danger, refund=warning, revenue=info, reveal=primary (그 외 secondary)
- **offset 기반 페이지네이션(total 존재)**: total=`count`??logs길이, prev_offset=max(0,offset-limit), next_offset=offset+limit. 이전 버튼(offset>0), 다음 버튼(next_offset<total). 상·하단 2곳.
- 분기:
  - `error` → alert-danger + pnExtractError
  - 정상:
    - "전체 **N**개 [· offset+1–min(offset+limit,total) 표시]"
    - 7컬럼:
      1. # (offset+i+1)
      2. type(badge 색상맵, 없으면 '—')
      3. createdAt(`pn_fmt_date`)
      4. 상품: product.genericName(fw-semibold, 있으면) + product.id(uuid 링크→product_view, 있으면) / 없으면 '—'
      5. operationID(uuid 링크→operation, 있으면 / '—')
      6. 로그 ID(uuid)
      7. 보기 링크(→ activity_log_view)
    - empty → "활동 로그가 없습니다." colspan=7
    - `PnJsonBox`

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/activity-logs`

- 쿼리: `mode`, `offset`(0), `limit`(10~100), `sort`(createdAt|productID|type), `sortDirection`(DESC|ASC), `filters`(JSON)
- 백엔드 책임: runActivityLog 호출. `count`는 전체 개수.
- 응답 `200`:
  ```
  { success: boolean,
    data?: { id?, type?, createdAt?, operationID?, product?: { id?, genericName? } }[],
    count?: number,   // 전체 개수
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_activity_log.tsx` → `/goods/pointnexus/pointnexus_activity_log`
- screens: `screens/pointnexus-activity-log`
- entities: `pointnexus` 확장 — `PnActivityLog`, `PnActivityLogResponse`, `fetch/usePointNexusActivityLogs`
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/activity-logs`
- 링크: product_view/operation/activity_log_view 미이관 → `<a href>` 유지

## Parity 체크리스트

- [ ] 필터 5종(+hidden offset=0)·정규화·검색
- [ ] offset 페이지네이션(전체 N개·표시 범위·이전/다음)
- [ ] 7컬럼·type 색상·pn_fmt_date·상품/operationID/로그 ID uuid
- [ ] empty·JSON 박스·h4 "GET /activitylog"
