import type { PnMode } from "../model/types";

// legacy _inc.php pn_mode_select — 환경 셀렉트(Sandbox(test)/Production(prod)).
// autoSubmit이면 legacy처럼 변경 시 상위 form을 GET 제출한다.
export const PnModeSelect = ({
  mode,
  autoSubmit = true,
}: {
  mode: PnMode;
  autoSubmit?: boolean;
}) => (
  <select
    className="form-control form-control-sm"
    id="mode"
    name="mode"
    defaultValue={mode}
    onChange={autoSubmit ? (e) => e.currentTarget.form?.submit() : undefined}
  >
    <option value="test">Sandbox(test)</option>
    <option value="prod">Production(prod)</option>
  </select>
);
