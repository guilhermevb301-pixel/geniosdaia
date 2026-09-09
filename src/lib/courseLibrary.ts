import type { ProductSlug } from "@/hooks/useUserProducts";

export interface CourseSectionRow {
  id: string;
  title: string;
  order_index: number;
  product_slug: string | null;
}

export interface CourseModuleRow {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  section_id: string | null;
}

export interface CourseLessonRow {
  id: string;
  module_id: string;
}

export interface CourseProgressRow {
  lesson_id: string;
  completed: boolean | null;
}

export interface CourseModuleView {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  orderIndex: number;
  sectionId: string | null;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
}

export interface CourseSectionView {
  id: string;
  title: string;
  productSlug: string | null;
  orderIndex: number;
  moduleCount: number;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  locked: boolean;
  modules: CourseModuleView[];
}

export interface CourseLibraryInput {
  sections: CourseSectionRow[];
  modules: CourseModuleRow[];
  lessons: CourseLessonRow[];
  progress: CourseProgressRow[];
  hasProduct: (slug: ProductSlug) => boolean;
}

export interface CourseLibraryView {
  sections: CourseSectionView[];
  modulesWithoutSection: CourseModuleView[];
}

function percent(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function buildCourseLibrary({
  sections,
  modules,
  lessons,
  progress,
  hasProduct,
}: CourseLibraryInput): CourseLibraryView {
  const completedLessonIds = new Set(
    progress.filter((item) => item.completed).map((item) => item.lesson_id),
  );
  const lessonsByModule = new Map<string, CourseLessonRow[]>();

  lessons.forEach((lesson) => {
    const current = lessonsByModule.get(lesson.module_id) ?? [];
    current.push(lesson);
    lessonsByModule.set(lesson.module_id, current);
  });

  const moduleViews = modules.map<CourseModuleView>((module) => {
    const moduleLessons = lessonsByModule.get(module.id) ?? [];
    const completedLessons = moduleLessons.filter((lesson) =>
      completedLessonIds.has(lesson.id),
    ).length;

    return {
      id: module.id,
      title: module.title,
      description: module.description,
      coverImageUrl: module.cover_image_url,
      orderIndex: module.order_index,
      sectionId: module.section_id,
      completedLessons,
      totalLessons: moduleLessons.length,
      progressPercent: percent(completedLessons, moduleLessons.length),
    };
  });

  const sectionsView = [...sections]
    .sort((a, b) => a.order_index - b.order_index)
    .map<CourseSectionView>((section) => {
      const sectionModules = moduleViews
        .filter((module) => module.sectionId === section.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      const completedLessons = sectionModules.reduce(
        (total, module) => total + module.completedLessons,
        0,
      );
      const totalLessons = sectionModules.reduce(
        (total, module) => total + module.totalLessons,
        0,
      );

      return {
        id: section.id,
        title: section.title.trim(),
        productSlug: section.product_slug,
        orderIndex: section.order_index,
        moduleCount: sectionModules.length,
        completedLessons,
        totalLessons,
        progressPercent: percent(completedLessons, totalLessons),
        locked:
          Boolean(section.product_slug) &&
          !hasProduct(section.product_slug as ProductSlug),
        modules: sectionModules,
      };
    })
    .filter((section) => section.moduleCount > 0);

  return {
    sections: sectionsView,
    modulesWithoutSection: moduleViews
      .filter((module) => !module.sectionId)
      .sort((a, b) => a.orderIndex - b.orderIndex),
  };
}
