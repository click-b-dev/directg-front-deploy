import { apiClient } from "@shared/api/client";
import type {
  PlatformListResponse,
  PublisherSearch,
  PublisherListResponse,
  RegisterPublisherRequest,
  RegisterPublisherResponse,
  DeliveryMethodListResponse,
} from "../model/types";

// legacy code/platform_list.php — 플랫폼 목록.
export const fetchPlatformList = () => apiClient.get<PlatformListResponse>("/admin/code/platforms");

// legacy code/publisher_list.php — 공급처 목록.
export const fetchPublisherList = (query: PublisherSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof PublisherSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_type", query.search_type);
  set("search_value", query.search_value);
  return apiClient.get<PublisherListResponse>("/admin/code/publishers", { searchParams });
};

// legacy publisher_ps.php mode=register — 공급처 등록(admin_level==99).
export const registerPublisher = (payload: RegisterPublisherRequest) =>
  apiClient.post<RegisterPublisherResponse>("/admin/code/publishers", payload);

// legacy code/delivery_method.php — 배송방법 목록.
export const fetchDeliveryMethodList = () =>
  apiClient.get<DeliveryMethodListResponse>("/admin/code/delivery-methods");
