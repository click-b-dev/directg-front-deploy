# Asset 키 다운로드 프록시 (Asset 서버 관리 API 서브 — 화면 없음)

## 원본
- 파일: `pc/_Admin_/goods/asset/asset_download.php` (파일 스트리밍 엔드포인트, **React 화면 아님**)
- 진입: asset_download_list(#163) "다운로드" 버튼(`asset_download.php?po=`)
- 참조: [asset-download-list](asset-download-list.md)(#163)
- 도메인: `AdminAsset::getAssetDownloadLog/setAssetDownloadDecrease`, `Asset::runDownloadReserveFile`

## 성격
- 화면(HTML) 없음. **PIN 암호화 zip을 그대로 브라우저에 스트리밍**하는 다운로드 프록시.
- 처리: PO 검증 → Asset API에서 zip 조회 → 횟수 차감 → `Content-Disposition: attachment` 스트리밍.
- 따라서 이관 산출물은 **API 계약 문서 + 프론트 링크 연결**뿐(스크린/엔티티/라우트 없음).

## 플로우 (legacy)
1. `$_SESSION['admin']` 없으면 `msg("로그인이 필요합니다.", -1)`.
2. `po` 없으면 `msg("PO가 없습니다.", -1)`.
3. `getAssetDownloadLog(po)` 없으면 `msg("등록되지 않은 다운로드 건입니다.", -1)`.
4. `is_finish==='Y'`면 `msg("이미 삭제(finish) 처리된 건입니다.", -1)`.
5. `downloadLimit<=0`이면 `msg("다운로드 가능 횟수를 모두 소진했습니다.", -1)`.
6. `runDownloadReserveFile(po, owner)` — 소유자 `P/{owner}`로 요청. httpCode≠200 또는 body 비면 `msg("다운로드할 수 없습니다. …", -1)`.
7. 성공 → `setAssetDownloadDecrease(po)`(남은 횟수 차감·마지막 다운로드 시각 갱신, `downloadLimit>0` 동시성 조건) → `application/zip`·`attachment; filename="asset_{po}.zip"` 스트리밍.

## API 계약 (백엔드 전달)
- `GET /admin/goods/asset/download?po={po}` — 다운로드 키 zip 프록시(인증 필요)
  - **응답 성공**: `200`, `Content-Type: application/zip`, `Content-Disposition: attachment; filename="asset_{po}.zip"`, body=PIN 암호화 zip 바이너리.
  - **부작용**: 성공 시 남은 다운로드 횟수 1 차감 + 마지막 다운로드 시각 갱신(`downloadLimit>0` 조건, 동시성 대비).
  - **에러(비200)**: 미로그인 / po 없음 / 미등록 건 / finish 처리됨 / 횟수 소진 / Asset API 실패(만료·횟수초과·권한) — legacy는 `msg()`(alert+뒤로). 백엔드는 4xx + 사유 메시지 권장.
  - **백엔드 책임**: 관리자 세션 강제, getAssetDownloadLog 검증, 소유자 `P/{owner}` 서버 요청, 횟수 차감, zip 스트리밍.

## 타겟 매핑
- **화면/엔티티/라우트/mock 없음**(파일 다운로드 엔드포인트).
- 프론트 연결: #163 asset_download_list "다운로드" 버튼을 **백엔드 다운로드 URL**(`{apiBaseUrl}/admin/goods/asset/download?po=`)로 링크 → 브라우저 native 다운로드(legacy `location.href=asset_download.php?po=` 대응). (기존에 SPA 경로로 두었던 것을 백엔드 엔드포인트로 정정)
- MSW mock 불가(바이너리 zip 스트리밍) — 백엔드 구현 대상.

## Parity 체크리스트
- [ ] #163 다운로드 버튼이 백엔드 다운로드 엔드포인트로 연결
- [ ] 계약에 검증 6단계·횟수 차감·zip attachment·에러 케이스 명시
- [ ] 프론트 화면 미생성(엔드포인트 성격) 확인
