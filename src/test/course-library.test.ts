import { describe, expect, it } from "vitest";
import { buildCourseLibrary } from "@/lib/courseLibrary";

describe("buildCourseLibrary", () => {
  it("groups modules by session and aggregates lesson progress", () => {
    const result = buildCourseLibrary({
      sections: [
        {
          id: "section-1",
          title: "Primeira sessao",
          order_index: 0,
          product_slug: "genios-ia",
        },
      ],
      modules: [
        {
          id: "m-2",
          title: "Segundo modulo",
          description: null,
          cover_image_url: null,
          order_index: 2,
          section_id: "section-1",
        },
        {
          id: "m-1",
          title: "Primeiro modulo",
          description: null,
          cover_image_url: null,
          order_index: 1,
          section_id: "section-1",
        },
      ],
      lessons: [
        { id: "l-1", module_id: "m-1" },
        { id: "l-2", module_id: "m-1" },
        { id: "l-3", module_id: "m-2" },
        { id: "l-4", module_id: "m-2" },
        { id: "l-5", module_id: "m-2" },
      ],
      progress: [
        { lesson_id: "l-1", completed: true },
        { lesson_id: "l-3", completed: true },
        { lesson_id: "l-5", completed: false },
      ],
      hasProduct: () => true,
    });

    expect(result.sections[0]).toMatchObject({
      id: "section-1",
      moduleCount: 2,
      totalLessons: 5,
      completedLessons: 2,
      progressPercent: 40,
      locked: false,
    });
    expect(result.sections[0].modules.map((module) => module.id)).toEqual([
      "m-1",
      "m-2",
    ]);
  });

  it("keeps ungrouped modules and marks inaccessible sessions as locked", () => {
    const result = buildCourseLibrary({
      sections: [
        {
          id: "section-locked",
          title: "Sessao bloqueada",
          order_index: 0,
          product_slug: "bonus-genios",
        },
      ],
      modules: [
        {
          id: "m-locked",
          title: "Modulo bloqueado",
          description: null,
          cover_image_url: null,
          order_index: 0,
          section_id: "section-locked",
        },
        {
          id: "m-free",
          title: "Modulo livre",
          description: null,
          cover_image_url: null,
          order_index: 0,
          section_id: null,
        },
      ],
      lessons: [],
      progress: [],
      hasProduct: () => false,
    });

    expect(result.sections[0].locked).toBe(true);
    expect(result.modulesWithoutSection.map((module) => module.id)).toEqual([
      "m-free",
    ]);
  });
});
