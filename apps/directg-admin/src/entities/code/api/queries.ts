import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPlatformList,
  fetchPublisherList,
  registerPublisher,
  fetchDeliveryMethodList,
} from "./fetcher";
import type { PublisherSearch, RegisterPublisherRequest } from "../model/types";

const CODE_KEY = ["admin", "code"] as const;

export const platformListQueryKey = () => [...CODE_KEY, "platforms"] as const;

// legacy code/platform_list.php — 플랫폼 설정.
export const usePlatformList = () =>
  useQuery({
    queryKey: platformListQueryKey(),
    queryFn: () => fetchPlatformList(),
  });

export const publisherListQueryKey = (query: PublisherSearch) =>
  [...CODE_KEY, "publishers", query] as const;

// legacy code/publisher_list.php — 공급처 설정.
export const usePublisherList = (query: PublisherSearch) =>
  useQuery({
    queryKey: publisherListQueryKey(query),
    queryFn: () => fetchPublisherList(query),
  });

// legacy publisher_ps.php register → success 시 location.reload = 목록 invalidate.
export const useRegisterPublisher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPublisherRequest) => registerPublisher(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...CODE_KEY, "publishers"] }),
  });
};

export const deliveryMethodListQueryKey = () => [...CODE_KEY, "delivery-methods"] as const;

// legacy code/delivery_method.php — 배송방법 설정.
export const useDeliveryMethodList = () =>
  useQuery({
    queryKey: deliveryMethodListQueryKey(),
    queryFn: () => fetchDeliveryMethodList(),
  });
