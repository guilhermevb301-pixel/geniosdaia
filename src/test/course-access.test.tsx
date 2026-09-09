import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCourseModuleAccess } from "@/hooks/useCourseModuleAccess";

const state = vi.hoisted(() => ({ locked: true }));

vi.mock("@/hooks/useCourseLibrary", () => ({
  useCourseLibrary: () => ({
    sections: [
      {
        id: "section-1",
        title: "Sessão protegida",
        locked: state.locked,
        modules: [{ id: "module-1" }],
      },
    ],
    modulesWithoutSection: [],
    isLoading: false,
    isError: false,
  }),
}));

describe("useCourseModuleAccess", () => {
  it("resolves the owner session and its lock state", () => {
    const { result } = renderHook(() => useCourseModuleAccess("module-1"));

    expect(result.current.section?.id).toBe("section-1");
    expect(result.current.isLocked).toBe(true);
  });

  it("does not lock modules without a session", () => {
    const { result } = renderHook(() => useCourseModuleAccess("unknown-module"));

    expect(result.current.section).toBeUndefined();
    expect(result.current.isLocked).toBe(false);
  });
});
