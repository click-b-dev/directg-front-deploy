import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTitle,
  addTitleMedia,
  deleteScreenshot,
  deleteTitleMedia,
  downloadImage,
  downloadScreenshot,
  fetchAttributeSet,
  fetchDescription,
  fetchDescriptionV2,
  fetchImages,
  fetchMediaSettings,
  fetchScreenshots,
  saveDescriptionField,
  saveDescriptionV2,
  sortScreenshot,
  syncDescription,
  syncDescriptionV2,
  uploadImage,
  uploadScreenshot,
  fetchGoodsTitleList,
  fetchAccessoriesList,
  fetchGracChkList,
  fetchTitleImageHeaderChkList,
  fetchTitleImageLibraryChkList,
  fetchTitleImageVerticalChkList,
  heroCapsuleChk,
  fetchNewTitle,
  fetchTitleDetail,
  fetchTitleView,
  fetchGrac,
  fetchTags,
  syncSteamTitle,
  updateAttributeSet,
  updateGrac,
  updateTags,
  updateTitle,
  updateTradeTerms,
} from "./fetcher";
import type {
  AddMediaRequest,
  AccessoriesSearch,
  GracChkSearch,
  TitleImageChkSearch,
  TitleImageLibraryChkSearch,
  TitleImageVerticalChkSearch,
  HeroCapsuleChkRequest,
  AttributeSetRequest,
  GoodsTitleListQuery,
  GracRequest,
  ImageDownloadRequest,
  ImageUploadRequest,
  SaveDescriptionRequest,
  SaveDescriptionV2Request,
  ScreenshotDownloadRequest,
  ScreenshotSortRequest,
  ScreenshotUploadRequest,
  SteamSyncRequest,
  SyncDescriptionRequest,
  TagsRequest,
  TradeTermsRequest,
  UpdateTitleRequest,
} from "../model/types";

const GOODS_TITLE_KEY = ["admin", "goods", "titles"] as const;

export const goodsTitleListQueryKey = (query: GoodsTitleListQuery) =>
  [...GOODS_TITLE_KEY, query] as const;

export const useGoodsTitleList = (query: GoodsTitleListQuery) =>
  useQuery({
    queryKey: goodsTitleListQueryKey(query),
    queryFn: () => fetchGoodsTitleList(query),
  });

export const accessoriesListQueryKey = (query: AccessoriesSearch) =>
  [...GOODS_TITLE_KEY, "accessories", query] as const;

// legacy accessories_list.php — 실물상품 목록(title_code=12).
export const useAccessoriesList = (query: AccessoriesSearch) =>
  useQuery({
    queryKey: accessoriesListQueryKey(query),
    queryFn: () => fetchAccessoriesList(query),
  });

export const gracChkListQueryKey = (query: GracChkSearch) =>
  [...GOODS_TITLE_KEY, "grac-chk", query] as const;

// legacy title_grac_chk.php — 심의정보 설정확인.
export const useGracChkList = (query: GracChkSearch) =>
  useQuery({
    queryKey: gracChkListQueryKey(query),
    queryFn: () => fetchGracChkList(query),
  });

export const titleImageHeaderChkListQueryKey = (query: TitleImageChkSearch) =>
  [...GOODS_TITLE_KEY, "image-chk", "header", query] as const;

// legacy title_image_header_chk.php — 대표상품 이미지(Header) 확인 목록.
export const useTitleImageHeaderChkList = (query: TitleImageChkSearch) =>
  useQuery({
    queryKey: titleImageHeaderChkListQueryKey(query),
    queryFn: () => fetchTitleImageHeaderChkList(query),
  });

export const titleImageLibraryChkListQueryKey = (query: TitleImageLibraryChkSearch) =>
  [...GOODS_TITLE_KEY, "image-chk", "library", query] as const;

// legacy title_image_library_capsule_chk.php — Library capsule 이미지 확인 목록.
export const useTitleImageLibraryChkList = (query: TitleImageLibraryChkSearch) =>
  useQuery({
    queryKey: titleImageLibraryChkListQueryKey(query),
    queryFn: () => fetchTitleImageLibraryChkList(query),
  });

