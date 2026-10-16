import { apiClient } from "@shared/api/client";
import type {
  CreateTitleRequest,
  CreateTitleResponse,
  AddMediaRequest,
  AttributeSetRequest,
  GoodsMutationResponse,
  GoodsTitleDetail,
  ImageDownloadRequest,
  ImageUploadRequest,
  SaveDescriptionRequest,
  SaveDescriptionV2Request,
  ScreenshotDownloadRequest,
  ScreenshotSortRequest,
  ScreenshotUploadRequest,
  SyncDescriptionRequest,
  TitleDescription,
  TitleDescriptionV2,
  GoodsTitleListQuery,
  GoodsTitleListResponse,
  AccessoriesSearch,
  AccessoriesListResponse,
  GracChkSearch,
  GracChkListResponse,
  TitleImageChkSearch,
  TitleImageLibraryChkSearch,
  TitleImageVerticalChkSearch,
  TitleImageChkListResponse,
  HeroCapsuleChkRequest,
  HeroCapsuleChkResponse,
  GoodsTitleView,
  GracRequest,
  NewTitleResponse,
  SteamSyncRequest,
  TagsRequest,
  TitleAttributeSet,
  TitleGrac,
  TitleImages,
  TitleMediaSettings,
  TitleScreenshots,
  TitleTags,
  TradeTermsRequest,
  UpdateTitleRequest,
  UpdateTitleResponse,
} from "../model/types";

// legacy Admin::getGoodsList — title_code='33', order title_id desc, 10/page + enrichment.
export const fetchGoodsTitleList = (query: GoodsTitleListQuery) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof GoodsTitleListQuery, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("search_is_view", query.search_is_view);
  set("search_sales_status", query.search_sales_status);
  set("search_age_limit", query.search_age_limit);
  set("search_interface_korean", query.search_interface_korean);
  set("search_subtitle_korean", query.search_subtitle_korean);
  set("search_spoken_korean", query.search_spoken_korean);
  set("search_exclusive_korean", query.search_exclusive_korean);
  return apiClient.get<GoodsTitleListResponse>("/admin/goods/titles", { searchParams });
};

// legacy accessories_list.php — 실물상품 목록(title_code=12, sales_status≠E).
export const fetchAccessoriesList = (query: AccessoriesSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof AccessoriesSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("search_age_limit", query.search_age_limit);
  set("search_is_view", query.search_is_view);
  set("search_sales_status", query.search_sales_status);
  return apiClient.get<AccessoriesListResponse>("/admin/goods/titles/accessories", {
    searchParams,
  });
};

// legacy title_grac_chk.php — 심의정보 설정확인(age_limit is null).
export const fetchGracChkList = (query: GracChkSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.page) {
    searchParams.page = String(query.page);
  }
  if (query.search_age_limit) {
    searchParams.search_age_limit = query.search_age_limit;
  }
  return apiClient.get<GracChkListResponse>("/admin/goods/titles/grac-chk", { searchParams });
};

