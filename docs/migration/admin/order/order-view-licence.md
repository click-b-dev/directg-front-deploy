# 주문 상세 — 키확인 AJAX (217b, order_view + order_licence)

order_view.php 발송현황 표의 **키확인 버튼** + `order_licence.php` AJAX + `#orderLicence-modal`. 217a(읽기전용 뷰)에 버튼·모달·조회를 추가한다.

## 원본
- 버튼: order_view.php `.btn_licence_view`(data-mode / data-itemorderid) — **Asset 행**(data-mode=`getAssetLicence`, itemorderid=`reserve_id`) · **PointNexus 행**(data-mode=`getPointNexusLicence`, itemorderid=`idx`). Ztorm/Genba/Vaultn 행은 키확인 셀 비어있음(버튼 없음) — 그대로.
- JS(2566~2583): 클릭 → `$.ajax POST order_licence.php {mode, item_order_id}` → 응답 HTML을 `#orderLicence-modal #licence_result`에 주입 후 모달 표시.
- 모달(2122~2138): header bg-primary "키확인" + btn-close, body `#licence_result`, footer "닫기".
- 처리: `order_licence.php`(112줄)

## order_licence.php mode 동작
- **getAssetLicence**: `Asset::runReserveAdmin(item_order_id)` → `{title, key, activatedDt}`. 출력: `list-group` > `li` (title h4 + key p + "제품키 활성화 일자 : (activatedDt)").
- **getPointNexusLicence**: `SELECT * FROM tbl_order_item_pointnexus WHERE idx=:idx LIMIT 1`. 없으면 "발급 정보가 없습니다.". 있으면 `OrderFulfillment_PointNexus::fetchLicenseForView` → `{status, license_key, license_platform, source, error}`:
  - Name(h4)
  - source=='db_fallback'면 `alert-danger`(error + "DB 저장값")
  - status: sold/confirmed → license_key 있으면 key(p)+플랫폼, 없으면 "키 정보를 확인하는 중입니다." / booked → "가상계좌 입금 대기 중인 주문입니다. 입금 완료 후 키가 발급됩니다." / pending_reveal → "예약 판매 상품으로, 출시 후 키가 발급됩니다." / canceled → "환불처리가 완료된 주문입니다." / failed → "주문 처리 중 오류가 발생한 건입니다. 확인이 필요합니다." / default → "주문 처리 중입니다."
- getZtorm/Genba/VaultnLicence: 빈 출력(이 화면 미사용).
- 권한: admin 세션 필수(백엔드).

## API 계약 (백엔드 전달)

### `POST /admin/order/licence`
- 요청: `{ mode: "getAssetLicence"|"getPointNexusLicence", item_order_id: string }`
- 백엔드: getAssetLicence→Asset.runReserveAdmin(reserve_id 라이브 비활성 조회) / getPointNexusLicence→tbl_order_item_pointnexus[idx] + PointNexus 라이브 조회(실패 시 DB 폴백). admin 권한 강제.

**응답 200**
```json
{
  "mode": "getAssetLicence",
  "asset": { "title": "Cyberpunk 2077 Steam Key", "key": "XXXX-YYYY-ZZZZ", "activated_dt": "2026-07-29 10:05:00" },
  "pointnexus": null
}
```
```json
{
  "mode": "getPointNexusLicence",
  "asset": null,
  "pointnexus": { "found": true, "name": "...", "source": "live", "error": "",
    "status": "sold", "license_key": "AAAA-BBBB", "license_platform": "Steam" }
}
```
- getPointNexusLicence·미발급: `pointnexus.found=false`.

## 타겟 매핑
- entities: `entities/order` 확장 — `OrderLicenceRequest`/`OrderAssetLicence`/`OrderPointNexusLicence`/`OrderLicenceResponse`, `fetchOrderLicence`(POST)/`useOrderLicence`(mutation).
- 스크린: `screens/order-detail` — Asset/PointNexus 행에 키확인 버튼 복원 + `OrderLicenceModal`(React 제어) 추가. 클릭 → mutation → 모달에 결과 렌더(legacy HTML 조각 재현: list-group/alert/status 메시지).
- mock: `handlers/order` 확장(`POST /admin/order/licence`).

## Parity 체크리스트
- [ ] 버튼 노출 — Asset 행(reserve_id)·PointNexus 행(idx)만, Ztorm/Genba/Vaultn 없음
- [ ] 모달 — bg-primary "키확인" 헤더·닫기, 결과 영역
- [ ] getAssetLicence 렌더 — title/key/활성화 일자
- [ ] getPointNexusLicence 렌더 — Name·db_fallback alert·status별 메시지(sold/confirmed/booked/pending_reveal/canceled/failed/default)·미발급
- [ ] 흐름 — 클릭 시 조회 후 모달 표시
