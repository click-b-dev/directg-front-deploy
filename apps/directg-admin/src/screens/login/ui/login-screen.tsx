import { SubmitEventHandler, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  adminLogin,
  LOGIN_FALLBACK_MESSAGE,
  toLoginErrorMessage,
  toSessionRole,
} from "@entities/admin-auth";
import { useAuthSession } from "@shared/lib/auth/provider";

// legacy: pc/_Admin_/index.html + login_ps.php (docs/migration/admin/auth/login.md)

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
      result = await adminLogin({ loginId: adminId, password: adminPwd });
    } catch {
      // 네트워크/5xx 등 envelope 없는 에러 — 내부 메시지는 노출하지 않는다
      setErrorText(LOGIN_FALLBACK_MESSAGE);
      return;
    }

    // 401/403: 서버 code를 프론트 메시지로 변환해 표시
    if (!result.success || !result.content) {
      setErrorText(toLoginErrorMessage(result.code));
      return;
    }

    const sessionRole = toSessionRole(result.content.role);
    setSession({
      accessToken: result.content.accessToken,
      user: {
        id: result.content.loginId,
        name: result.content.name,
        role: sessionRole,
      },
    });

    // legacy login_ps.php:27 — admin_level=="1"(상품뷰어)은 상품 목록, 그 외 대시보드
    if (sessionRole === "1") {
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
