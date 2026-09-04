import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

export function ModuleCardSkeleton() {
  return (
    <div className="h-full">
      <div className="overflow-hidden rounded-[8px] border border-border">
        <AspectRatio ratio={4 / 3}>
          <Skeleton className="h-full w-full" />
        </AspectRatio>
      </div>
      <div className="space-y-3 pt-3.5">
        <Skeleton className="h-4 w-[88%]" />
        <Skeleton className="h-3 w-[62%]" />
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-[2px] flex-1" />
          <Skeleton className="h-3 w-7" />
        </div>
      </div>
    </div>
  );
}
