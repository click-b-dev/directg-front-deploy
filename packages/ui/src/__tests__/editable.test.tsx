import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import * as Editable from "@/components/editable";
import { createEditableMachine } from "@/machines/editable";
import { connect } from "@/machines/editable";

function renderEditable(
  props: {
    defaultValue?: string;
    onSubmit?: (value: string) => void;
    onCancel?: (value: string) => void;
  } = {},
) {
  const { defaultValue = "Hello World", ...rest } = props;

  return render(
    <Editable.Root defaultValue={defaultValue} {...rest}>
      <Editable.Area>
        <Editable.Preview />
        <Editable.Input />
      </Editable.Area>
      <Editable.Control>
        <Editable.EditTrigger>Edit</Editable.EditTrigger>
        <Editable.SubmitTrigger>Save</Editable.SubmitTrigger>
        <Editable.CancelTrigger>Cancel</Editable.CancelTrigger>
      </Editable.Control>
    </Editable.Root>,
  );
}

/**
 * Machine-level helper for testing submit/cancel logic
 */
function createEditable(value = "Hello World") {
  const machine = createEditableMachine({ id: "edit-1", value });
  let state = machine.initialState;
  let context = machine.initialContext;

  function send(event: Parameters<typeof machine.transition>[2]) {
    const result = machine.transition(state, context, event);
    state = result.state;
    context = result.context;
  }

  function getApi() {
    return connect(state, context, send);
  }

  return { send, getApi, getState: () => state, getContext: () => context };
}

describe("Editable", () => {
  it("shows preview text by default", () => {
    renderEditable();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    const preview = screen.getByText("Hello World");
    expect(preview).not.toHaveAttribute("hidden");
  });

  it("click on preview enters edit mode with input", async () => {
    const user = userEvent.setup();
    renderEditable();

    const preview = screen.getByText("Hello World");
    await user.click(preview);

    await waitFor(() => {
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("hidden");
      expect(input).toHaveValue("Hello World");
    });
  });

  it("Escape cancels and reverts", async () => {
    const user = userEvent.setup();
    renderEditable();

    const editBtn = screen.getByRole("button", { name: "Edit" });
    await user.click(editBtn);

    await waitFor(() => {
      expect(screen.getByRole("textbox")).not.toHaveAttribute("hidden");
    });

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Changed");
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });
  });

  // Machine-level tests for submit/cancel logic
  it("EDIT transitions from preview to editing", () => {
    const { send, getState, getContext } = createEditable("Hello World");
    expect(getState()).toBe("preview");

    send({ type: "EDIT" });
    expect(getState()).toBe("editing");
    expect(getContext().previousValue).toBe("Hello World");
  });

  it("Enter submits new value (machine level)", () => {
    const { send, getState, getContext } = createEditable("Hello World");

    send({ type: "EDIT" });
    expect(getState()).toBe("editing");

    send({ type: "INPUT_CHANGE", value: "New Value" });
    expect(getContext().value).toBe("New Value");

    send({ type: "KEY_DOWN", key: "Enter" });
    expect(getState()).toBe("preview");
    expect(getContext().value).toBe("New Value");
  });

  it("Escape cancels and reverts (machine level)", () => {
    const { send, getState, getContext } = createEditable("Hello World");

    send({ type: "EDIT" });
    send({ type: "INPUT_CHANGE", value: "Changed" });
    expect(getContext().value).toBe("Changed");

    send({ type: "KEY_DOWN", key: "Escape" });
    expect(getState()).toBe("preview");
    expect(getContext().value).toBe("Hello World"); // reverted
  });

  it("SUBMIT preserves new value", () => {
    const { send, getState, getContext } = createEditable("Hello");

    send({ type: "EDIT" });
    send({ type: "INPUT_CHANGE", value: "Updated" });
    send({ type: "SUBMIT" });

    expect(getState()).toBe("preview");
    expect(getContext().value).toBe("Updated");
    expect(getContext().previousValue).toBe("Updated"); // updated to new value
  });

  it("CANCEL reverts to previous value", () => {
    const { send, getState, getContext } = createEditable("Original");

    send({ type: "EDIT" });
    send({ type: "INPUT_CHANGE", value: "Modified" });
    send({ type: "CANCEL" });

    expect(getState()).toBe("preview");
    expect(getContext().value).toBe("Original");
  });

  it("preview props show value or placeholder", () => {
    const { getApi } = createEditable("Hello");
    const previewProps = getApi().getPreviewProps();
    expect(previewProps.children).toBe("Hello");
    expect(previewProps.hidden).toBe(false);
    expect(previewProps.role).toBe("button");
  });

  it("input is hidden when not editing", () => {
    const { getApi } = createEditable("Hello");
    const inputProps = getApi().getInputProps();
    expect(inputProps.hidden).toBe(true);
    expect(inputProps.value).toBe("Hello");
  });
});
