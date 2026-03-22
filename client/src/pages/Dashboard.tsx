import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { useServiceRequests } from "@/hooks/use-service-requests";
import { Navigation } from "@/components/Navigation";
import { ServiceRequestCard } from "@/components/ServiceRequestCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, ArrowLeftRight, Search } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { mutate: updateProfile, isPending: isSwtiching } = useUpdateProfile();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  const { data: requestsData, isLoading: requestsLoading } = useServiceRequests(
    profile?.role === "homeowner"
      ? { search: search || undefined, limit: PAGE_SIZE, offset: page * PAGE_SIZE }
      : { status: "open", search: search || undefined, limit: PAGE_SIZE, offset: page * PAGE_SIZE }
  );

  const handleSwitchRole = () => {
    const newRole = profile?.role === "homeowner" ? "contractor" : "homeowner";
    updateProfile({ role: newRole }, {
      onSuccess: () => {
        toast({
          title: "Role switched",
          description: `You are now viewing as a ${newRole === "homeowner" ? "Property Owner" : "Service Provider"}.`,
        });
      },
    });
  };

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allRequests = requestsData?.data ?? [];
  const totalRequests = requestsData?.total ?? 0;
  const myRequests = profile?.role === "homeowner"
    ? allRequests.filter(r => r.homeownerId === profile.userId)
    : allRequests;
  const totalPages = Math.ceil(totalRequests / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground" data-testid="text-dashboard-title">
              {profile?.role === "homeowner" ? "My Projects" : "Available Leads"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {profile?.role === "homeowner" 
                ? "Manage your service requests and view quotes." 
                : "Find new opportunities from property owners in your area."}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="default"
              onClick={handleSwitchRole}
              disabled={isSwtiching}
              data-testid="button-switch-role"
            >
              {isSwtiching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="mr-2 h-4 w-4" />}
              Switch to {profile?.role === "homeowner" ? "Service Provider" : "Property Owner"}
            </Button>
            {profile?.role === "homeowner" && (
              <Link href="/create-request">
                <Button size="lg" data-testid="button-new-request">
                  <Plus className="mr-2 h-5 w-5" /> Post New Request
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, or location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>

        {requestsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : myRequests.length > 0 ? (
          <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRequests.map((request) => (
              <ServiceRequestCard
                key={request.id}
                request={request}
                role={profile?.role as "homeowner" | "contractor"}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-md border border-dashed border-border">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-display mb-2" data-testid="text-empty-state">No requests found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              {profile?.role === "homeowner" 
                ? "You haven't posted any service requests yet. Get started by creating your first project." 
                : "There are currently no open service requests in your area. Check back soon!"}
            </p>
            {profile?.role === "homeowner" && (
              <Link href="/create-request">
                <Button data-testid="button-create-first">Create Request</Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
