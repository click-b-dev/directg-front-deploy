import { apiClient } from "@shared/api/client";
import type {
  AddPackageRequest,
  GoodsOption,
  GoodsOptionMutationResponse,
  GoodsOptionView,
  NewGoodsOption,
  OptionCategoryData,
  OptionGenreData,
  OptionDescriptionV2,
  OptionImageDownloadRequest,
  OptionImages,
  OptionImageUploadRequest,
  AddDeliveryItemRequest,
  AddPackageUnitRequest,
  DeliverySearchItem,
  DeliverySearchRequest,
  AddRepayRequest,
  DownloadOptionScreenshotRequest,
  OptionPackageData,
  OptionRepayData,
  OptionScreenshotData,
  OptionSteamPackageData,
  PackageOptionSearchResult,
  SaveBonusDescriptionRequest,
  SaveRepayRequest,
  SortOptionScreenshotRequest,
  UploadOptionScreenshotRequest,
  OptionTimedealData,
  SaveOptionTimedealRequest,
  EtcSearch,
  HolomodelsSearch,
  OptionEndSearch,
  OptionImageChkSearch,
  DisknUploadChkRequest,
  OptionScreenshotChkSearch,
  OptionScreenshotChkResponse,
  OptionListQuery,
  OptionListResponse,
  OptionSalesData,
  OptionTagSettingData,
  SaveGoodsOptionRequest,
  SaveOptionCategoryRequest,
  SaveOptionDescriptionFieldRequest,
  SaveOptionDescriptionV2Request,
  SaveOptionGenreRequest,
  SaveOptionPriceRequest,
  SaveOptionSalesRequest,
  SaveOptionSupplierRequest,
  SaveOptionTagRequest,
  SyncOptionDescriptionRequest,
} from "../model/types";

// legacy goods_option_list.php — 옵션상품 목록(필터/페이징).
export const fetchGoodsOptionList = (query: OptionListQuery) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof OptionListQuery, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("search_status", query.search_status);
  set("search_product_platform", query.search_product_platform);
  set("search_supplier_code", query.search_supplier_code);
  set("search_game_type", query.search_game_type);
  set("search_is_view", query.search_is_view);
  set("search_display_type", query.search_display_type);
  set("search_interface_korean", query.search_interface_korean);
  set("search_subtitle_korean", query.search_subtitle_korean);
  set("search_spoken_korean", query.search_spoken_korean);
  set("search_exclusive_korean", query.search_exclusive_korean);
  set("search_is_preorder", query.search_is_preorder);
  set("search_is_bonus", query.search_is_bonus);
  set("search_is_naverpay_coupon", query.search_is_naverpay_coupon);
  set("search_is_auth", query.search_is_auth);
  set("search_soldout", query.search_soldout);
  return apiClient.get<OptionListResponse>("/admin/goods/options", { searchParams });
};

// legacy goods_option_end.php — 판매종료 옵션상품 목록(status=3 고정).
export const fetchOptionEndList = (query: OptionEndSearch) => {
  const searchParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "" && value !== 0) {
      searchParams[key] = String(value);
    }
  }
  return apiClient.get<OptionListResponse>("/admin/goods/options/end", { searchParams });
};

// legacy goods_holomodels_list.php — 홀로모델 옵션상품 목록(status≠3 + holomodels 계열).
export const fetchHolomodelsList = (query: HolomodelsSearch) => {
  const searchParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "" && value !== 0) {
      searchParams[key] = String(value);
    }
  }
  return apiClient.get<OptionListResponse>("/admin/goods/options/holomodels", { searchParams });
};

// legacy goods_etc_list.php — 실물상품 목록(status≠3 + game_type=accessories).
export const fetchEtcList = (query: EtcSearch) => {
  const searchParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "" && value !== 0) {
      searchParams[key] = String(value);
    }
  }
  return apiClient.get<OptionListResponse>("/admin/goods/options/etc", { searchParams });
};

