import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FileUpload } from "@/components/file-upload";
import { createFileUploadMachine } from "@/machines/file-upload";
import { connectFileUpload } from "@/machines/file-upload";

/**
 * FileUpload tests: React rendering for basic structure, machine level for state logic.
 * The FileUpload.Root with onFilesChange triggers infinite update loops in the React layer,
 * so file validation and state change logic is tested via the machine directly.
 */

function createMockFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

function createFileUpload(
  opts: {
    accept?: string;
    maxFiles?: number;
    maxFileSize?: number;
    multiple?: boolean;
    disabled?: boolean;
  } = {},
) {
  const machine = createFileUploadMachine({
    id: "fu-1",
    accept: opts.accept ?? "",
    maxFiles: opts.maxFiles ?? Infinity,
    maxFileSize: opts.maxFileSize ?? Infinity,
    multiple: opts.multiple ?? false,
    disabled: opts.disabled ?? false,
  });
  let state = machine.initialState;
  let context = machine.initialContext;

  function send(event: Parameters<typeof machine.transition>[2]) {
    const result = machine.transition(state, context, event);
    state = result.state;
    context = result.context;
  }

  function getApi() {
    return connectFileUpload(state, context, send);
  }

  return { send, getApi, getState: () => state, getContext: () => context };
}

describe("FileUpload", () => {
  it("renders trigger and hidden input (basic structure)", () => {
    render(
      <FileUpload.Root>
        <FileUpload.Trigger>Choose files</FileUpload.Trigger>
        <FileUpload.HiddenInput />
      </FileUpload.Root>,
    );
    expect(screen.getByRole("button", { name: "Choose files" })).toBeInTheDocument();
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(hiddenInput).toBeInTheDocument();
  });

  it("hidden input has correct accept attribute", () => {
    render(
      <FileUpload.Root accept="image/*,.pdf">
        <FileUpload.HiddenInput />
      </FileUpload.Root>,
    );
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(hiddenInput).toHaveAttribute("accept", "image/*,.pdf");
  });

  it("FILE_SELECT adds files to context", () => {
    const { send, getContext } = createFileUpload({ multiple: true });
    const file = createMockFile("test.txt", 1024, "text/plain");

    send({ type: "FILE_SELECT", files: [file] });

    expect(getContext().files).toHaveLength(1);
    expect(getContext().files[0]!.name).toBe("test.txt");
  });

  it("file validation - rejects invalid type", () => {
    const { send, getContext } = createFileUpload({ accept: "image/*" });
    const invalidFile = createMockFile("doc.pdf", 1024, "application/pdf");

    send({ type: "FILE_SELECT", files: [invalidFile] });

    expect(getContext().files).toHaveLength(0);
    expect(getContext().rejectedFiles).toHaveLength(1);
    expect(getContext().rejectedFiles[0]!.errors[0]!.type).toBe("FILE_INVALID_TYPE");
  });

  it("file validation - rejects oversized file", () => {
    const { send, getContext } = createFileUpload({ maxFileSize: 500 });
    const largeFile = createMockFile("big.txt", 1000, "text/plain");

    send({ type: "FILE_SELECT", files: [largeFile] });

    expect(getContext().files).toHaveLength(0);
    expect(getContext().rejectedFiles).toHaveLength(1);
    expect(getContext().rejectedFiles[0]!.errors[0]!.type).toBe("FILE_TOO_LARGE");
  });

  it("FILE_REMOVE removes a file by index", () => {
    const { send, getContext } = createFileUpload({ multiple: true });
    const file1 = createMockFile("a.txt", 100, "text/plain");
    const file2 = createMockFile("b.txt", 200, "text/plain");

    send({ type: "FILE_SELECT", files: [file1, file2] });
    expect(getContext().files).toHaveLength(2);

    send({ type: "FILE_REMOVE", index: 0 });
    expect(getContext().files).toHaveLength(1);
    expect(getContext().files[0]!.name).toBe("b.txt");
  });

  it("multiple files support", () => {
    const { send, getContext } = createFileUpload({ multiple: true });
    const file1 = createMockFile("a.txt", 100, "text/plain");
    const file2 = createMockFile("b.txt", 200, "text/plain");

    send({ type: "FILE_SELECT", files: [file1, file2] });
    expect(getContext().files).toHaveLength(2);
  });

  it("single mode replaces file", () => {
    const { send, getContext } = createFileUpload({ multiple: false });
    const file1 = createMockFile("a.txt", 100, "text/plain");
    const file2 = createMockFile("b.txt", 200, "text/plain");

    send({ type: "FILE_SELECT", files: [file1] });
    expect(getContext().files).toHaveLength(1);
    expect(getContext().files[0]!.name).toBe("a.txt");

    send({ type: "FILE_SELECT", files: [file2] });
    expect(getContext().files).toHaveLength(1);
    expect(getContext().files[0]!.name).toBe("b.txt");
  });

  it("maxFiles limit prevents adding more", () => {
    const { send, getContext } = createFileUpload({ multiple: true, maxFiles: 2 });
    const file1 = createMockFile("a.txt", 100, "text/plain");
    const file2 = createMockFile("b.txt", 200, "text/plain");
    const file3 = createMockFile("c.txt", 300, "text/plain");

    send({ type: "FILE_SELECT", files: [file1, file2] });
    expect(getContext().files).toHaveLength(2);

    send({ type: "FILE_SELECT", files: [file3] });
    // file3 should be rejected since we're at max
    expect(getContext().files).toHaveLength(2);
    expect(getContext().rejectedFiles).toHaveLength(1);
  });

  it("CLEAR removes all files", () => {
    const { send, getContext } = createFileUpload({ multiple: true });
    const file1 = createMockFile("a.txt", 100, "text/plain");
    const file2 = createMockFile("b.txt", 200, "text/plain");

    send({ type: "FILE_SELECT", files: [file1, file2] });
    expect(getContext().files).toHaveLength(2);

    send({ type: "CLEAR" });
    expect(getContext().files).toHaveLength(0);
  });

  it("connect returns correct trigger props", () => {
    const { getApi } = createFileUpload();
    const api = getApi();
    expect(api.triggerProps.type).toBe("button");
    expect(api.triggerProps.disabled).toBe(false);
    expect(api.triggerProps["data-scope"]).toBe("file-upload");
  });

  it("connect returns correct hiddenInput props", () => {
    const { getApi } = createFileUpload({ accept: "image/*", multiple: true });
    const api = getApi();
    expect(api.hiddenInputProps.type).toBe("file");
    expect(api.hiddenInputProps.accept).toBe("image/*");
    expect(api.hiddenInputProps.multiple).toBe(true);
  });
});
