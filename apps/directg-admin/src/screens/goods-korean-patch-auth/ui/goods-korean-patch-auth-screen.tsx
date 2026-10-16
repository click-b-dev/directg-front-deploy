import { useState } from "react";
import {
  useKoreanPatchList,
  useKoreanPatchAuth,
  type KoreanPatchAuthSearch,
} from "@entities/korean-patch";

const BASE_URL = "/goods/korean_patch_auth";

// legacy korean_patch_auth.php — 한글패치 인증정보 확인.
export const GoodsKoreanPatchAuthScreen = (search: KoreanPatchAuthSearch) => {
  const { data: listData } = useKoreanPatchList();
  const { data: authData } = useKoreanPatchAuth(search);
  const patches = listData?.items ?? [];

  const [mId, setMId] = useState(search.search_m_id);
  const [selIdx, setSelIdx] = useState(search.search_patch_goods);
  const selected = patches.find((p) => String(p.idx) === selIdx);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // legacy JS 검증: 회원아이디 빈값 / 패치 미선택 시 alert 후 제출 취소.
    if (mId.trim() === "") {
      e.preventDefault();
      window.alert("검색할 회원아이디를 입력해주세요.");
      return;
    }
    if (selIdx === "") {
      e.preventDefault();
      window.alert("제공할 패치상품을 선택해주세요.");
    }
  };

  const hasResult = search.search_m_id !== "" && authData;

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
                    한글패치 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">한글패치 인증정보 확인</li>
              </ol>
            </div>
            <h4 className="page-title">한글패치 인증정보 확인</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-0">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body p-3">
            <form
              id="searchFrm"
              className="form-horizontal"
              method="get"
              action={BASE_URL}
              onSubmit={onSubmit}
            >
              {/* 제출 시 선택 옵션의 name/prefix/encode를 전달(legacy hidden input) */}
              <input type="hidden" name="patch_goods" value={selected?.goods_nm ?? ""} readOnly />
              <input
                type="hidden"
                name="prefix_text"
                value={selected?.prefix_text ?? ""}
                readOnly
              />
              <input
                type="hidden"
                name="encode_type"
                value={selected?.encode_type ?? ""}
                readOnly
              />
              <div className="row g-0 mb-2">
                <div className="col-6">
                  <div className="row g-2">
                    <label
                      htmlFor="search_m_id"
                      className="col-2 col-form-label col-form-label-sm bg-light border"
                    >
                      회원아이디
                    </label>
                    <div className="col-4">
                      <input
                        type="text"
                        className="form-control"
                        id="search_m_id"
                        name="search_m_id"
                        value={mId}
                        onChange={(e) => setMId(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="row g-2">
                    <label
                      htmlFor="search_patch_goods"
                      className="col-2 col-form-label col-form-label-sm bg-light border"
                    >
                      한글패치상품
                    </label>
                    <div className="col-4">
                      <select
                        id="search_patch_goods"
                        name="search_patch_goods"
                        className="form-select"
                        value={selIdx}
                        onChange={(e) => setSelIdx(e.target.value)}
                        required
                      >
                        <option value="">:::한글패치선택::::</option>
                        {patches.map((p) => (
                          <option key={p.idx} value={p.idx}>
                            {p.goods_nm}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      회원 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">인증정보 확인</h5>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered w-100 nowrap table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">회원고유번호</th>
                      <th className="text-center">한글패치상품</th>
                      <th className="text-center">한글패치인증 아이디</th>
                      <th className="text-center">한글패치인증 비밀번호</th>
                      <th className="text-center">한글패치인증 비밀번호 복사</th>
                    </tr>
                  </thead>
                  <tbody className="font-13">
                    {hasResult && (
                      <tr>
                        <td className="text-center">1</td>
                        <td className="text-start">{search.patch_goods}</td>
                        <td>{search.search_m_id}</td>
                        <td>
                          <span className="enc_data">{authData.password}</span>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary shadow-none btn_clipboard"
                            onClick={() => navigator.clipboard?.writeText(authData.password)}
                          >
                            비밀번호 복사
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