// legacy goods_option_image_chk.php — 옵션상품 Header 이미지 확인 목록(product_platform≠3, product_code desc, 20/page).
export const fetchOptionImageChkList = (query: OptionImageChkSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof OptionImageChkSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("search_status", query.search_status);
  set("search_domain", query.search_domain);
  set("search_is_view", query.search_is_view);
  return apiClient.get<OptionListResponse>("/admin/goods/options/image-chk", { searchParams });
};

// legacy goods_option_ps.php mode=diskn_upload_chk — 디스크엔 등록 완료.
export const disknUploadChk = (payload: DisknUploadChkRequest) =>
  apiClient.post<OkResponse>("/admin/goods/options/diskn-upload-chk", payload);

// legacy goods_option_screenshot_chk.php — DLC 스크린샷 체크 목록(game_type=dlc, release_date desc, 10/page).
export const fetchOptionScreenshotChkList = (query: OptionScreenshotChkSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof OptionScreenshotChkSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_product_code", query.search_product_code);
  set("search_product_name", query.search_product_name);
  set("search_appid", query.search_appid);
  return apiClient.get<OptionScreenshotChkResponse>("/admin/goods/options/screenshot-chk", {
    searchParams,
  });
};

// legacy 등록 진입 — product_code 채번 + goods_sku uuid.
export const fetchNewOption = () => apiClient.get<NewGoodsOption>("/admin/goods/options/new");

// legacy 수정 로드 — tbl_goods_item.
export const fetchOption = (productCode: string) =>
  apiClient.get<GoodsOption>(`/admin/goods/options/${productCode}`);

// legacy goods_option_ps.php register — INSERT tbl_goods_item.
export const createOption = (payload: SaveGoodsOptionRequest) =>
  apiClient.post<GoodsOptionMutationResponse>("/admin/goods/options", payload);

// legacy goods_option_ps.php modify — UPDATE tbl_goods_item.
export const updateOption = (productCode: string, payload: SaveGoodsOptionRequest) =>
  apiClient.put<GoodsOptionMutationResponse>(`/admin/goods/options/${productCode}`, payload);

// legacy goods_option_view.php — 상세보기 통합 조회.
export const fetchOptionView = (productCode: string) =>
  apiClient.get<GoodsOptionView>(`/admin/goods/options/${productCode}/view`);

type OkResponse = { success: boolean };

// legacy delivery_item_delete — DELETE tbl_goods_item_delivery.
export const deleteDeliveryItem = (
  productCode: string,
  body: { item_id: string; order_system: string },
) => apiClient.del<OkResponse>(`/admin/goods/options/${productCode}/deliveries`, { json: body });

// legacy package_delete — setGoodsItemPackageDelete(package_srl).
export const deletePackageItem = (packageSrl: number) =>
  apiClient.del<OkResponse>(`/admin/goods/options/packages/${packageSrl}`);

// legacy goods_ps.php package_add — INSERT tbl_goods_item_package.
export const addPackageItem = (productCode: string, payload: AddPackageRequest) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/packages`, payload);

// legacy bundle_delete — setGoodsItemBundleDelete(bndl_no).
export const deleteBundleItem = (bndlNo: number) =>
  apiClient.del<OkResponse>(`/admin/goods/options/bundles/${bndlNo}`);

// legacy goods_option_genre_register.php — 장르 설정 로드.
export const fetchOptionGenre = (productCode: string) =>
  apiClient.get<OptionGenreData>(`/admin/goods/options/${productCode}/genre`);

// legacy goods_option_genre_ps.php — UPDATE tbl_goods_item.genre.
export const updateOptionGenre = (productCode: string, payload: SaveOptionGenreRequest) =>
  apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/genre`, payload);

// legacy goods_option_category_register.php — 카테고리 설정 로드.
export const fetchOptionCategory = (productCode: string) =>
  apiClient.get<OptionCategoryData>(`/admin/goods/options/${productCode}/category`);

