import { Badge } from "@/components/ui/badge";

type StatusType = "open" | "in_progress" | "completed" | "cancelled" | "pending" | "accepted" | "rejected" | "paid";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200" },
  accepted: { label: "Accepted", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200" },
  paid: { label: "Paid", className: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as StatusType] || { label: status, className: "bg-gray-100 text-gray-700" };
  
  return (
    <Badge variant="outline" className={`${config.className} font-medium px-2.5 py-0.5 rounded-full capitalize`}>
      {config.label}
    </Badge>
  );
}
