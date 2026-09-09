import { useCourseLibrary } from "@/hooks/useCourseLibrary";

export function useCourseModuleAccess(moduleId: string | undefined) {
  const library = useCourseLibrary();
  const section = moduleId
    ? library.sections.find((candidate) =>
        candidate.modules.some((module) => module.id === moduleId),
      )
    : undefined;
  const ungroupedModule = moduleId
    ? library.modulesWithoutSection.find((module) => module.id === moduleId)
    : undefined;

  return {
    section,
    module:
      section?.modules.find((candidate) => candidate.id === moduleId) ??
      ungroupedModule,
    isLocked: section?.locked ?? false,
    isLoading: library.isLoading,
    isError: library.isError,
  };
}