// legacy goods_option_category_ps.php — UPDATE tbl_goods_item.category.
export const updateOptionCategory = (productCode: string, payload: SaveOptionCategoryRequest) =>
  apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/category`, payload);

// legacy goods_option_tag_register.php — 태그 설정 로드.
export const fetchOptionTag = (productCode: string) =>
  apiClient.get<OptionTagSettingData>(`/admin/goods/options/${productCode}/tag`);

// legacy goods_option_tag_ps.php — UPDATE tbl_goods_item.tag + tbl_goods_item_tags upsert.
export const updateOptionTag = (productCode: string, payload: SaveOptionTagRequest) =>
  apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/tag`, payload);

// legacy goods_option_image_register.php — 이미지(header) 설정 로드.
export const fetchOptionImages = (productCode: string) =>
  apiClient.get<OptionImages>(`/admin/goods/options/${productCode}/images`);

// legacy steam_image_download2.php — 스팀 header 이미지 다운로드.
export const downloadOptionImage = (productCode: string, payload: OptionImageDownloadRequest) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/images/download`, payload);

// legacy goods_option_ps.php header_upload — header 이미지 직접 업로드.
export const uploadOptionImage = (productCode: string, payload: OptionImageUploadRequest) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/images/upload`, payload);

// legacy goods_option_description_register_v2.php — 상세설명 V2 로드.
export const fetchOptionDescriptionV2 = (productCode: string) =>
  apiClient.get<OptionDescriptionV2>(`/admin/goods/options/${productCode}/description-v2`);

// legacy goods_option_ps.php description_save2 — description_v2(SE2) 저장.
export const saveOptionDescriptionV2 = (
  productCode: string,
  payload: SaveOptionDescriptionV2Request,
) => apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/description-v2`, payload);

// legacy goods_option_ps.php requirements_save/legal_text_save/short_description_save/region_msg_save — 필드별 저장.
export const saveOptionDescriptionField = (
  productCode: string,
  payload: SaveOptionDescriptionFieldRequest,
) => apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/description-field`, payload);

// legacy get_steam_game_info.php steam_sync_desc — SE2 상세설명 steam 동기화.
export const syncOptionDescriptionV2 = (productCode: string) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/description-v2/sync`, {});

// legacy get_steam_game_info.php steam_sync_system — 시스템요구사항 steam 동기화.
export const syncOptionDescription = (productCode: string, payload: SyncOptionDescriptionRequest) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/description/sync`, payload);

// legacy goods_option_sales_register.php — 판매/가격/공급처/배송아이템 로드.
export const fetchOptionSales = (productCode: string) =>
  apiClient.get<OptionSalesData>(`/admin/goods/options/${productCode}/sales`);

// legacy goods_option_ps.php sales_config — 판매설정 저장.
export const saveOptionSales = (productCode: string, payload: SaveOptionSalesRequest) =>
  apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/sales`, payload);

// legacy goods_option_ps.php price_save — 가격설정 저장(백엔드 discount 재계산).
export const saveOptionPrice = (productCode: string, payload: SaveOptionPriceRequest) =>
  apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/price`, payload);

// legacy goods_option_ps.php supplier_save — 공급처설정 저장.
export const saveOptionSupplier = (productCode: string, payload: SaveOptionSupplierRequest) =>
  apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/supplier`, payload);

// legacy asset/ztorm/genba/vaultn/pointnexus_search — 연동시스템 배송아이템 검색.
export const searchDeliveryItem = (productCode: string, payload: DeliverySearchRequest) =>
  apiClient.post<{ items: DeliverySearchItem[] }>(
    `/admin/goods/options/${productCode}/deliveries/search`,
    payload,
  );

// legacy {system}_add — setGoodsOptionDeliveryItem(배송아이템 추가).
export const addDeliveryItem = (productCode: string, payload: AddDeliveryItemRequest) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/deliveries`, payload);

