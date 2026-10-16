import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useChinaMemberList,
  useResetChinaMemberPwd,
  useCreateChinaMember,
  type ChinaMemberListSearch,
  type ChinaMemberItem,
} from "@entities/china";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/china/invoice_member";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy date('Ymd') — 오늘 YYYYMMDD(초기화 비밀번호).
const todayYmd = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

// legacy china/invoice_member.php — 중국 결제자 리스트(China::getChinaInvoiceMember, idx desc, 20/page).
export const ChinaInvoiceMemberScreen = (search: ChinaMemberListSearch) => {
  const { data } = useChinaMemberList(search);
  const pwdReset = useResetChinaMemberPwd();
  const register = useCreateChinaMember();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pwd, setPwd] = useState("");

  // legacy Bootstrap fade: 마운트 후 다음 프레임에 .show 부여.
  useEffect(() => {
    if (!modalOpen) {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modalOpen]);

  // 페이지네이션은 raw 검색값(page 제외) 유지 = legacy $param.
  const paginationParams: Record<string, string> = {};
  const addP = (key: string, value: string) => {
    if (value !== "") paginationParams[key] = value;
  };
  addP("search_name", search.search_name);
  addP("search_email", search.search_email);

  if (!data) {
    return null;
  }

  const { items, pagination } = data;

  const closeModal = () => {
    setModalShown(false);
    setModalOpen(false);
  };

  // legacy: 초기화 버튼 → confirm → AJAX pwd_reset → alert(응답)·목록 미갱신(quirk).
  const onPwdReset = (idx: number) => {
    if (!window.confirm("해당 회원의 비밀번호를 초기화 하시겠습니까?")) {
      return;
    }
    pwdReset.mutate(
      { idx },
      {
        onSuccess: (res) => window.alert(res.message),
        onError: () => window.alert(""),
      },
    );
  };

  // legacy: 등록 모달 폼 제출(email/name/pwd required) → register → go(목록) = invalidate.
  const onRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(
      { email, name, pwd },
      {
        onSuccess: () => {
          closeModal();
          setEmail("");
          setName("");
          setPwd("");
        },
      },
    );
  };

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    중국결제
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    중국 결제 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">중국 결제자 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">중국 결제자 리스트</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_name"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      이름
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_name"
                        name="search_name"
                        placeholder="이름"
                        defaultValue={search.search_name}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_email"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      이메일
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_email"
                        name="search_email"
                        placeholder="이메일"
                        defaultValue={search.search_email}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{nf(pagination.total_results)} 명</div>
        <div className="float-end">
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => setModalOpen(true)}
          >
            중국 결제자 등록
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <thead className="table-light">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">이메일(아이디)</th>
                <th className="text-center">이름</th>
                <th className="text-center">마지막 접속일자</th>
                <th className="text-center">비밀번호 초기화</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, index) => (
                <ChinaMemberRow
                  key={item.idx}
                  item={item}
                  no={pagination.total_results - (index + (pagination.current_page - 1) * PER_PAGE)}
                  onPwdReset={onPwdReset}
                  disabled={pwdReset.isPending}
                />
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="text-end">
                  (초기화 비밀번호는 {todayYmd()})
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={BASE_URL}
              params={paginationParams}
            />
          </div>
        </div>
      </div>

      {modalOpen &&
        createPortal(
          <>
            <div
              className={`modal fade${modalShown ? " show" : ""}`}
              tabIndex={-1}
              role="dialog"
              style={{ display: "block" }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header modal-colored-header bg-primary">
                    <h4 className="modal-title">중국 결제자 등록</h4>
                    <button type="button" className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body">
                    <form className="ps-3 pe-3" onSubmit={onRegister} autoComplete="one-time-code">
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          * 이메일
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          id="email"
                          name="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="one-time-code"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          * 이름
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="one-time-code"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="pwd" className="form-label">
                          비밀번호
                        </label>
                        <input
                          className="form-control"
                          type="password"
                          required
                          id="pwd"
                          name="pwd"
                          value={pwd}
                          onChange={(e) => setPwd(e.target.value)}
                          autoComplete="one-time-code"
                        />
                      </div>
                      <div className="mb-3 text-center">
                        <button
                          className="btn btn-primary"
                          type="submit"
                          disabled={register.isPending}
                        >
                          중국 결제자 등록
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal-backdrop fade${modalShown ? " show" : ""}`}
              onClick={closeModal}
            />
          </>,
          document.body,
        )}
    </>
  );
};

const ChinaMemberRow = ({
  item,
  no,
  onPwdReset,
  disabled,
}: {
  item: ChinaMemberItem;
  no: number;
  onPwdReset: (idx: number) => void;
  disabled: boolean;
}) => (
  <tr>
    <td className="text-center">{no}</td>
    <td className="text-center">{item.email}</td>
    <td className="text-center">{item.name}</td>
    <td className="text-center">{item.login_date}</td>
    <td className="text-center">
      <button
        type="button"
        className="btn btn-outline-dark btn-sm"
        disabled={disabled}
        onClick={() => onPwdReset(item.idx)}
      >
        초기화
      </button>
    </td>
  </tr>
);
