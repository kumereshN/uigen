import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationDisplay, getToolMessage } from "../ToolInvocationDisplay";

afterEach(() => {
  cleanup();
});

// Tests for getToolMessage function
test("getToolMessage returns 'Creating' for str_replace_editor create command", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/Button.jsx" },
  });
  expect(result).toBe("Creating Button.jsx");
});

test("getToolMessage returns 'Editing' for str_replace_editor str_replace command", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/App.jsx" },
  });
  expect(result).toBe("Editing App.jsx");
});

test("getToolMessage returns 'Editing' for str_replace_editor insert command", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "insert", path: "/utils/helpers.ts" },
  });
  expect(result).toBe("Editing helpers.ts");
});

test("getToolMessage returns 'Reading' for str_replace_editor view command", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "view", path: "/config.json" },
  });
  expect(result).toBe("Reading config.json");
});

test("getToolMessage returns 'Modifying' for unknown str_replace_editor command", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "unknown", path: "/test.txt" },
  });
  expect(result).toBe("Modifying test.txt");
});

test("getToolMessage returns 'Renaming' for file_manager rename command", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "file_manager",
    args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
  });
  expect(result).toBe("Renaming old.jsx to new.jsx");
});

test("getToolMessage returns 'Deleting' for file_manager delete command", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "file_manager",
    args: { command: "delete", path: "/unused.css" },
  });
  expect(result).toBe("Deleting unused.css");
});

test("getToolMessage returns 'Managing' for unknown file_manager command", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "file_manager",
    args: { command: "unknown", path: "/file.txt" },
  });
  expect(result).toBe("Managing file.txt");
});

test("getToolMessage returns tool name for unknown tools", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "unknown_tool",
    args: { path: "/file.txt" },
  });
  expect(result).toBe("unknown_tool");
});

test("getToolMessage handles missing args gracefully", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "str_replace_editor",
  });
  expect(result).toBe("Modifying file");
});

test("getToolMessage handles missing path gracefully", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "create" },
  });
  expect(result).toBe("Creating file");
});

test("getToolMessage extracts filename from nested path", () => {
  const result = getToolMessage({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/components/ui/Button.tsx" },
  });
  expect(result).toBe("Creating Button.tsx");
});

// Tests for ToolInvocationDisplay component
test("renders loading state with spinner", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        state: "pending",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
});

test("renders completed state with green indicator", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        state: "result",
        result: { success: true },
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  const greenDot = document.querySelector(".bg-emerald-500");
  expect(greenDot).not.toBeNull();
});

test("renders correct message for str_replace command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        state: "result",
        result: { success: true },
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/components/Card.jsx" },
      }}
    />
  );

  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("renders correct message for file_manager delete", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        state: "result",
        result: { success: true },
        toolName: "file_manager",
        args: { command: "delete", path: "/temp.js" },
      }}
    />
  );

  expect(screen.getByText("Deleting temp.js")).toBeDefined();
});

test("renders correct message for file_manager rename", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        state: "result",
        result: { success: true },
        toolName: "file_manager",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
      }}
    />
  );

  expect(screen.getByText("Renaming old.jsx to new.jsx")).toBeDefined();
});

test("does not show spinner when state is result", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        state: "result",
        result: { success: true },
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  const spinner = document.querySelector(".animate-spin");
  expect(spinner).toBeNull();
});

test("shows spinner when state is not result", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        state: "call",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
});
