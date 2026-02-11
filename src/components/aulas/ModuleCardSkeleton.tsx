import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

export function ModuleCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <div className="relative">
        <AspectRatio ratio={3 / 4}>
          <Skeleton className="h-full w-full" />
        </AspectRatio>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