export const titleImageVerticalChkListQueryKey = (query: TitleImageVerticalChkSearch) =>
  [...GOODS_TITLE_KEY, "image-chk", "vertical", query] as const;

// legacy title_image_vertical_capsule_chk.php — Vertical capsule 이미지 확인 목록.
export const useTitleImageVerticalChkList = (query: TitleImageVerticalChkSearch) =>
  useQuery({
    queryKey: titleImageVerticalChkListQueryKey(query),
    queryFn: () => fetchTitleImageVerticalChkList(query),
  });

// legacy title_ps.php hero_capsule_chk → alert(응답) + location.reload = invalidate.
export const useHeroCapsuleChk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HeroCapsuleChkRequest) => heroCapsuleChk(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

export const useSyncSteamTitle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: SteamSyncRequest }) =>
      syncSteamTitle(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

// legacy 등록 로드: title_id/sku/prefill. 채번이 매 요청 달라지므로 staleTime 0(기본) 유지.
export const useNewTitle = (productCode: string) =>
  useQuery({
    queryKey: [...GOODS_TITLE_KEY, "new", productCode] as const,
    queryFn: () => fetchNewTitle(productCode),
  });

export const useCreateTitle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTitle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

export const titleDetailQueryKey = (titleId: number) =>
  [...GOODS_TITLE_KEY, "detail", titleId] as const;

// legacy title_modify.php 로드.
export const useTitleDetail = (titleId: number) =>
  useQuery({
    queryKey: titleDetailQueryKey(titleId),
    queryFn: () => fetchTitleDetail(titleId),
  });

// legacy title_ps.php modify → go(title_modify.php?title_id) = 자기 페이지 리로드.
// SPA에서는 detail+list invalidate로 갱신(페이지 유지).
export const useUpdateTitle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: UpdateTitleRequest }) =>
      updateTitle(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

export const titleViewQueryKey = (titleId: number) =>
  [...GOODS_TITLE_KEY, "view", titleId] as const;

// legacy title_view.php 로드.
export const useTitleView = (titleId: number) =>
  useQuery({
    queryKey: titleViewQueryKey(titleId),
    queryFn: () => fetchTitleView(titleId),
  });

// legacy goods_ps.php delete_youtube → location.reload = view invalidate.
export const useDeleteTitleMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, youtubeMediaId }: { titleId: number; youtubeMediaId: string }) =>
      deleteTitleMedia(titleId, youtubeMediaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

export const attributeSetQueryKey = (titleId: number) =>
  [...GOODS_TITLE_KEY, "attribute-set", titleId] as const;

// legacy title_attribute_set_register.php 로드.
export const useAttributeSet = (titleId: number) =>
  useQuery({
    queryKey: attributeSetQueryKey(titleId),
    queryFn: () => fetchAttributeSet(titleId),
  });

// legacy title_ps.php attribute_set → 자기 페이지 reload = invalidate.
export const useUpdateAttributeSet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: AttributeSetRequest }) =>
      updateAttributeSet(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

// legacy title_ps.php attribute_set2 → 자기 페이지 reload = invalidate.
export const useUpdateTradeTerms = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: TradeTermsRequest }) =>
      updateTradeTerms(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

export const gracQueryKey = (titleId: number) => [...GOODS_TITLE_KEY, "grac", titleId] as const;

// legacy title_grac_register.php 로드.
export const useGrac = (titleId: number) =>
  useQuery({
    queryKey: gracQueryKey(titleId),
    queryFn: () => fetchGrac(titleId),
  });

// legacy title_ps.php grac_save → 자기 페이지 reload = invalidate.
export const useUpdateGrac = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: GracRequest }) =>
      updateGrac(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

export const mediaQueryKey = (titleId: number) => [...GOODS_TITLE_KEY, "media", titleId] as const;

// legacy title_media_register.php 로드.
export const useMediaSettings = (titleId: number) =>
  useQuery({
    queryKey: mediaQueryKey(titleId),
    queryFn: () => fetchMediaSettings(titleId),
  });

// legacy title_ps.php add_youtube → location.reload = invalidate.
export const useAddTitleMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: AddMediaRequest }) =>
      addTitleMedia(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

export const screenshotsQueryKey = (titleId: number) =>
  [...GOODS_TITLE_KEY, "screenshots", titleId] as const;

// legacy title_screenshot_register.php 로드.
export const useScreenshots = (titleId: number) =>
  useQuery({
    queryKey: screenshotsQueryKey(titleId),
    queryFn: () => fetchScreenshots(titleId),
  });

// legacy 삭제 — ⚠️ location.reload 주석처리라 화면 미갱신. invalidate 하지 않음(그대로 재현).
export const useDeleteScreenshot = () =>
  useMutation({
    mutationFn: ({ titleId, screenshotNum }: { titleId: number; screenshotNum: number }) =>
      deleteScreenshot(titleId, screenshotNum),
  });

// legacy screenshot_sort_up/down → reload = invalidate.
export const useSortScreenshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: ScreenshotSortRequest }) =>
      sortScreenshot(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

// legacy steam 다운로드 → 후보 완료 + 목록 갱신(invalidate).
export const useDownloadScreenshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: ScreenshotDownloadRequest }) =>
      downloadScreenshot(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

// legacy screenshot_upload → reload = invalidate.
export const useUploadScreenshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: ScreenshotUploadRequest }) =>
      uploadScreenshot(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

export const imagesQueryKey = (titleId: number) => [...GOODS_TITLE_KEY, "images", titleId] as const;

// legacy title_image_register.php 로드.
export const useImages = (titleId: number) =>
  useQuery({
    queryKey: imagesQueryKey(titleId),
    queryFn: () => fetchImages(titleId),
  });

// legacy 스팀 다운로드 → reload = invalidate.
export const useDownloadImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: ImageDownloadRequest }) =>
      downloadImage(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

// legacy 직접 업로드 → library/hero는 reload, header는 미갱신(legacy 주석처리 그대로 재현).
export const useUploadImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: ImageUploadRequest }) =>
      uploadImage(titleId, payload),
    onSuccess: (_data, variables) => {
      if (variables.payload.key !== "header") {
        queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY });
      }
    },
  });
};

