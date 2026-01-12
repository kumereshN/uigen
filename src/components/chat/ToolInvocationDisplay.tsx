"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  state: string;
  result?: unknown;
  toolName: string;
  args?: {
    command?: string;
    path?: string;
    new_path?: string;
  };
}

interface ToolInvocationDisplayProps {
  toolInvocation: ToolInvocation;
}

export function getToolMessage(toolInvocation: ToolInvocation): string {
  const { toolName, args } = toolInvocation;
  const path = args?.path || "file";
  const filename = path.split("/").pop() || path;

  if (toolName === "str_replace_editor") {
    const command = args?.command;
    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
        return `Editing ${filename}`;
      case "insert":
        return `Editing ${filename}`;
      case "view":
        return `Reading ${filename}`;
      default:
        return `Modifying ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    const command = args?.command;
    switch (command) {
      case "rename":
        const newFilename = args?.new_path?.split("/").pop() || "file";
        return `Renaming ${filename} to ${newFilename}`;
      case "delete":
        return `Deleting ${filename}`;
      default:
        return `Managing ${filename}`;
    }
  }

  return toolName;
}

export function ToolInvocationDisplay({ toolInvocation }: ToolInvocationDisplayProps) {
  const isComplete = toolInvocation.state === "result" && toolInvocation.result;
  const message = getToolMessage(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
