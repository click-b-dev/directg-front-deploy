import { useEffect, useState, type FormEvent } from "react";
import {
  useAssignSearchRecommandSlot,
  useClearSearchRecommandSlot,
  useDeleteSearchRecommand,
  useModifySearchRecommand,
  useRegisterSearchRecommandSlot,
  useSearchRecommands,
  type SearchRecommandListItem,
  type SearchRecommandSlot,
} from "@entities/search-recommand";
import { ServerPagination } from "@shared/ui";

type SearchRecommandScreenProps = {
  page: number;
  searchKeyword: string;
};

const BASE_URL = "/site/search_recommand";

// legacy: link_url 있으면 그 URL, 없으면 검색결과 자동 URL.
const autoUrl = (keyword: string) => `/game/game_search_thumb.html?q=${keyword}`;

type ModalState = {
  open: boolean;
  mode: "slot_register" | "modify";
  slot: number;
  idx: number;
  keyword: string;
  link: string;
};

const CLOSED_MODAL: ModalState = {
  open: false,
  mode: "slot_register",
  slot: 0,
  idx: 0,
  keyword: "",
  link: "",
};

// 슬롯 카드(채움/빈칸).
const SlotCard = ({
  slotNo,
  slot,
  onRegister,
  onEdit,
  onClear,
}: {
  slotNo: number;
  slot: SearchRecommandSlot | null;
  onRegister: (slotNo: number) => void;
  onEdit: (idx: number, keyword: string, link: string) => void;
  onClear: (idx: number) => void;
}) => (
  <div className="col-md-3">
    <div className={`card h-100 border ${slot ? "border-success" : "border-secondary"}`}>
      <div
        className={`card-header py-1 text-center fw-bold ${slot ? "bg-success text-white" : "bg-light"}`}
      >
        추천 검색어 {slotNo}
      </div>
      <div className="card-body p-2 d-flex flex-column justify-content-between">
        {slot ? (
          <>
            <div className="mb-2">
              <div className="fw-bold mb-1 text-center font-14">{slot.keyword}</div>
              <div className="font-11 text-center mb-1">
                클릭수 : {slot.click_count.toLocaleString()}
              </div>
              <div className="font-12" style={{ wordBreak: "break-all" }}>
                {slot.link_url ? (
                  <a href={slot.link_url} target="_blank" rel="noreferrer">
                    {slot.link_url}
                  </a>
                ) : (
                  <a
                    href={autoUrl(slot.keyword)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted"
                  >
                    {autoUrl(slot.keyword)}
                  </a>
                )}
              </div>
            </div>
            <div>
              <div className="d-grid mb-2">
                <button
                  type="button"
                  className="btn btn-sm btn-primary shadow-none btn_slot_register"
                  data-slot={slotNo}
                  onClick={() => onRegister(slotNo)}
                >
                  + 등록
                </button>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-success shadow-none flex-fill btn_slot_edit"
                  onClick={() => onEdit(slot.idx, slot.keyword, slot.link_url)}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger shadow-none flex-fill btn_slot_clear"
                  onClick={() => onClear(slot.idx)}
                >
                  비우기
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-muted my-3 text-center">(비어있음)</div>
            <div className="d-grid">
              <button
                type="button"
                className="btn btn-sm btn-primary shadow-none btn_slot_register"
                data-slot={slotNo}
                onClick={() => onRegister(slotNo)}
              >
                + 등록
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);

// 보관 목록 한 행(슬롯 select는 행 로컬 상태).
const ListRow = ({
  item,
  onAssign,
  onEdit,
  onDelete,
}: {
  item: SearchRecommandListItem;
  onAssign: (idx: number, slot: number) => void;
  onEdit: (idx: number, keyword: string, link: string) => void;
  onDelete: (idx: number) => void;
}) => {
  const [slot, setSlot] = useState(1);
  return (
    <tr>
      <td className="text-center">{item.keyword}</td>
      <td className="text-start px-1">
        {item.link_url ? (
          <a href={item.link_url} target="_blank" rel="noreferrer">
            {item.link_url}
          </a>
        ) : (
          <a href={autoUrl(item.keyword)} target="_blank" rel="noreferrer" className="text-muted">
            검색결과 자동({autoUrl(item.keyword)})
          </a>
        )}
      </td>
      <td className="text-center">{item.click_count.toLocaleString()}</td>
      <td className="text-center">
        <div className="d-flex flex-row justify-content-center align-items-center">
          <select
            className="form-select form-select-sm w-auto me-1 slot_select"
            value={slot}
            onChange={(event) => setSlot(Number(event.target.value))}
          >
            <option value={1}>추천 검색어 1</option>
            <option value={2}>추천 검색어 2</option>
            <option value={3}>추천 검색어 3</option>
            <option value={4}>추천 검색어 4</option>
          </select>
          <button
            type="button"
            className="btn btn-success btn-sm shadow-none btn_assign me-1"
            onClick={() => onAssign(item.idx, slot)}
          >
            노출
          </button>
          <button
            type="button"
            className="btn btn-info btn-sm shadow-none btn_slot_edit me-1"
            onClick={() => onEdit(item.idx, item.keyword, item.link_url)}
          >
            수정
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm shadow-none btn_delete"
            onClick={() => onDelete(item.idx)}
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
};

export const SearchRecommandScreen = ({ page, searchKeyword }: SearchRecommandScreenProps) => {
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);
  // legacy Bootstrap fade: display:block 후 다음 프레임에 .show 추가 → transform/opacity 트랜지션.
  const [modalShown, setModalShown] = useState(false);

  useEffect(() => {
    document.title = "추천 검색어 관리";
  }, []);

  // 모달이 열리면(마운트 후) 다음 프레임에 .show 부여 → fade-in 트랜지션 발동.
  useEffect(() => {
    if (!modal.open) {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modal.open]);

  const { data } = useSearchRecommands({ page, search_keyword: searchKeyword });
  const registerMutation = useRegisterSearchRecommandSlot();
  const modifyMutation = useModifySearchRecommand();
  const assignMutation = useAssignSearchRecommandSlot();
  const clearMutation = useClearSearchRecommandSlot();
  const deleteMutation = useDeleteSearchRecommand();

  const slots = data?.slots ?? [null, null, null, null];
  const items = data?.list.items ?? [];
  const totalResults = data?.list.pagination.total_results ?? 0;
  const totalPages = data?.list.pagination.total_pages ?? 0;

  const openRegister = (slotNo: number) =>
    setModal({ open: true, mode: "slot_register", slot: slotNo, idx: 0, keyword: "", link: "" });
  const openEdit = (idx: number, keyword: string, link: string) =>
    setModal({ open: true, mode: "modify", slot: 0, idx, keyword, link });
  // legacy fade-out: .show 제거 → 트랜지션(약 0.15~0.3s) 후 언마운트.
  const closeModal = () => {
    setModalShown(false);
    window.setTimeout(() => setModal(CLOSED_MODAL), 200);
  };

  const handleModalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (modal.mode === "slot_register") {
      registerMutation.mutate(
        { slot: modal.slot, keyword: modal.keyword, link_url: modal.link },
        { onSuccess: closeModal },
      );
    } else {
      modifyMutation.mutate(
        { idx: modal.idx, payload: { keyword: modal.keyword, link_url: modal.link } },
        { onSuccess: closeModal },
      );
    }
  };

  const handleAssign = (idx: number, slot: number) => {
    // legacy: confirm("슬롯 N에 노출하시겠습니까? (해당 슬롯의 기존 검색어는 비노출 처리)")
    if (
      window.confirm(`슬롯 ${slot}에 노출하시겠습니까? (해당 슬롯의 기존 검색어는 비노출 처리)`)
    ) {
      assignMutation.mutate({ idx, payload: { slot } });
    }
  };

  const handleClear = (idx: number) => {
    if (window.confirm("이 슬롯을 비우시겠습니까? (검색어는 비노출 목록으로 이동)")) {
      clearMutation.mutate(idx);
    }
  };

  const handleDelete = (idx: number) => {
    if (window.confirm("해당 추천검색어를 완전히 삭제하시겠습니까?")) {
      deleteMutation.mutate(idx);
    }
  };

  const modalTitle =
    modal.mode === "slot_register" ? `추천 검색어 ${modal.slot} 등록` : "추천검색어 수정";

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    사이트
                  </a>
                </li>
                <li className="breadcrumb-item active">추천 검색어 관리</li>
              </ol>
            </div>
            <h4 className="page-title">추천 검색어 관리</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 노출 슬롯 4칸 */}
      <div className="card">
        <h5 className="card-header bg-secondary text-white">유저페이지 노출 (4칸 고정)</h5>
        <div className="card-body">
          <div className="row g-2">
            {[1, 2, 3, 4].map((slotNo) => (
              <SlotCard
                key={slotNo}
                slotNo={slotNo}
                slot={slots[slotNo - 1] ?? null}
                onRegister={openRegister}
                onEdit={openEdit}
                onClear={handleClear}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 검색어 (보관/관리) */}
      <div className="card">
        <h5 className="card-header bg-secondary text-white">검색어</h5>
        <div className="card-body">
          <form className="form-horizontal mb-2" method="get" action={BASE_URL}>
            <div className="row">
              <div className="col-lg-6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="search_keyword"
                    name="search_keyword"
                    placeholder="검색어로 찾기"
                    defaultValue={searchKeyword}
                  />
                  <button type="submit" className="btn btn-primary shadow-none">
                    검색
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="font-12 mb-2">{totalResults.toLocaleString()} 개</div>

          <div className="table-responsive">
            <table className="table table-centered w-100 nowrap table-sm table-bordered border-light">
              <colgroup>
                <col width="25%" />
                <col width="*" />
                <col width="10%" />
                <col width="30%" />
              </colgroup>
              <thead className="table-primary font-13">
                <tr>
                  <th className="text-center">추천검색어</th>
                  <th className="text-center">링크 URL</th>
                  <th className="text-center">클릭수</th>
                  <th className="text-center">슬롯 지정 / 관리</th>
                </tr>
              </thead>
              <tbody className="bg-white font-12">
                {items.map((item) => (
                  <ListRow
                    key={item.idx}
                    item={item}
                    onAssign={handleAssign}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-3">
            <ServerPagination
              page={page}
              totalPages={totalPages}
              baseUrl={BASE_URL}
              params={{ search_keyword: searchKeyword }}
            />
          </div>
        </div>
      </div>

      {/* 슬롯 등록/수정 모달 (legacy Bootstrap modal → React 제어 재현) */}
      {modal.open && (
        <>
          <div
            className={`modal fade${modalShown ? " show" : ""}`}
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <form id="slotForm" onSubmit={handleModalSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">{modalTitle}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={closeModal}
                    />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="modal_keyword" className="form-label">
                        * 추천검색어
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="modal_keyword"
                        name="keyword"
                        placeholder="추천검색어"
                        value={modal.keyword}
                        onChange={(event) =>
                          setModal((m) => ({ ...m, keyword: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="modal_link_url" className="form-label">
                        링크 URL
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="modal_link_url"
                        name="link_url"
                        placeholder="비우면 검색결과로 자동 연결 (/game/game_search_thumb.html?q=검색어)"
                        value={modal.link}
                        onChange={(event) => setModal((m) => ({ ...m, link: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary shadow-none"
                      onClick={closeModal}
                    >
                      취소
                    </button>
                    <button type="submit" className="btn btn-primary shadow-none">
                      저장
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className={`modal-backdrop fade${modalShown ? " show" : ""}`} onClick={closeModal} />
        </>
      )}
    </>
  );
};
