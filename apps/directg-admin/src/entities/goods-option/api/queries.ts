import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPackageItem,
  createOption,
  deleteBundleItem,
  deleteDeliveryItem,
  deletePackageItem,
  fetchGoodsOptionList,
  fetchOptionEndList,
  fetchHolomodelsList,
  fetchEtcList,
  fetchOptionImageChkList,
  disknUploadChk,
  fetchOptionScreenshotChkList,
  fetchNewOption,
  fetchOption,
  fetchOptionCategory,
  fetchOptionGenre,
  fetchOptionImages,
  fetchOptionTag,
  fetchOptionView,
  fetchOptionDescriptionV2,
  fetchOptionSales,
  downloadOptionImage,
  saveOptionDescriptionField,
  saveOptionDescriptionV2,
  saveOptionPrice,
  saveOptionSales,
  saveOptionSupplier,
  searchDeliveryItem,
  addDeliveryItem,
  fetchOptionTimedeal,
  saveOptionTimedeal,
  fetchOptionPackage,
  savePackageView,
  addPackageUnit,
  deletePackageUnit,
  searchPackageOption,
  saveBonusDescription,
  fetchOptionSteamPackage,
  fetchOptionRepay,
  saveRepay,
  addRepay,
  fetchOptionScreenshots,
  deleteOptionScreenshot,
  sortOptionScreenshot,
  downloadOptionScreenshot,
  uploadOptionScreenshot,
  syncOptionDescription,
  syncOptionDescriptionV2,
  updateOption,
  updateOptionCategory,
  updateOptionGenre,
  updateOptionTag,
  uploadOptionImage,
} from "./fetcher";
import type {
  AddPackageRequest,
  OptionImageDownloadRequest,
  OptionImageUploadRequest,
  OptionListQuery,
  AddDeliveryItemRequest,
  AddPackageUnitRequest,
  AddRepayRequest,
  DeliverySearchRequest,
  EtcSearch,
  HolomodelsSearch,
  OptionEndSearch,
  OptionImageChkSearch,
  DisknUploadChkRequest,
  OptionScreenshotChkSearch,
  DownloadOptionScreenshotRequest,
  SaveRepayRequest,
  SortOptionScreenshotRequest,
  UploadOptionScreenshotRequest,
  SaveBonusDescriptionRequest,
  SaveOptionTimedealRequest,
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

const GOODS_OPTION_KEY = ["admin", "goods", "options"] as const;

export const goodsOptionListQueryKey = (query: OptionListQuery) =>
  [...GOODS_OPTION_KEY, "list", query] as const;

// legacy goods_option_list.php 로드.
export const useGoodsOptionList = (query: OptionListQuery) =>
  useQuery({
    queryKey: goodsOptionListQueryKey(query),
    queryFn: () => fetchGoodsOptionList(query),
  });

export const goodsOptionEndQueryKey = (query: OptionEndSearch) =>
  [...GOODS_OPTION_KEY, "end", query] as const;

// legacy goods_option_end.php — 판매종료 옵션상품 목록.
export const useOptionEndList = (query: OptionEndSearch) =>
  useQuery({
    queryKey: goodsOptionEndQueryKey(query),
    queryFn: () => fetchOptionEndList(query),
  });

export const goodsHolomodelsQueryKey = (query: HolomodelsSearch) =>
  [...GOODS_OPTION_KEY, "holomodels", query] as const;

// legacy goods_holomodels_list.php — 홀로모델 옵션상품 목록.
export const useHolomodelsList = (query: HolomodelsSearch) =>
  useQuery({
    queryKey: goodsHolomodelsQueryKey(query),
    queryFn: () => fetchHolomodelsList(query),
  });

export const goodsEtcQueryKey = (query: EtcSearch) => [...GOODS_OPTION_KEY, "etc", query] as const;

// legacy goods_etc_list.php — 실물상품 목록.
export const useEtcList = (query: EtcSearch) =>
  useQuery({
    queryKey: goodsEtcQueryKey(query),
    queryFn: () => fetchEtcList(query),
  });

export const optionImageChkQueryKey = (query: OptionImageChkSearch) =>
  [...GOODS_OPTION_KEY, "image-chk", query] as const;

// legacy goods_option_image_chk.php — 옵션상품 Header 이미지 확인 목록.
export const useOptionImageChkList = (query: OptionImageChkSearch) =>
  useQuery({
    queryKey: optionImageChkQueryKey(query),
    queryFn: () => fetchOptionImageChkList(query),
  });

// legacy goods_option_ps.php diskn_upload_chk → location.reload = 목록 invalidate.
export const useDisknUploadChk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DisknUploadChkRequest) => disknUploadChk(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_OPTION_KEY }),
  });
};

