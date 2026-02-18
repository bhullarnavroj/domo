import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { ServiceRequest } from "@shared/schema";
import { format } from "date-fns";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface ServiceRequestCardProps {
  request: ServiceRequest;
  role: "homeowner" | "contractor";
}

export function ServiceRequestCard({ request, role }: ServiceRequestCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group border-border/60">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{request.category}</div>
            <h3 className="text-lg font-bold font-display line-clamp-1 group-hover:text-primary transition-colors">
              {request.title}
            </h3>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
          {request.description}
        </p>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary/70" />
            <span>{request.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary/70" />
            <span>Posted {format(new Date(request.createdAt!), "MMM d, yyyy")}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t bg-muted/20">
        <Link href={`/requests/${request.id}`} className="w-full">
          <Button variant="ghost" className="w-full justify-between hover:bg-primary hover:text-primary-foreground group-hover:translate-x-1 transition-all">
            {role === "contractor" ? "View & Quote" : "Manage Request"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