// legacy title_image_header_chk.php — 이미지(Header) 확인 목록. image_type=header 고정.
export const fetchTitleImageHeaderChkList = (query: TitleImageChkSearch) => {
  const searchParams: Record<string, string> = { image_type: "header" };
  const set = (key: keyof TitleImageChkSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("search_is_view", query.search_is_view);
  set("search_sales_status", query.search_sales_status);
  set("search_domain", query.search_domain);
  return apiClient.get<TitleImageChkListResponse>("/admin/goods/titles/image-chk", {
    searchParams,
  });
};

// legacy title_image_library_capsule_chk.php — 이미지(Library capsule) 확인 목록. image_type=library.
export const fetchTitleImageLibraryChkList = (query: TitleImageLibraryChkSearch) => {
  const searchParams: Record<string, string> = { image_type: "library" };
  const set = (key: keyof TitleImageLibraryChkSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("search_is_view", query.search_is_view);
  set("search_sales_status", query.search_sales_status);
  set("search_domain", query.search_domain);
  set("search_is_library", query.search_is_library);
  return apiClient.get<TitleImageChkListResponse>("/admin/goods/titles/image-chk", {
    searchParams,
  });
};

// legacy title_image_vertical_capsule_chk.php — 이미지(Vertical capsule) 확인 목록. image_type=vertical.
export const fetchTitleImageVerticalChkList = (query: TitleImageVerticalChkSearch) => {
  const searchParams: Record<string, string> = { image_type: "vertical" };
  const set = (key: keyof TitleImageVerticalChkSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("search_is_view", query.search_is_view);
  set("search_sales_status", query.search_sales_status);
  set("search_domain", query.search_domain);
  set("search_is_hero", query.search_is_hero);
  return apiClient.get<TitleImageChkListResponse>("/admin/goods/titles/image-chk", {
    searchParams,
  });
};

// legacy title_ps.php mode=hero_capsule_chk — hero_capsule 완료 체크(appid).
export const heroCapsuleChk = (payload: HeroCapsuleChkRequest) =>
  apiClient.post<HeroCapsuleChkResponse>("/admin/goods/titles/hero-capsule-chk", payload);

// legacy btn_steam_sync — 스팀 동기화(백엔드 steam API 연동).
export const syncSteamTitle = (titleId: number, payload: SteamSyncRequest) =>
  apiClient.post<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/steam-sync`, payload);

// legacy title_register.php 로드 — title_id 채번·uuid sku·product_code prefill.
export const fetchNewTitle = (productCode: string) => {
  const searchParams: Record<string, string> = {};
  if (productCode) {
    searchParams.product_code = productCode;
  }
  return apiClient.get<NewTitleResponse>("/admin/goods/titles/new", { searchParams });
};

// legacy title_ps.php register — INSERT tbl_goods.
export const createTitle = (payload: CreateTitleRequest) =>
  apiClient.post<CreateTitleResponse>("/admin/goods/titles", payload);

// legacy title_modify.php 로드 — SELECT tbl_goods WHERE title_id.
export const fetchTitleDetail = (titleId: number) =>
  apiClient.get<GoodsTitleDetail>(`/admin/goods/titles/${titleId}`);

// legacy title_ps.php modify — UPDATE tbl_goods.
export const updateTitle = (titleId: number, payload: UpdateTitleRequest) =>
  apiClient.put<UpdateTitleResponse>(`/admin/goods/titles/${titleId}`, payload);

// legacy title_view.php 로드 — 상세 read-only 조립.
export const fetchTitleView = (titleId: number) =>
  apiClient.get<GoodsTitleView>(`/admin/goods/titles/${titleId}/view`);

// legacy goods_ps.php delete_youtube — 영상 삭제.
export const deleteTitleMedia = (titleId: number, youtubeMediaId: string) =>
  apiClient.del<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/media/${youtubeMediaId}`);

// legacy title_attribute_set_register.php 로드 — tbl_title_attribute_set.
export const fetchAttributeSet = (titleId: number) =>
  apiClient.get<TitleAttributeSet>(`/admin/goods/titles/${titleId}/attribute-set`);

// legacy title_ps.php attribute_set — 제공고시 UPSERT.
export const updateAttributeSet = (titleId: number, payload: AttributeSetRequest) =>
  apiClient.put<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/attribute-set`, payload);

// legacy title_ps.php attribute_set2 — 거래조건 UPSERT.
export const updateTradeTerms = (titleId: number, payload: TradeTermsRequest) =>
  apiClient.put<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/trade-terms`, payload);

// legacy title_grac_register.php 로드 — tbl_goods 심의정보.
export const fetchGrac = (titleId: number) =>
  apiClient.get<TitleGrac>(`/admin/goods/titles/${titleId}/grac`);

// legacy title_ps.php grac_save — 심의정보 UPDATE.
export const updateGrac = (titleId: number, payload: GracRequest) =>
  apiClient.put<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/grac`, payload);

// legacy title_tag_register.php 로드 — 태그 마스터 + checked.
export const fetchTags = (titleId: number) =>
  apiClient.get<TitleTags>(`/admin/goods/titles/${titleId}/tags`);

// legacy title_tag_ps.php tag_save — genre/category UPDATE.
export const updateTags = (titleId: number, payload: TagsRequest) =>
  apiClient.put<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/tags`, payload);