export const optionScreenshotChkQueryKey = (query: OptionScreenshotChkSearch) =>
  [...GOODS_OPTION_KEY, "screenshot-chk", query] as const;

// legacy goods_option_screenshot_chk.php — DLC 스크린샷 체크 목록.
export const useOptionScreenshotChkList = (query: OptionScreenshotChkSearch) =>
  useQuery({
    queryKey: optionScreenshotChkQueryKey(query),
    queryFn: () => fetchOptionScreenshotChkList(query),
  });

// legacy steam_screenshot_download → location.reload = 목록 invalidate. (기존 download fetcher 재사용)
export const useDownloadScreenshotChk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productCode,
      payload,
    }: {
      productCode: string;
      payload: DownloadOptionScreenshotRequest;
    }) => downloadOptionScreenshot(productCode, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_OPTION_KEY }),
  });
};

export const goodsOptionQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode] as const;

// legacy 등록 진입(채번). 매 요청 값이 달라지므로 staleTime 0 유지.
export const useNewOption = () =>
  useQuery({
    queryKey: [...GOODS_OPTION_KEY, "new"] as const,
    queryFn: fetchNewOption,
  });

// legacy 수정 로드.
export const useOption = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionQueryKey(productCode),
    queryFn: () => fetchOption(productCode),
  });

export const goodsOptionViewQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "view"] as const;

// legacy goods_option_view.php — 상세보기 통합 조회.
export const useOptionView = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionViewQueryKey(productCode),
    queryFn: () => fetchOptionView(productCode),
  });

// 편집 후 view 갱신(legacy location.reload 대응).
export const useDeleteDeliveryItem = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { item_id: string; order_system: string }) =>
      deleteDeliveryItem(productCode, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionViewQueryKey(productCode) }),
  });
};

export const useDeletePackageItem = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (packageSrl: number) => deletePackageItem(packageSrl),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionViewQueryKey(productCode) }),
  });
};

export const useAddPackageItem = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddPackageRequest) => addPackageItem(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionViewQueryKey(productCode) }),
  });
};

export const useDeleteBundleItem = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bndlNo: number) => deleteBundleItem(bndlNo),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionViewQueryKey(productCode) }),
  });
};

export const goodsOptionGenreQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "genre"] as const;

// legacy goods_option_genre_register.php — 장르 설정 로드.
export const useOptionGenre = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionGenreQueryKey(productCode),
    queryFn: () => fetchOptionGenre(productCode),
  });

export const useUpdateOptionGenre = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveOptionGenreRequest) => updateOptionGenre(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionGenreQueryKey(productCode) }),
  });
};

export const goodsOptionCategoryQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "category"] as const;

// legacy goods_option_category_register.php — 카테고리 설정 로드.
export const useOptionCategory = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionCategoryQueryKey(productCode),
    queryFn: () => fetchOptionCategory(productCode),
  });

export const useUpdateOptionCategory = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveOptionCategoryRequest) => updateOptionCategory(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionCategoryQueryKey(productCode) }),
  });
};

export const goodsOptionTagQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "tag"] as const;

// legacy goods_option_tag_register.php — 태그 설정 로드.
export const useOptionTag = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionTagQueryKey(productCode),
    queryFn: () => fetchOptionTag(productCode),
  });

export const useUpdateOptionTag = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveOptionTagRequest) => updateOptionTag(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionTagQueryKey(productCode) }),
  });
};

export const goodsOptionImagesQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "images"] as const;

