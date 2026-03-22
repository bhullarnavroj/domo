import { ServiceRequest } from "@shared/schema";
import { format } from "date-fns";
import { MapPin, Calendar, ArrowRight, Clock } from "lucide-react";
import { Link } from "wouter";

const categoryColors: Record<string, string> = {
  plumbing: "bg-blue-500",
  electrical: "bg-yellow-500",
  roofing: "bg-orange-500",
  landscaping: "bg-green-500",
  cleaning: "bg-teal-500",
  painting: "bg-purple-500",
  hvac: "bg-cyan-500",
  moving: "bg-pink-500",
  photography: "bg-rose-500",
  legal: "bg-slate-500",
  carpentry: "bg-amber-700",
  default: "bg-primary",
};

function getCategoryColor(category: string) {
  const key = category.toLowerCase().split(" ")[0];
  return categoryColors[key] ?? categoryColors.default;
}

const statusConfig = {
  open: { label: "Open", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
};

interface ServiceRequestCardProps {
  request: ServiceRequest;
  role: "homeowner" | "contractor";
}

export function ServiceRequestCard({ request, role }: ServiceRequestCardProps) {
  const status = statusConfig[request.status] ?? statusConfig.open;
  const dotColor = getCategoryColor(request.category);
  const postedAt = request.createdAt ? format(new Date(request.createdAt), "MMM d") : "";

  return (
    <Link href={`/requests/${request.id}`}>
      <div
        className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-200 cursor-pointer flex flex-col h-full"
        data-testid={`card-request-${request.id}`}
      >
        {/* Color accent top bar */}
        <div className={`h-1 w-full ${dotColor}`} />

        <div className="p-5 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0 mt-1`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {request.category}
              </span>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${status.className}`}>
              {status.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold font-display leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {request.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-1">
            {request.description}
          </p>

          {/* Meta */}
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground border-t border-border/50 pt-3 mt-auto">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary/60" />
              <span className="truncate">{request.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary/60" />
                <span>Posted {postedAt}</span>
              </div>
              <div className="flex items-center gap-1 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                {role === "contractor" ? "Quote now" : "View"} <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
