import readline from "node:readline";
import readlinePromises from "node:readline/promises";
import process from "node:process";
import { bold, cyan, green, gray, dim, ICONS } from "./style.js";

const createQuestionInterface = () =>
  readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

const askQuestion = async (label, defaultValue) => {
  const rl = createQuestionInterface();
  const suffix = defaultValue ? ` ${gray(`(${defaultValue})`)}` : "";
  const prompt = `  ${cyan(ICONS.pointer)} ${bold(label)}${suffix} ${gray(ICONS.arrow)} `;

  try {
    const answer = await rl.question(prompt);
    return answer.trim() || defaultValue || "";
  } finally {
    rl.close();
  }
};

const askSelectFallback = async (label, options, defaultValue) => {
  const rl = createQuestionInterface();

  console.log(`  ${cyan(ICONS.pointer)} ${bold(label)}`);
  options.forEach((option, index) => {
    const marker = option.value === defaultValue ? green(ICONS.circleFilled) : gray(ICONS.circle);
    console.log(`    ${marker} ${index + 1}. ${option.label}`);
  });

  const defaultIndex = Math.max(
    0,
    options.findIndex((option) => option.value === defaultValue),
  );

  try {
    const answer = await rl.question(`    ${gray("번호 선택")} ${gray(`[${defaultIndex + 1}]`)}: `);
    const selectedIndex = answer.trim() ? Number(answer.trim()) - 1 : defaultIndex;

    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= options.length) {
      return {
        error: `  ${ICONS.cross} 1~${options.length} 사이 번호를 선택하세요.`,
      };
    }

    return {
      value: options[selectedIndex].value,
    };
  } finally {
    rl.close();
  }
};

const clearRenderedBlock = (lineCount) => {
  readline.moveCursor(process.stdout, 0, -lineCount);

  for (let index = 0; index < lineCount; index += 1) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    if (index < lineCount - 1) {
      readline.moveCursor(process.stdout, 0, 1);
    }
  }

  if (lineCount > 1) {
    readline.moveCursor(process.stdout, 0, -(lineCount - 1));
  }
};

const askSelectInteractive = async (label, options, defaultValue) => {
  const defaultIndex = Math.max(
    0,
    options.findIndex((option) => option.value === defaultValue),
  );
  const lineCount = options.length + 2;

  return new Promise((resolve, reject) => {
    let currentIndex = defaultIndex;
    const originalRawMode = process.stdin.isRaw;
    const canSetRawMode = typeof process.stdin.setRawMode === "function";

    const render = () => {
      const lines = [
        `  ${cyan(ICONS.pointer)} ${bold(label)}  ${dim("↑↓ 이동, Enter 선택")}`,
        "",
        ...options.map((option, index) => {
          if (index === currentIndex) {
            return `    ${cyan(ICONS.circleFilled)} ${cyan(bold(option.label))}`;
          }
          return `    ${gray(ICONS.circle)} ${gray(option.label)}`;
        }),
      ];

      process.stdout.write(`${lines.join("\n")}\n`);
    };

    const cleanup = () => {
      process.stdin.off("keypress", handleKeypress);

      if (canSetRawMode) {
        process.stdin.setRawMode(Boolean(originalRawMode));
      }

      process.stdin.pause();
    };

    const finish = (value, label) => {
      cleanup();
      clearRenderedBlock(lineCount);
      // Show selected result inline
      console.log(`  ${green(ICONS.check)} ${bold(label)} ${gray(ICONS.arrow)} ${cyan(value)}`);
      resolve({ value });
    };

    const fail = (error) => {
      cleanup();
      reject(error);
    };

    const handleKeypress = (_, key) => {
      if (!key) {
        return;
      }

      if (key.name === "up") {
        currentIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
        clearRenderedBlock(lineCount);
        render();
        return;
      }

      if (key.name === "down") {
        currentIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
        clearRenderedBlock(lineCount);
        render();
        return;
      }

      if (key.name === "return" || key.name === "enter") {
        finish(options[currentIndex].value, label);
        return;
      }

      if (key.ctrl && key.name === "c") {
        fail(new Error("취소되었습니다."));
      }
    };

    readline.emitKeypressEvents(process.stdin);

    if (canSetRawMode) {
      process.stdin.setRawMode(true);
    }

    process.stdin.resume();
    process.stdin.on("keypress", handleKeypress);
    render();
  });
};

const askSelect = async (label, options, defaultValue) => {
  if (process.stdin.isTTY && process.stdout.isTTY) {
    return askSelectInteractive(label, options, defaultValue);
  }

  return askSelectFallback(label, options, defaultValue);
};

// ── Multi-select ──

