import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import * as TagsInput from "@/components/tags-input";

/**
 * Stateful wrapper that re-renders tags based on internal state
 */
function StatefulTagsInput(props: {
  defaultValue?: string[];
  max?: number;
  allowDuplicates?: boolean;
}) {
  const { defaultValue = [], max, allowDuplicates } = props;
  const [tags, setTags] = React.useState(defaultValue);

  return (
    <TagsInput.Root
      value={tags}
      onValueChange={setTags}
      max={max}
      allowDuplicates={allowDuplicates}
    >
      <TagsInput.Label>Tags</TagsInput.Label>
      <TagsInput.Control>
        {tags.map((tag, i) => (
          <TagsInput.Item key={`${tag}-${i}`} index={i} value={tag}>
            <TagsInput.ItemPreview index={i}>
              <TagsInput.ItemText index={i}>{tag}</TagsInput.ItemText>
              <TagsInput.ItemDeleteTrigger index={i}>x</TagsInput.ItemDeleteTrigger>
            </TagsInput.ItemPreview>
          </TagsInput.Item>
        ))}
        <TagsInput.Input />
      </TagsInput.Control>
    </TagsInput.Root>
  );
}

import React from "react";

describe("TagsInput", () => {
  it("type text + Enter adds tag", async () => {
    const user = userEvent.setup();
    render(<StatefulTagsInput />);

    const input = screen.getByRole("textbox", { name: /add tag/i });
    await user.click(input);
    await user.type(input, "react{Enter}");

    await waitFor(() => {
      expect(screen.getByText("react")).toBeInTheDocument();
    });
  });

  it("Backspace in empty input removes last tag", async () => {
    const user = userEvent.setup();

    render(<StatefulTagsInput defaultValue={["react", "vue"]} />);

    expect(screen.getByText("vue")).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: /add tag/i });
    await user.click(input);
    await user.keyboard("{Backspace}");

    await waitFor(() => {
      expect(screen.queryByText("vue")).not.toBeInTheDocument();
    });
  });

  it("delete button on tag removes it", async () => {
    const user = userEvent.setup();

    render(<StatefulTagsInput defaultValue={["react", "vue"]} />);

    const deleteButtons = screen.getAllByRole("button", { name: /remove tag/i });
    expect(deleteButtons.length).toBe(2);

    await user.click(deleteButtons[0]!);

    await waitFor(() => {
      expect(screen.queryByText("react")).not.toBeInTheDocument();
      expect(screen.getByText("vue")).toBeInTheDocument();
    });
  });

  it("max tags limit prevents adding more", async () => {
    const user = userEvent.setup();

    render(<StatefulTagsInput defaultValue={["react", "vue"]} max={2} />);

    const input = screen.getByRole("textbox", { name: /add tag/i });
    await user.click(input);
    await user.type(input, "angular{Enter}");

    // Should NOT add "angular" since max is 2
    await waitFor(() => {
      expect(screen.queryByText("angular")).not.toBeInTheDocument();
    });
  });

  it("duplicate prevention", async () => {
    const user = userEvent.setup();

    render(<StatefulTagsInput defaultValue={["react"]} />);

    const input = screen.getByRole("textbox", { name: /add tag/i });
    await user.click(input);
    await user.type(input, "react{Enter}");

    // Should still have only one "react" tag
    await waitFor(() => {
      const reactTags = screen.getAllByText("react");
      expect(reactTags.length).toBe(1);
    });
  });
});
