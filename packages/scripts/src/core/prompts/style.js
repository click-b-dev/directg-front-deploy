const esc = (code) => `\x1b[${code}m`;
const wrap = (code, resetCode) => (text) => `${esc(code)}${text}${esc(resetCode)}`;

export const bold = wrap("1", "22");
export const dim = wrap("2", "22");
export const italic = wrap("3", "23");
export const underline = wrap("4", "24");

export const cyan = wrap("36", "39");
export const green = wrap("32", "39");
export const yellow = wrap("33", "39");
export const red = wrap("31", "39");
export const magenta = wrap("35", "39");
export const blue = wrap("34", "39");
export const white = wrap("37", "39");
export const gray = wrap("90", "39");

export const bgCyan = wrap("46", "49");
export const bgGreen = wrap("42", "49");
export const bgBlue = wrap("44", "49");

export const ICONS = {
  arrow: "›",
  check: "✔",
  cross: "✖",
  pointer: "❯",
  circle: "○",
  circleFilled: "●",
  box: "■",
  dash: "─",
  bar: "│",
  cornerTL: "┌",
  cornerTR: "┐",
  cornerBL: "└",
  cornerBR: "┘",
  teeR: "├",
  teeL: "┤",
};

export const banner = (title) => {
  const line = ICONS.dash.repeat(42);
  return [
    "",
    `  ${cyan(ICONS.cornerTL + line + ICONS.cornerTR)}`,
    `  ${cyan(ICONS.bar)}  ${bold(white(title))}${" ".repeat(Math.max(0, 40 - title.length))}${cyan(ICONS.bar)}`,
    `  ${cyan(ICONS.cornerBL + line + ICONS.cornerBR)}`,
    "",
  ].join("\n");
};

export const stepHeader = (step, total, label) =>
  `  ${cyan(bold(`[${step}/${total}]`))} ${bold(label)}`;

export const sectionDivider = () => `  ${gray(ICONS.dash.repeat(42))}`;

export const summaryBox = (rows) => {
  const maxLabel = Math.max(...rows.map(([label]) => label.length));
  const lines = rows.map(
    ([label, value]) => `  ${cyan(ICONS.bar)}  ${gray(label.padEnd(maxLabel))}  ${white(value)}`,
  );
  const innerWidth = Math.max(...lines.map((l) => stripAnsi(l).length)) + 2;
  const topLine = ICONS.dash.repeat(42);

  return [
    `  ${cyan(ICONS.cornerTL + topLine + ICONS.cornerTR)}`,
    ...lines.map(
      (l) => `${l}${" ".repeat(Math.max(0, innerWidth - stripAnsi(l).length))}${cyan(ICONS.bar)}`,
    ),
    `  ${cyan(ICONS.cornerBL + topLine + ICONS.cornerBR)}`,
  ].join("\n");
};

const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, "");
