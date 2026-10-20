import { useState, type SubmitEventHandler } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LOGIN_FALLBACK_MESSAGE } from "@entities/admin-auth";
import { renewalLogin } from "@/renewal/entities/renewal-login";
import { useAuthSession } from "@shared/lib/auth/provider";
import logo from "@/renewal/assets/logo-horizontal.png";
import { Button, PasswordInput, TextInput } from "@/renewal/shared/ui";

// 로그인 API는 리뉴얼용 mock 계약(entities/renewal-login)을 쓴다. 실서버 연결은 나중에 그 파일만 바꾸면 된다.
// 상태: 기본(빈 입력 · 비활성 버튼) / 입력 시(활성 버튼) / 에러(두 입력 빨간 테두리 + 안내 · 비활성 버튼)

// 로그인 성공 후 이동 기본값. redirect가 리뉴얼 경로일 때만 그곳으로 돌아간다(외부·legacy 경로 차단).
const DEFAULT_AFTER_LOGIN = "/renewal/member/list";
const resolveRedirect = (redirect: string | undefined) =>
  redirect && redirect.startsWith("/renewal/") && !redirect.startsWith("/renewal/login")
    ? redirect
    : DEFAULT_AFTER_LOGIN;

// Figma 에러 문구(2줄). 실패하면 두 줄을 함께 보여 준다.
const LOGIN_ERROR_LINES = [
  "로그인 정보를 다시 확인해주세요.",
  "로그인 할 수 없는 계정입니다. 마스터에게 문의해주세요.",
];

const FIELD_LABEL = "rn:text-body3 rn:font-medium rn:text-ink-2";

type LoginScreenProps = { redirect?: string };

export const LoginScreen = ({ redirect }: LoginScreenProps) => {
  const navigate = useNavigate();
  const { setSession } = useAuthSession();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorLines, setErrorLines] = useState<string[] | null>(null);

  const hasError = errorLines !== null;
  // 기본 상태·에러 상태에서는 버튼이 비활성 모양이다. 값을 고치면 에러가 사라지고 다시 활성화된다.
  const canSubmit = loginId !== "" && password !== "" && !hasError && !pending;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    setErrorLines(null);

    try {
      const result = await renewalLogin({ admin_id: loginId, admin_pwd: password });
      if (result.error_code !== "OK" || !result.data) {
        setErrorLines(LOGIN_ERROR_LINES);
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
      // 로그인한 사용자가 보던 리뉴얼 화면으로 돌아간다(없으면 회원 내역).
      void navigate({ to: resolveRedirect(redirect) });
    } catch {
      // 네트워크/5xx 등 envelope 없는 에러 — 내부 메시지는 노출하지 않는다
      setErrorLines([LOGIN_FALLBACK_MESSAGE]);
    } finally {
      setPending(false);
    }
  };

  const clearError = () => setErrorLines(null);

  return (
    <div className="rn:flex rn:min-h-screen rn:items-center rn:justify-center rn:p-24">
      <div className="rn:w-600 rn:max-w-full rn:rounded-24 rn:bg-surface rn:p-60 rn:shadow-login">
        <div className="rn:mx-auto rn:flex rn:w-full rn:max-w-480 rn:flex-col rn:items-center rn:gap-40">
          <img src={logo} alt="DIRECT G." width={214} height={50} />
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rn:flex rn:w-full rn:flex-col rn:gap-32"
          >
            <div className="rn:flex rn:flex-col rn:gap-24">
              <div className="rn:flex rn:flex-col rn:gap-8">
                <label htmlFor="renewal-login-id" className={FIELD_LABEL}>
                  이메일
                </label>
                <TextInput
                  id="renewal-login-id"
                  name="admin_id"
                  type="email"
                  size="L"
                  autoComplete="username"
                  placeholder="이메일 입력"
                  className="rn:w-full"
                  invalid={hasError}
                  value={loginId}
                  onChange={(event) => {
                    setLoginId(event.target.value);
                    clearError();
                  }}
                />
              </div>
              <div className="rn:flex rn:flex-col rn:gap-8">
                <label htmlFor="renewal-login-password" className={FIELD_LABEL}>
                  비밀번호
                </label>
                <PasswordInput
                  id="renewal-login-password"
                  name="admin_pwd"
                  autoComplete="current-password"
                  placeholder="비밀번호 입력"
                  invalid={hasError}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError();
                  }}
                />
              </div>
            </div>
            {hasError && (
              <div role="alert" className="rn:text-body3 rn:font-regular rn:text-error">
                {errorLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}
            <Button type="submit" className="rn:w-full" disabled={!canSubmit}>
              로그인
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