const askMultiSelectFallback = async (label, options) => {
  const rl = createQuestionInterface();

  console.log(`  ${cyan(ICONS.pointer)} ${bold(label)}`);
  options.forEach((option, index) => {
    const marker = option.checked ? green(ICONS.check) : gray(ICONS.cross);
    console.log(`    ${marker} ${index + 1}. ${option.label}`);
  });

  try {
    const answer = await rl.question(`    ${gray("번호 입력 (쉼표 구분, 예: 1,3,5)")}: `);
    if (!answer.trim()) {
      return options.filter((option) => option.checked).map((option) => option.value);
    }

    const indices = answer
      .split(",")
      .map((s) => Number(s.trim()) - 1)
      .filter((i) => Number.isInteger(i) && i >= 0 && i < options.length);

    return options.filter((_, i) => indices.includes(i)).map((o) => o.value);
  } finally {
    rl.close();
  }
};

const askMultiSelectInteractive = async (label, options) => {
  const checked = options.map((o) => Boolean(o.checked));
  const lineCount = options.length + 3;

  return new Promise((resolve, reject) => {
    let currentIndex = 0;
    const originalRawMode = process.stdin.isRaw;
    const canSetRawMode = typeof process.stdin.setRawMode === "function";

    const render = () => {
      const selectedCount = checked.filter(Boolean).length;
      const lines = [
        `  ${cyan(ICONS.pointer)} ${bold(label)}  ${dim("↑↓ 이동, Space 선택, Enter 확정")}`,
        `    ${dim(`${selectedCount}/${options.length}개 선택됨`)}`,
        "",
        ...options.map((option, index) => {
          const marker = checked[index] ? green(ICONS.check) : gray(ICONS.dash);
          const isCurrent = index === currentIndex;
          const pointer = isCurrent ? cyan(ICONS.pointer) : " ";
          const text = isCurrent
            ? checked[index]
              ? green(bold(option.label))
              : cyan(bold(option.label))
            : checked[index]
              ? green(option.label)
              : gray(option.label);
          return `    ${pointer} ${marker} ${text}`;
        }),
      ];

      process.stdout.write(`${lines.join("\n")}\n`);
    };

    const cleanup = () => {
      process.stdin.off("keypress", handleKeypress);

      if (canSetRawMode) {
        process.stdin.setRawMode(Boolean(originalRawMode));
      }

      process.stdin.pause();
    };

    const finish = () => {
      cleanup();
      clearRenderedBlock(lineCount);
      const selected = options.filter((_, i) => checked[i]);
      if (selected.length === 0) {
        console.log(`  ${green(ICONS.check)} ${bold(label)} ${gray(ICONS.arrow)} ${dim("(없음)")}`);
      } else {
        console.log(
          `  ${green(ICONS.check)} ${bold(label)} ${gray(ICONS.arrow)} ${cyan(selected.map((o) => o.value).join(", "))}`,
        );
      }
      resolve(selected.map((o) => o.value));
    };

    const fail = (error) => {
      cleanup();
      reject(error);
    };

    const handleKeypress = (_, key) => {
      if (!key) return;

      if (key.name === "up") {
        currentIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
        clearRenderedBlock(lineCount);
        render();
        return;
      }

      if (key.name === "down") {
        currentIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
        clearRenderedBlock(lineCount);
        render();
        return;
      }

      if (key.name === "space") {
        checked[currentIndex] = !checked[currentIndex];
        clearRenderedBlock(lineCount);
        render();
        return;
      }

      if (key.name === "a") {
        const allChecked = checked.every(Boolean);
        checked.fill(!allChecked);
        clearRenderedBlock(lineCount);
        render();
        return;
      }

      if (key.name === "return" || key.name === "enter") {
        finish();
        return;
      }

      if (key.ctrl && key.name === "c") {
        fail(new Error("취소되었습니다."));
      }
    };

    readline.emitKeypressEvents(process.stdin);

    if (canSetRawMode) {
      process.stdin.setRawMode(true);
    }

    process.stdin.resume();
    process.stdin.on("keypress", handleKeypress);
    render();
  });
};

export const askMultiSelect = async (label, options) => {
  if (process.stdin.isTTY && process.stdout.isTTY) {
    return askMultiSelectInteractive(label, options);
  }

  return askMultiSelectFallback(label, options);
};

export const runPromptSession = async (questions) => {
  const answers = {};

  for (const question of questions) {
    while (true) {
      const answer =
        question.type === "select"
          ? await askSelect(question.label, question.options, question.defaultValue)
          : { value: await askQuestion(question.label, question.defaultValue) };

      if (answer.error) {
        console.log(answer.error);
        continue;
      }

      if (question.validate) {
        const validationMessage = question.validate(answer.value);
        if (validationMessage) {
          console.log(`  ${ICONS.cross} ${validationMessage}`);
          continue;
        }
      }

      answers[question.key] = answer.value;
      break;
    }
  }

  return answers;
};
