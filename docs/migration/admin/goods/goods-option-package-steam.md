# 옵션상품 구성정보 — Steam 참고 패널 (#44, package col-4 분리)

> 영역: 상품 > 옵션상품 관리 > 구성정보 설정의 **col-4 "Steam 구성정보 (참고용)"**. #43(package col-8)에서 분리한 후속. steam 패키지/번들 구성 아이템·가격 read-only 표시.

## 원본
- 파일: `goods_option_package_register.php`(col-4, 318~481). steam 조회: `Admin::getSteamPackageItem_v2($packageid)`, `getSteamDLCList_v2`, `getSteamBundleItem($bundleid)`, `Steam::getSteamAppPrice($appid)`.
- 참조: [goods-option-package](goods-option-package.md)(col-8 본체).

## 화면·플로우
- 위치: package 화면 col-4(전량 read-only 참고).
- **card "Steam 구성정보 (참고용)"**:
  - 헤더: `packageid>0`이면 "Steam Package ID : {packageid}", `bundleid>0`이면 "Steam Bundle ID : {bundleid}". (둘 다 표시 가능.)
  - **구성 동기화 버튼**: bundleid>0이면 bundle 동기화, 아니면 packageid>0이면 package 동기화. **⚠️ 주1: legacy 이 페이지 JS에 `bundle_item_sync`/`package_item_sync`/`btn_steam_sync` 클릭 핸들러 없음 → 버튼은 표시되나 동작 없음(dead).** 그대로 이식(no-op).
  - 테이블(bundle_item + package_item 병합): 번호(app_name==""→새로고침 버튼 / 그 외→"미등록") · appid · app_type(game/dlc/music) · app_name · app_price(`getSteamAppPrice/100`, number_format).
  - 합계 행: app_price 총합(total_initial).
- 인터랙션: 없음(read-only). 동기화/새로고침 버튼은 no-op(주1).

## 데이터 (legacy)
- packageid>0 → getSteamPackageItem_v2(package_item). bundleid>0 → getSteamBundleItem(bundle_item).
- 각 appid의 app_price = getSteamAppPrice(appid)['consumer_price']/100. 합계 = 항목 합.
- (dedup: `$goods_package_item`(이 페이지 미정의)와 비교 — 미실행. app_type→item_type switch도 표시 미사용.)

## API 계약 (백엔드 전달)
- **`GET /admin/goods/options/:productCode/steam-package`** — 응답 `{ package_type: "package"|"bundle"|"", packageid, bundleid, items: [{ appid, app_type, app_name, app_price }], total }`. items는 package/bundle 구성 병합. 백엔드: steam API 조회·가격 산정. 없으면 404(옵션상품 미존재). packageid/bundleid 0이면 items=[].

## 타겟 매핑
- feature: `features/option-package-steam`(col-4 참고 카드). package 화면 col-4에 배선.
- entities/goods-option 확장: `OptionSteamPackageItem`/`OptionSteamPackageData` + `fetchOptionSteamPackage` + `useOptionSteamPackage`.
- mock: `steamPackageStore`(product_code → items/type/id) 시드. GET 핸들러.
- 시각: 카드/테이블/합계 legacy 클래스 그대로. 동기화·새로고침 버튼 render(no-op, 주1). product_viewer 시 동기화 버튼 숨김(legacy 가드 있음).

## Parity 체크리스트
- [ ] 헤더 Package/Bundle ID 표시(조건부) + 구성 동기화 버튼(no-op)
- [ ] 구성 아이템 테이블(번호/appid/app_type/app_name/app_price) + 합계
- [ ] 번호 칸: app_name 빈값→새로고침 버튼(no-op) / 그 외→"미등록"
- [ ] product_viewer 동기화 버튼 숨김
- [ ] read-only(인터랙션 없음)