// legacy goods_option_sales_register.php(timedeal 블록) — 타임딜 설정+이력 로드.
export const fetchOptionTimedeal = (productCode: string) =>
  apiClient.get<OptionTimedealData>(`/admin/goods/options/${productCode}/timedeal`);

// legacy goods_option_ps.php timedeal_config — tbl_timedeal INSERT(이력 누적).
export const saveOptionTimedeal = (productCode: string, payload: SaveOptionTimedealRequest) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/timedeal`, payload);

// legacy goods_option_package_register.php — 구성정보 설정 로드(col-8).
export const fetchOptionPackage = (productCode: string) =>
  apiClient.get<OptionPackageData>(`/admin/goods/options/${productCode}/package`);

// legacy package_view_config — is_package_view 즉시 저장.
export const savePackageView = (productCode: string, payload: { is_package_view: string }) =>
  apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/package-view`, payload);

// legacy goods_option_unit_add — tbl_goods_option_bundle INSERT.
export const addPackageUnit = (productCode: string, payload: AddPackageUnitRequest) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/package-units`, payload);

// legacy goods_option_unit_delete — tbl_goods_option_bundle DELETE(idx).
export const deletePackageUnit = (productCode: string, idx: number) =>
  apiClient.del<OkResponse>(`/admin/goods/options/${productCode}/package-units/${idx}`);

// legacy goods_option_search — 옵션상품 검색(구성추가용).
export const searchPackageOption = (productCode: string, payload: { search_option_code: string }) =>
  apiClient.post<{ item: PackageOptionSearchResult | null }>(
    `/admin/goods/options/${productCode}/package-units/search`,
    payload,
  );

// legacy bonus_description_save — 특전설명(SmartEditor2) 저장.
export const saveBonusDescription = (productCode: string, payload: SaveBonusDescriptionRequest) =>
  apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/bonus-description`, payload);

// legacy goods_option_package_register.php(col-4) — Steam 구성정보 참고(read-only).
export const fetchOptionSteamPackage = (productCode: string) =>
  apiClient.get<OptionSteamPackageData>(`/admin/goods/options/${productCode}/steam-package`);

// legacy goods_option_repay_register.php — 포인트 설정 로드.
export const fetchOptionRepay = (productCode: string) =>
  apiClient.get<OptionRepayData>(`/admin/goods/options/${productCode}/repay`);

// legacy repay_config — is_repay 저장.
export const saveRepay = (productCode: string, payload: SaveRepayRequest) =>
  apiClient.put<OkResponse>(`/admin/goods/options/${productCode}/repay`, payload);

// legacy add_repay_config — tbl_add_repay INSERT(이력 누적).
export const addRepay = (productCode: string, payload: AddRepayRequest) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/repay/add`, payload);

// legacy goods_option_screenshot_register.php — 스크린샷 설정 로드.
export const fetchOptionScreenshots = (productCode: string) =>
  apiClient.get<OptionScreenshotData>(`/admin/goods/options/${productCode}/screenshots`);

// legacy steam_screenshot_download.php(screenshot_delete) — 스크린샷 삭제.
export const deleteOptionScreenshot = (productCode: string, screenshotNum: string) =>
  apiClient.del<OkResponse>(`/admin/goods/options/${productCode}/screenshots/${screenshotNum}`);

// legacy screenshot_sort_up/down — 정렬(sort ∓1).
export const sortOptionScreenshot = (productCode: string, payload: SortOptionScreenshotRequest) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/screenshots/sort`, payload);

// legacy steam_screenshot_download.php — steam 스크린샷 다운로드.
export const downloadOptionScreenshot = (
  productCode: string,
  payload: DownloadOptionScreenshotRequest,
) =>
  apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/screenshots/download`, payload);

// legacy goods_option_ps.php screenshot_upload — 직접 업로드.
export const uploadOptionScreenshot = (
  productCode: string,
  payload: UploadOptionScreenshotRequest,
) => apiClient.post<OkResponse>(`/admin/goods/options/${productCode}/screenshots/upload`, payload);
