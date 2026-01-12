import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "../use-auth";

// Mock dependencies
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

// Import mocked modules for control
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initial state", () => {
    test("returns signIn, signUp functions and isLoading state", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.signIn).toBeInstanceOf(Function);
      expect(result.current.signUp).toBeInstanceOf(Function);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signIn", () => {
    test("sets isLoading to true during sign in", async () => {
      vi.mocked(signInAction).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: false }), 100))
      );

      const { result } = renderHook(() => useAuth());

      let promise: Promise<any>;
      act(() => {
        promise = result.current.signIn("test@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("returns result from signInAction on failure", async () => {
      const errorResult = { success: false, error: "Invalid credentials" };
      vi.mocked(signInAction).mockResolvedValue(errorResult);

      const { result } = renderHook(() => useAuth());

      let returnedResult: any;
      await act(async () => {
        returnedResult = await result.current.signIn("test@example.com", "wrongpassword");
      });

      expect(returnedResult).toEqual(errorResult);
      expect(signInAction).toHaveBeenCalledWith("test@example.com", "wrongpassword");
    });

    test("calls handlePostSignIn on successful sign in", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([{ id: "project-1", name: "Test", createdAt: new Date(), updatedAt: new Date() }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    test("sets isLoading to false even on error", async () => {
      vi.mocked(signInAction).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn("test@example.com", "password123");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp", () => {
    test("sets isLoading to true during sign up", async () => {
      vi.mocked(signUpAction).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: false }), 100))
      );

      const { result } = renderHook(() => useAuth());

      let promise: Promise<any>;
      act(() => {
        promise = result.current.signUp("test@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("returns result from signUpAction on failure", async () => {
      const errorResult = { success: false, error: "Email already registered" };
      vi.mocked(signUpAction).mockResolvedValue(errorResult);

      const { result } = renderHook(() => useAuth());

      let returnedResult: any;
      await act(async () => {
        returnedResult = await result.current.signUp("test@example.com", "password123");
      });

      expect(returnedResult).toEqual(errorResult);
      expect(signUpAction).toHaveBeenCalledWith("test@example.com", "password123");
    });

    test("calls handlePostSignIn on successful sign up", async () => {
      vi.mocked(signUpAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([]);
      vi.mocked(createProject).mockResolvedValue({
        id: "new-project",
        name: "New Design",
        userId: "user-1",
        messages: "[]",
        data: "{}",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password123");
      });

      expect(mockPush).toHaveBeenCalledWith("/new-project");
    });

    test("sets isLoading to false even on error", async () => {
      vi.mocked(signUpAction).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUp("test@example.com", "password123");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("handlePostSignIn", () => {
    test("creates project from anonymous work and redirects", async () => {
      const anonData = {
        messages: [{ id: "1", role: "user", content: "Hello" }],
        fileSystemData: { "/App.jsx": { type: "file", content: "test" } },
      };

      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(anonData);
      vi.mocked(createProject).mockResolvedValue({
        id: "anon-project",
        name: "Design from 10:00:00 AM",
        userId: "user-1",
        messages: JSON.stringify(anonData.messages),
        data: JSON.stringify(anonData.fileSystemData),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^Design from /),
        messages: anonData.messages,
        data: anonData.fileSystemData,
      });
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/anon-project");
    });

    test("does not create project from empty anonymous work", async () => {
      const emptyAnonData = {
        messages: [],
        fileSystemData: {},
      };

      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(emptyAnonData);
      vi.mocked(getProjects).mockResolvedValue([{ id: "existing-project", name: "Test", createdAt: new Date(), updatedAt: new Date() }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(clearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-project");
    });

    test("redirects to most recent project when no anonymous work", async () => {
      const projects = [
        { id: "recent-project", name: "Recent", createdAt: new Date(), updatedAt: new Date() },
        { id: "old-project", name: "Old", createdAt: new Date(), updatedAt: new Date() },
      ];

      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue(projects);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(mockPush).toHaveBeenCalledWith("/recent-project");
    });

    test("creates new project when user has no existing projects", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([]);
      vi.mocked(createProject).mockResolvedValue({
        id: "brand-new-project",
        name: "New Design #12345",
        userId: "user-1",
        messages: "[]",
        data: "{}",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/brand-new-project");
    });

    test("does not call handlePostSignIn on failed sign in", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: false, error: "Invalid credentials" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "wrongpassword");
      });

      expect(getAnonWorkData).not.toHaveBeenCalled();
      expect(getProjects).not.toHaveBeenCalled();
      expect(createProject).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    test("does not call handlePostSignIn on failed sign up", async () => {
      vi.mocked(signUpAction).mockResolvedValue({ success: false, error: "Email already registered" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password123");
      });

      expect(getAnonWorkData).not.toHaveBeenCalled();
      expect(getProjects).not.toHaveBeenCalled();
      expect(createProject).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    test("handles null anonWork data gracefully", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([{ id: "project-1", name: "Test", createdAt: new Date(), updatedAt: new Date() }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    test("handles anonWork with messages but no fileSystemData", async () => {
      const anonData = {
        messages: [{ id: "1", role: "user", content: "Hello" }],
        fileSystemData: {},
      };

      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(anonData);
      vi.mocked(createProject).mockResolvedValue({
        id: "anon-project",
        name: "Design from 10:00:00 AM",
        userId: "user-1",
        messages: JSON.stringify(anonData.messages),
        data: "{}",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalled();
      expect(clearAnonWork).toHaveBeenCalled();
    });

    test("multiple sign in calls are handled sequentially", async () => {
      let resolveFirst: (value: any) => void;
      let resolveSecond: (value: any) => void;

      vi.mocked(signInAction)
        .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
        .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve; }));

      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([{ id: "project-1", name: "Test", createdAt: new Date(), updatedAt: new Date() }]);

      const { result } = renderHook(() => useAuth());

      // Start first sign in
      let firstPromise: Promise<any>;
      act(() => {
        firstPromise = result.current.signIn("test1@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      // Start second sign in while first is still loading
      let secondPromise: Promise<any>;
      act(() => {
        secondPromise = result.current.signIn("test2@example.com", "password456");
      });

      // Resolve first
      await act(async () => {
        resolveFirst!({ success: true });
        await firstPromise;
      });

      // Resolve second
      await act(async () => {
        resolveSecond!({ success: true });
        await secondPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
