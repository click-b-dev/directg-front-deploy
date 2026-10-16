# PointNexus - 카탈로그 동기화

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_catalogue_sync.php` (UI), `pointnexus_catalogue_sync_batch.php` (배치 AJAX)
- 데이터: `PointNexus($mode)->runProduct($offset, $limit, '')` → `pointnexus_catalogue` upsert(ON DUPLICATE KEY)
- **클라이언트가 배치를 반복 호출**하며 offset을 증가시키는 실시간 동기화.

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_catalogue_sync?mode&limit`
- limit 정규화: `<10 → 100`, `>100 → 100` (즉 10/50/100)
- page_title `PointNexus 카탈로그 동기화` + h4 `<small>GET /product → pointnexus_catalogue</small>`
- inline style: `.sync-log`(+row-ok/row-fail/row-info/row-batch 색), `.stat-card .stat-value`
- 상단 통계 3카드: DB 적재 전체(db_count_total) / 현재 mode 적재(db_count_mode) / 최근 동기화 시각(last_batch_at)
- 동기화 설정: 환경(autoSubmit) + 배치 크기(10/50/100, onchange 제출) + info alert(환경 설명)
- 동기화 시작/중단 버튼
- 진행 통계 4카드: 현재 offset / 처리된 배치 / 성공 누적 / 실패 누적
- 진행 로그(sync-log)
- **배치 반복 로직(JS)**: 시작 클릭 → `while(true)`:
  - 중단 요청 시 정지
  - `POST catalogue_sync_batch {mode, offset, limit}` → json
  - `!success` → 실패 로그 후 중단
  - 배치 로그(`batch #n offset / 응답=count / 성공 / 실패 / 다음 여부`) + items별 로그(성공 `· id/name` / 실패 `✘ id/name — error`)
  - 통계 갱신(offset+count / batches / ok / fail)
  - `!has_more` → 완료 로그 후 종료, 아니면 `offset += count`

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/catalogue-sync-stats`

- 쿼리: `mode`
- 응답 `200`: `{ db_count_total: number, db_count_mode: number, last_batch_at: string|null }`

### `POST /admin/pointnexus/catalogue-sync-batch`

- 요청: `{ mode, offset, limit }`
- 백엔드 책임: runProduct(offset, limit, '') → `pointnexus_catalogue` upsert(productID 기준). 회차 토큰(offset=0에서 생성)을 update_date에 기록(단종 판정 인덱스). 날짜 정규화·JSON 인코딩은 서버.
- 응답 `200`:
  ```
  { success: boolean, mode, offset, limit,
    count: number, has_more: boolean,
    synced_ok: number, synced_fail: number,
    items: { id: string, name: string, error?: string }[],
    error: string|null
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_catalogue_sync.tsx` → `/goods/pointnexus/pointnexus_catalogue_sync`
- screens: `screens/pointnexus-catalogue-sync`
- entities: `pointnexus` 확장 — `PnCatalogueSyncStats`/`PnCatalogueSyncBatchResult`, `fetchPointNexusCatalogueSyncStats`/`runPointNexusCatalogueSyncBatch`, `usePointNexusCatalogueSyncStats`
- mock: `handlers/pointnexus` 확장 — stats GET + sync-batch POST

## Parity 체크리스트

- [ ] 통계 3카드·limit 정규화(10/50/100)
- [ ] 시작/중단·진행 통계 4카드·로그(색상)
- [ ] 배치 반복(offset 증가·has_more 종료·중단)·items별 로그
- [ ] h4 "GET /product → pointnexus_catalogue"
