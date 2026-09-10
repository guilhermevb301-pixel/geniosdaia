import { ArrowUpRight, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { groupMentorshipCoverImage } from "@/lib/sectionCoverImages";

export function GroupMentorshipCard() {
  return (
    <Link
      to="/eventos"
      aria-label="Ver mentorias em grupo"
      className="focus-ring group block h-full rounded-lg"
    >
      <article className="flex h-full flex-col">
        <div
          data-section-cover="portrait"
          className="relative aspect-[9/16] overflow-hidden rounded-lg border border-border/80 bg-secondary transition-colors duration-300 group-hover:border-primary/60"
        >
          <ImageWithSkeleton
            src={groupMentorshipCoverImage}
            alt=""
            containerClassName="absolute inset-0"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            objectFit="cover"
            optimizedWidth={480}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/10" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase text-white backdrop-blur-sm">
            <Radio className="h-3 w-3 text-primary" aria-hidden="true" />
            Ao vivo
          </span>
          <ArrowUpRight
            className="absolute bottom-4 right-4 h-5 w-5 text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-1 flex-col pt-3.5">
          <h2 className="min-h-10 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            Mentorias em grupo
          </h2>
          <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-relaxed text-muted-foreground">
            Encontros ao vivo para avançar com direção e feedback.
          </p>
          <span className="mt-3 text-[11px] font-medium text-primary">Ver agenda</span>
        </div>
      </article>
    </Link>
  );
}
