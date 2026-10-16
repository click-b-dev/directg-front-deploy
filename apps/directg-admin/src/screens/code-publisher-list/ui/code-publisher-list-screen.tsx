import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  usePublisherList,
  useRegisterPublisher,
  type PublisherSearch,
  type PublisherItem,
} from "@entities/code";
import { ServerPagination } from "@shared/ui";
import { useSuperAdmin } from "@shared/lib/use-super-admin";

const BASE_URL = "/code/publisher_list";
const PER_PAGE = 30;

// legacy code/publisher_list.php — 공급처 설정.
export const CodePublisherListScreen = (search: PublisherSearch) => {
  const { data } = usePublisherList(search);
  const superAdmin = useSuperAdmin();
  const register = useRegisterPublisher();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [logo, setLogo] = useState("");

  // legacy Bootstrap fade: 마운트 후 다음 프레임에 .show 부여.
  useEffect(() => {
    if (!modalOpen) {
      return;
    }
    const id = requestAnimationFrame(() => setModalShown(true));
    return () => cancelAnimationFrame(id);
  }, [modalOpen]);

  if (!data) {
    return null;
  }

  const total = data.pagination.total_results;
  const page = data.pagination.current_page;

  const closeModal = () => {
    setModalShown(false);
    setModalOpen(false);
  };

  const onRegister = () => {
    if (!name) {
      window.alert("공급처명을 입력해주세요.");
      return;
    }
    register.mutate(
      { publisher_name: name, publisher_link: link, publisher_logo: logo },
      {
        onSuccess: (res) => {
          window.alert(res.message);
          if (res.success) {
            closeModal();
            setName("");
            setLink("");
            setLogo("");
          }
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
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    코드 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">공급처 설정</li>
              </ol>
            </div>
            <h4 className="page-title">공급처 설정</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">검색필터</h5>
            <div className="card-body">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-3 col-form-label bg-light border">공급처명</label>
                      <div className="col-sm-3 d-none">
                        <select
                          className="form-control"
                          name="search_type"
                          id="search_type"
                          defaultValue={search.search_type || "publisher_name"}
                        >
                          <option value="publisher_name">공급처명</option>
                        </select>
                      </div>
                      <div className="col-sm-6">
                        <input
                          type="text"
                          className="form-control"
                          id="search_value"
                          name="search_value"
                          placeholder="검색어"
                          defaultValue={search.search_value}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
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
      </div>

      <div className="d-flex flex-row justify-content-between mb-2 align-items-center">
        <div className="float-start text-center">{total.toLocaleString()} 개</div>
        {superAdmin && (
          <div className="float-end">
            <button
              type="button"
              className="btn btn-danger shadow-none"
              onClick={() => setModalOpen(true)}
            >
              공급처 등록
            </button>
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
            <colgroup>
              <col width="5%" />
              <col width="5%" />
              <col width="15%" />
              <col width="5%" />
              <col width="20%" />
              <col width="*" />
              <col width="5%" />
            </colgroup>
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">공급처코드</th>
                <th className="text-center">공급처명</th>
                <th className="text-center">사용여부</th>
                <th className="text-center">공급처 홈페이지</th>
                <th className="text-center">공급처 로고 이미지</th>
                <th className="text-center">옵션상품수</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {data.items.map((item, i) => (
                <PublisherRow
                  key={item.publisher_code}
                  item={item}
                  rowNo={total - (page - 1) * PER_PAGE - i}
                />
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <ServerPagination
              page={page}
              totalPages={data.pagination.total_pages}
              baseUrl={BASE_URL}
              params={{ search_type: search.search_type, search_value: search.search_value }}
            />
          </div>
        </div>
      </div>

      {superAdmin &&
        modalOpen &&
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
                  <div className="modal-header modal-colored-header bg-secondary">
                    <h5 className="modal-title">공급처 등록</h5>
                    <button type="button" className="btn-close" onClick={closeModal} />
                  </div>
                  <div className="modal-body">
                    <div className="mb-2 row">
                      <label className="col-sm-3 col-form-label bg-light">공급처코드</label>
                      <div className="col-sm-9 d-flex align-items-center">
                        <span className="text-center">등록시 자동으로 생성</span>
                      </div>
                    </div>
                    <div className="mb-2 row">
                      <label htmlFor="publisher_name" className="col-sm-3 col-form-label bg-light">
                        공급처명 *
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="text"
                          id="publisher_name"
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-2 row">
                      <label htmlFor="publisher_link" className="col-sm-3 col-form-label bg-light">
                        공급처 홈페이지
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="text"
                          id="publisher_link"
                          className="form-control"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-2 row">
                      <label htmlFor="publisher_logo" className="col-sm-3 col-form-label bg-light">
                        공급처 로고 이미지
                      </label>
                      <div className="col-sm-9">
                        <input
                          type="text"
                          id="publisher_logo"
                          className="form-control"
                          value={logo}
                          onChange={(e) => setLogo(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-2 text-center">
                      <button
                        className="btn btn-primary shadow-none"
                        type="button"
                        disabled={register.isPending}
                        onClick={onRegister}
                      >
                        공급처 등록
                      </button>
                    </div>
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

const PublisherRow = ({ item, rowNo }: { item: PublisherItem; rowNo: number }) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">{item.publisher_code}</td>
    <td>{item.publisher_name}</td>
    <td className="text-center">{item.is_view}</td>
    <td className="text-start">
      <a href={item.publisher_site} target="_blank" rel="noreferrer">
        {item.publisher_site}
      </a>
    </td>
    <td className="text-center">
      {item.publisher_image && <img src={item.publisher_image} className="w-100" alt="" />}
    </td>
    <td className="text-end">{item.goods_count}</td>
  </tr>
);
