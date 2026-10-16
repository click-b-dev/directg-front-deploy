import { SubmitEventHandler, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { adminLogin } from "@entities/admin-auth";
import { useAuthSession } from "@shared/lib/auth/provider";

// legacy: pc/_Admin_/index.html + login_ps.php (docs/migration/admin/auth/login.md)

// 로그인 실패 error_code → 사용자 메시지 (사용자 승인된 legacy divergence).
// 문구는 legacy AdminMember::adminLogin의 error_msg 도메인 텍스트를 그대로 사용(선행 공백만 정리).
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  NO_AUTH_CONFIRM: "미승인된 회원입니다.",
  NOT_FOUND: "존재하지 않는 회원입니다.",
};

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { setSession } = useAuthSession();
  const [adminId, setAdminId] = useState("");
  const [adminPwd, setAdminPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // legacy login body: class="loading authentication-bg" — loading은 테마 JS 프리로더용이라 제외
  useEffect(() => {
    document.body.classList.add("authentication-bg");
    return () => document.body.classList.remove("authentication-bg");
  }, []);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setErrorText(null);

    let result;
    try {
      result = await adminLogin({ admin_id: adminId, admin_pwd: adminPwd });
    } catch (error) {
      // legacy: PDOException 시 "Error!: <메시지>" 출력
      setErrorText(`Error!: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }

    if (result.error_code !== "OK" || !result.data) {
      // 실패 UI: error_code를 사용자 메시지로 매핑(사용자 승인된 legacy divergence).
      // 문구는 legacy AdminMember::adminLogin의 error_msg 도메인 텍스트(docs/migration/admin/auth/login.md).
      // 매핑에 없는 코드는 응답 error_msg → 코드 원문 순으로 폴백.
      setErrorText(
        LOGIN_ERROR_MESSAGES[result.error_code] ?? result.error_msg ?? result.error_code,
      );
      return;
    }

    setSession({
      accessToken: result.data.accessToken,
      user: {
        id: result.data.admin_id,
        name: result.data.admin_name,
        role: result.data.admin_level,
      },
    });

    // legacy login_ps.php:27 — admin_level=="1"(상품뷰어)은 상품 목록, 그 외 대시보드
    if (result.data.admin_level === "1") {
      navigate({
        to: "/goods/title_list",
        search: {
          page: 1,
          search_key: "",
          search_value: "",
          search_is_view: "",
          search_sales_status: "",
          search_age_limit: "",
          search_interface_korean: "",
          search_subtitle_korean: "",
          search_spoken_korean: "",
          search_exclusive_korean: "",
        },
      });
      return;
    }
    navigate({ to: "/main" });
  };

  return (
    <>
      <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xxl-4 col-lg-5">
              <div className="card">
                <div className="card-header pt-3 pb-3 text-center">
                  <a href="/">
                    <img
                      src="/assets/images/logo/H2_DG_BI_nm_194x45_v2.png"
                      alt="다이렉트 게임즈"
                    />
                  </a>
                </div>

                <div className="card-body p-4">
                  <form method="POST" onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="admin_id" className="form-label">
                        Email address
                      </label>
                      <input
                        className="form-control"
                        type="email"
                        id="admin_id"
                        name="admin_id"
                        required
                        placeholder="Enter your email"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="admin_pwd" className="form-label">
                        Password
                      </label>
                      <div className="input-group input-group-merge">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="admin_pwd"
                          name="admin_pwd"
                          className="form-control"
                          placeholder="Enter your password"
                          value={adminPwd}
                          onChange={(e) => setAdminPwd(e.target.value)}
                        />
                        <div
                          className="input-group-text"
                          data-password={showPassword ? "true" : "false"}
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          <span className="password-eye" />
                        </div>
                      </div>
                    </div>

                    {errorText !== null && <div className="mb-3 text-danger">{errorText}</div>}

                    <div className="mb-3 mb-0 text-center">
                      <button className="btn btn-primary shadow-none" type="submit">
                        로그인
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer footer-alt">2024 © H2 Interactive</footer>
    </>
  );
};
