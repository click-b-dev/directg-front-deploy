export {
  fetchSearchRecommands,
  registerSearchRecommandSlot,
  modifySearchRecommand,
  assignSearchRecommandSlot,
  clearSearchRecommandSlot,
  deleteSearchRecommand,
} from "./api/fetcher";
export {
  useSearchRecommands,
  useRegisterSearchRecommandSlot,
  useModifySearchRecommand,
  useAssignSearchRecommandSlot,
  useClearSearchRecommandSlot,
  useDeleteSearchRecommand,
  searchRecommandQueryKey,
} from "./api/queries";
export type {
  SearchRecommandSlot,
  SearchRecommandListItem,
  SearchRecommandListQuery,
  SearchRecommandResponse,
  SearchRecommandPagination,
  SearchRecommandModifyRequest,
  SlotAssignRequest,
  SlotRegisterRequest,
  SearchRecommandMutationResponse,
} from "./model/types";