// legacy title_media_register.php 로드 — 등록 영상 + YouTube 검색 후보.
export const fetchMediaSettings = (titleId: number) =>
  apiClient.get<TitleMediaSettings>(`/admin/goods/titles/${titleId}/media`);

// legacy title_ps.php add_youtube — 영상 추가.
export const addTitleMedia = (titleId: number, payload: AddMediaRequest) =>
  apiClient.post<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/media`, payload);

// legacy title_screenshot_register.php 로드 — 등록 스크린샷 + steam 후보.
export const fetchScreenshots = (titleId: number) =>
  apiClient.get<TitleScreenshots>(`/admin/goods/titles/${titleId}/screenshots`);

// legacy steam_image_download.php screenshot_delete — 스크린샷 삭제.
export const deleteScreenshot = (titleId: number, screenshotNum: number) =>
  apiClient.del<GoodsMutationResponse>(
    `/admin/goods/titles/${titleId}/screenshots/${screenshotNum}`,
  );

// legacy title_ps.php screenshot_sort_up/down — sort ∓1.
export const sortScreenshot = (titleId: number, payload: ScreenshotSortRequest) =>
  apiClient.post<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/screenshots/sort`, payload);

// legacy steam_image_download.php — steam 스크린샷 다운로드.
export const downloadScreenshot = (titleId: number, payload: ScreenshotDownloadRequest) =>
  apiClient.post<GoodsMutationResponse>(
    `/admin/goods/titles/${titleId}/screenshots/download`,
    payload,
  );

// legacy title_ps.php screenshot_upload — 직접 업로드(mock: 파일명만).
export const uploadScreenshot = (titleId: number, payload: ScreenshotUploadRequest) =>
  apiClient.post<GoodsMutationResponse>(
    `/admin/goods/titles/${titleId}/screenshots/upload`,
    payload,
  );

// legacy title_image_register.php 로드 — 이미지 슬롯 상태.
export const fetchImages = (titleId: number) =>
  apiClient.get<TitleImages>(`/admin/goods/titles/${titleId}/images`);

// legacy steam_image_download.php — 스팀 이미지 다운로드.
export const downloadImage = (titleId: number, payload: ImageDownloadRequest) =>
  apiClient.post<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/images/download`, payload);

// legacy title_ps.php {type}_upload — 직접 업로드(mock: 파일명만).
export const uploadImage = (titleId: number, payload: ImageUploadRequest) =>
  apiClient.post<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/images/upload`, payload);

// legacy title_description_register.php 로드 — 설명 필드들.
export const fetchDescription = (titleId: number) =>
  apiClient.get<TitleDescription>(`/admin/goods/titles/${titleId}/description`);

// legacy 필드별 저장(description_save2/save3/requirements_save/legal_text_save/short_description_save/region_msg_save).
export const saveDescriptionField = (titleId: number, payload: SaveDescriptionRequest) =>
  apiClient.put<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/description`, payload);

// legacy get_steam_game_info.php — 상세설명/시스템요구사항 steam 동기화.
export const syncDescription = (titleId: number, payload: SyncDescriptionRequest) =>
  apiClient.post<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/description/sync`, payload);

// legacy title_description_register_v2.php 로드 — SmartEditor2 초기값 + steam 렌더.
export const fetchDescriptionV2 = (titleId: number) =>
  apiClient.get<TitleDescriptionV2>(`/admin/goods/titles/${titleId}/description-v2`);

// legacy title_ps.php description_save_v2 — SE2 HTML 저장.
export const saveDescriptionV2 = (titleId: number, payload: SaveDescriptionV2Request) =>
  apiClient.put<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/description-v2`, payload);

// legacy get_steam_game_info.php description_sync_v2 — steam 동기화.
export const syncDescriptionV2 = (titleId: number) =>
  apiClient.post<GoodsMutationResponse>(`/admin/goods/titles/${titleId}/description-v2/sync`, {});