// legacy goods_option_image_register.php — 이미지(header) 설정 로드.
export const useOptionImages = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionImagesQueryKey(productCode),
    queryFn: () => fetchOptionImages(productCode),
  });

// legacy: 스팀 다운로드 후 location.reload → invalidate로 재현.
export const useDownloadOptionImage = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OptionImageDownloadRequest) => downloadOptionImage(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionImagesQueryKey(productCode) }),
  });
};

// legacy: 직접 업로드 후 location.reload → invalidate로 재현.
export const useUploadOptionImage = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OptionImageUploadRequest) => uploadOptionImage(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionImagesQueryKey(productCode) }),
  });
};

export const goodsOptionDescriptionV2QueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "description-v2"] as const;

// legacy goods_option_description_register_v2.php — 상세설명 V2 로드.
export const useOptionDescriptionV2 = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionDescriptionV2QueryKey(productCode),
    queryFn: () => fetchOptionDescriptionV2(productCode),
  });

// legacy: SE2 상세설명 저장 alert-only(미리로드) → invalidate 없음.
export const useSaveOptionDescriptionV2 = (productCode: string) =>
  useMutation({
    mutationFn: (payload: SaveOptionDescriptionV2Request) =>
      saveOptionDescriptionV2(productCode, payload),
  });

// legacy: 필드별 저장 alert-only(미리로드) → invalidate 없음.
export const useSaveOptionDescriptionField = (productCode: string) =>
  useMutation({
    mutationFn: (payload: SaveOptionDescriptionFieldRequest) =>
      saveOptionDescriptionField(productCode, payload),
  });

// legacy: SE2 상세설명 sync 후 location.reload → invalidate로 재현(에디터 remount).
export const useSyncOptionDescriptionV2 = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncOptionDescriptionV2(productCode),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionDescriptionV2QueryKey(productCode) }),
  });
};

// legacy: 시스템요구사항 sync(steam_sync_system) 후 reload → invalidate.
export const useSyncOptionDescription = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SyncOptionDescriptionRequest) =>
      syncOptionDescription(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionDescriptionV2QueryKey(productCode) }),
  });
};

export const goodsOptionSalesQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "sales"] as const;

// legacy goods_option_sales_register.php — 판매/가격/공급처/배송아이템 로드.
export const useOptionSales = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionSalesQueryKey(productCode),
    queryFn: () => fetchOptionSales(productCode),
  });

// legacy: 각 저장 self 리다이렉트(reload) → invalidate.
export const useSaveOptionSales = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveOptionSalesRequest) => saveOptionSales(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionSalesQueryKey(productCode) }),
  });
};

export const useSaveOptionPrice = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveOptionPriceRequest) => saveOptionPrice(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionSalesQueryKey(productCode) }),
  });
};

export const useSaveOptionSupplier = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveOptionSupplierRequest) => saveOptionSupplier(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionSalesQueryKey(productCode) }),
  });
};

export const goodsOptionPackageQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "package"] as const;

// legacy goods_option_package_register.php — 구성정보 설정 로드.
export const useOptionPackage = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionPackageQueryKey(productCode),
    queryFn: () => fetchOptionPackage(productCode),
  });

// legacy: 각 mutation self reload → package key invalidate.
export const useSavePackageView = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { is_package_view: string }) => savePackageView(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionPackageQueryKey(productCode) }),
  });
};

export const useAddPackageUnit = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddPackageUnitRequest) => addPackageUnit(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionPackageQueryKey(productCode) }),
  });
};

export const useDeletePackageUnit = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idx: number) => deletePackageUnit(productCode, idx),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionPackageQueryKey(productCode) }),
  });
};

// legacy goods_option_search — 옵션상품 검색(모달 표시용).
export const useSearchPackageOption = (productCode: string) =>
  useMutation({
    mutationFn: (payload: { search_option_code: string }) =>
      searchPackageOption(productCode, payload),
  });

// legacy bonus_description_save — 특전설명 저장 후 reload → invalidate.
export const useSaveBonusDescription = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveBonusDescriptionRequest) =>
      saveBonusDescription(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionPackageQueryKey(productCode) }),
  });
};

export const goodsOptionScreenshotsQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "screenshots"] as const;

// legacy goods_option_screenshot_register.php — 스크린샷 설정 로드.
export const useOptionScreenshots = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionScreenshotsQueryKey(productCode),
    queryFn: () => fetchOptionScreenshots(productCode),
  });

// legacy: 삭제 후 location.reload 주석처리 → 미갱신 재현(invalidate 안 함).
export const useDeleteOptionScreenshot = (productCode: string) =>
  useMutation({
    mutationFn: (screenshotNum: string) => deleteOptionScreenshot(productCode, screenshotNum),
  });

// legacy: 정렬/다운로드/업로드 후 reload → invalidate.
export const useSortOptionScreenshot = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SortOptionScreenshotRequest) =>
      sortOptionScreenshot(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionScreenshotsQueryKey(productCode) }),
  });
};

export const useDownloadOptionScreenshot = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DownloadOptionScreenshotRequest) =>
      downloadOptionScreenshot(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionScreenshotsQueryKey(productCode) }),
  });
};

export const useUploadOptionScreenshot = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadOptionScreenshotRequest) =>
      uploadOptionScreenshot(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionScreenshotsQueryKey(productCode) }),
  });
};

export const goodsOptionRepayQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "repay"] as const;

// legacy goods_option_repay_register.php — 포인트 설정 로드.
export const useOptionRepay = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionRepayQueryKey(productCode),
    queryFn: () => fetchOptionRepay(productCode),
  });

// legacy repay_config — is_repay 저장 후 self reload → invalidate.
export const useSaveRepay = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveRepayRequest) => saveRepay(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionRepayQueryKey(productCode) }),
  });
};

// legacy add_repay_config — INSERT 이력 후 self reload → invalidate.
export const useAddRepay = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddRepayRequest) => addRepay(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionRepayQueryKey(productCode) }),
  });
};

export const goodsOptionSteamPackageQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "steam-package"] as const;

// legacy package col-4 — Steam 구성정보 참고(read-only).
export const useOptionSteamPackage = (productCode: string) =>
  useQuery({
    queryKey: goodsOptionSteamPackageQueryKey(productCode),
    queryFn: () => fetchOptionSteamPackage(productCode),
  });

export const goodsOptionTimedealQueryKey = (productCode: string) =>
  [...GOODS_OPTION_KEY, productCode, "timedeal"] as const;

// legacy timedeal 블록 — 설정+이력 로드.
export const useOptionTimedeal = (productCode: string, enabled: boolean) =>
  useQuery({
    queryKey: goodsOptionTimedealQueryKey(productCode),
    queryFn: () => fetchOptionTimedeal(productCode),
    enabled,
  });

// legacy timedeal_config — 저장 후 INSERT 이력 갱신 → invalidate.
export const useSaveOptionTimedeal = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveOptionTimedealRequest) => saveOptionTimedeal(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionTimedealQueryKey(productCode) }),
  });
};

// legacy {system}_search — 배송아이템 검색(모달 표시용, invalidate 불필요).
export const useSearchDeliveryItem = (productCode: string) =>
  useMutation({
    mutationFn: (payload: DeliverySearchRequest) => searchDeliveryItem(productCode, payload),
  });

// legacy {system}_add — 배송아이템 추가 후 reload → sales key invalidate.
export const useAddDeliveryItem = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddDeliveryItemRequest) => addDeliveryItem(productCode, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionSalesQueryKey(productCode) }),
  });
};

// legacy delivery_item_delete — 배송아이템 삭제(#34 fetcher 재사용, sales key invalidate).
export const useDeleteSalesDeliveryItem = (productCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { item_id: string; order_system: string }) =>
      deleteDeliveryItem(productCode, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: goodsOptionSalesQueryKey(productCode) }),
  });
};

export const useCreateOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveGoodsOptionRequest) => createOption(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_OPTION_KEY }),
  });
};

export const useUpdateOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productCode,
      payload,
    }: {
      productCode: string;
      payload: SaveGoodsOptionRequest;
    }) => updateOption(productCode, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOODS_OPTION_KEY }),
  });
};
