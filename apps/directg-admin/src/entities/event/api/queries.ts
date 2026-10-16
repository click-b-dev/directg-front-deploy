import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchEventBoardList,
  fetchEventBoardDetail,
  createEventBoard,
  updateEventBoard,
  fetchEventGoods,
  addEventGoods,
  deleteEventGoods,
  addEventGroupItems,
  fetchEventLotteryList,
  fetchEventLotterySuccess,
  fetchEventCampaign202505,
  fetchEventCampaign20250626,
  fetchEventFm26,
  fetchEventGiftList,
  fetchEventGiftMember,
  fetchEventGiftRequest,
  fetchEventPointList,
} from "./fetcher";
import type {
  EventBoardSearch,
  EventBoardSaveRequest,
  EventGoodsAddRequest,
  EventLotterySearch,
  EventLotterySuccessSearch,
  EventCampaign202505Search,
  EventCampaign20250626Search,
  EventFm26Search,
  EventGiftSearch,
  EventGiftMemberSearch,
  EventGiftRequestSearch,
  EventPointSearch,
} from "../model/types";

const EVENT_KEY = ["admin", "event"] as const;

export const eventLotteryListQueryKey = (query: EventLotterySearch) =>
  [...EVENT_KEY, "lottery-list", query] as const;

// legacy event_lottery_list.php — 추첨 이벤트 현황.
export const useEventLotteryList = (query: EventLotterySearch) =>
  useQuery({
    queryKey: eventLotteryListQueryKey(query),
    queryFn: () => fetchEventLotteryList(query),
  });

export const eventLotterySuccessQueryKey = (query: EventLotterySuccessSearch) =>
  [...EVENT_KEY, "lottery-success", query] as const;

// legacy event_lottery_success.php — 추첨 이벤트 당첨자현황.
export const useEventLotterySuccess = (query: EventLotterySuccessSearch) =>
  useQuery({
    queryKey: eventLotterySuccessQueryKey(query),
    queryFn: () => fetchEventLotterySuccess(query),
  });

export const eventCampaign202505QueryKey = (query: EventCampaign202505Search) =>
  [...EVENT_KEY, "campaign-202505", query] as const;

// legacy event_list_202505.php — 2025 가정의달 이벤트.
export const useEventCampaign202505 = (query: EventCampaign202505Search) =>
  useQuery({
    queryKey: eventCampaign202505QueryKey(query),
    queryFn: () => fetchEventCampaign202505(query),
  });

export const eventCampaign20250626QueryKey = (query: EventCampaign20250626Search) =>
  [...EVENT_KEY, "campaign-20250626", query] as const;

// legacy event_list_20250626.php — 2025 여름 프로모션 이벤트.
export const useEventCampaign20250626 = (query: EventCampaign20250626Search) =>
  useQuery({
    queryKey: eventCampaign20250626QueryKey(query),
    queryFn: () => fetchEventCampaign20250626(query),
  });

export const eventFm26QueryKey = (query: EventFm26Search) =>
  [...EVENT_KEY, "campaign-fm26", query] as const;

// legacy event_fm26.php — 풋볼 매니저 26 예약 구매 이벤트.
export const useEventFm26 = (query: EventFm26Search) =>
  useQuery({
    queryKey: eventFm26QueryKey(query),
    queryFn: () => fetchEventFm26(query),
  });

export const eventGiftListQueryKey = (query: EventGiftSearch) =>
  [...EVENT_KEY, "gift-list", query] as const;

// legacy event_gift_list.php — 사은품 이벤트 진행이력.
export const useEventGiftList = (query: EventGiftSearch) =>
  useQuery({
    queryKey: eventGiftListQueryKey(query),
    queryFn: () => fetchEventGiftList(query),
  });

export const eventGiftMemberQueryKey = (query: EventGiftMemberSearch) =>
  [...EVENT_KEY, "gift-member", query] as const;

// legacy event_gift_member.php — 사은품 이벤트 당첨자현황.
export const useEventGiftMember = (query: EventGiftMemberSearch) =>
  useQuery({
    queryKey: eventGiftMemberQueryKey(query),
    queryFn: () => fetchEventGiftMember(query),
  });

export const eventGiftRequestQueryKey = (query: EventGiftRequestSearch) =>
  [...EVENT_KEY, "gift-request", query] as const;

// legacy event_gift_request.php — 사은품 발송 현황.
export const useEventGiftRequest = (query: EventGiftRequestSearch) =>
  useQuery({
    queryKey: eventGiftRequestQueryKey(query),
    queryFn: () => fetchEventGiftRequest(query),
  });

export const eventPointListQueryKey = (query: EventPointSearch) =>
  [...EVENT_KEY, "point-list", query] as const;

// legacy event_point_list.php — 포인트 지급 이벤트.
export const useEventPointList = (query: EventPointSearch) =>
  useQuery({
    queryKey: eventPointListQueryKey(query),
    queryFn: () => fetchEventPointList(query),
  });

export const eventBoardListQueryKey = (query: EventBoardSearch) =>
  [...EVENT_KEY, "board-list", query] as const;

// legacy event_board_list.php — 이벤트게시판 목록.
export const useEventBoardList = (query: EventBoardSearch) =>
  useQuery({
    queryKey: eventBoardListQueryKey(query),
    queryFn: () => fetchEventBoardList(query),
  });

export const eventBoardDetailQueryKey = (idx: number) =>
  [...EVENT_KEY, "board-detail", idx] as const;

// legacy event_board_register.php(idx>0) — 폼 프리필 상세.
export const useEventBoardDetail = (idx: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: eventBoardDetailQueryKey(idx),
    queryFn: () => fetchEventBoardDetail(idx),
    enabled: options?.enabled ?? true,
  });

// legacy event_board_ps.php mode=register → event_board_list 리다이렉트 = 목록 invalidate.
export const useCreateEventBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventBoardSaveRequest) => createEventBoard(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENT_KEY }),
  });
};

// legacy event_board_ps.php mode=modify → event_board_list 리다이렉트 = 목록 invalidate.
export const useUpdateEventBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: EventBoardSaveRequest }) =>
      updateEventBoard(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENT_KEY }),
  });
};

export const eventGoodsQueryKey = (eventNo: number) =>
  [...EVENT_KEY, "board-goods", eventNo] as const;

// legacy event_board_modify.php — 이벤트 상품 목록.
export const useEventGoods = (eventNo: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: eventGoodsQueryKey(eventNo),
    queryFn: () => fetchEventGoods(eventNo),
    enabled: options?.enabled ?? true,
  });

// legacy event_goods_add → location.reload() = 상품 목록 invalidate.
export const useAddEventGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventGoodsAddRequest) => addEventGoods(payload),
    onSuccess: (_res, payload) =>
      queryClient.invalidateQueries({ queryKey: eventGoodsQueryKey(payload.event_no) }),
  });
};

// legacy event_goods_delete → location.reload() = 상품 목록 invalidate.
export const useDeleteEventGoods = (eventNo: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idx: number) => deleteEventGoods(idx),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventGoodsQueryKey(eventNo) }),
  });
};

// legacy group_item_add → **reload 주석처리(재조회 없음) quirk** — invalidate 안 함.
export const useAddEventGroupItems = () =>
  useMutation({
    mutationFn: ({ eventNo, groupCode }: { eventNo: number; groupCode: string }) =>
      addEventGroupItems(eventNo, groupCode),
  });