export const descriptionQueryKey = (titleId: number) =>
  [...GOODS_TITLE_KEY, "description", titleId] as const;

// legacy title_description_register.php 로드.
export const useDescription = (titleId: number) =>
  useQuery({
    queryKey: descriptionQueryKey(titleId),
    queryFn: () => fetchDescription(titleId),
  });

export const descriptionV2QueryKey = (titleId: number) =>
  [...GOODS_TITLE_KEY, "description-v2", titleId] as const;

// legacy title_description_register_v2.php 로드.
export const useDescriptionV2 = (titleId: number) =>
  useQuery({
    queryKey: descriptionV2QueryKey(titleId),
    queryFn: () => fetchDescriptionV2(titleId),
  });

// legacy 저장 — alert만(reload 없음). invalidate 하지 않음(그대로 재현).
export const useSaveDescriptionV2 = () =>
  useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: SaveDescriptionV2Request }) =>
      saveDescriptionV2(titleId, payload),
  });

// legacy steam 동기화(description_sync_v2) → location.reload = invalidate(에디터 remount).
export const useSyncDescriptionV2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (titleId: number) => syncDescriptionV2(titleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

// legacy 필드별 저장 — alert만(reload 없음). invalidate 하지 않음(그대로 재현).
export const useSaveDescriptionField = () =>
  useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: SaveDescriptionRequest }) =>
      saveDescriptionField(titleId, payload),
  });

// legacy steam 동기화 → location.reload = invalidate(에디터 remount).
export const useSyncDescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: SyncDescriptionRequest }) =>
      syncDescription(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};

export const tagsQueryKey = (titleId: number) => [...GOODS_TITLE_KEY, "tags", titleId] as const;

// legacy title_tag_register.php 로드.
export const useTags = (titleId: number) =>
  useQuery({
    queryKey: tagsQueryKey(titleId),
    queryFn: () => fetchTags(titleId),
  });

// legacy title_tag_ps.php tag_save → 자기 페이지 reload = invalidate.
export const useUpdateTags = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: TagsRequest }) =>
      updateTags(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_TITLE_KEY }),
  });
};
