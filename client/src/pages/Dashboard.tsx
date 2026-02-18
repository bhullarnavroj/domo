import { useProfile } from "@/hooks/use-profiles";
import { useServiceRequests } from "@/hooks/use-service-requests";
import { Navigation } from "@/components/Navigation";
import { ServiceRequestCard } from "@/components/ServiceRequestCard";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  
  // For homeowners, show their requests. For contractors, maybe show leads or their active jobs?
  // Let's simplify: Homeowners see their requests. Contractors see assigned/quoted jobs (we'd need a separate hook for that, 
  // but for MVP let's just show open requests for contractors to find work).
  const { data: requests, isLoading: requestsLoading } = useServiceRequests(
    profile?.role === "homeowner" ? undefined : { status: "open" }
  );

  if (profileLoading || requestsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If homeowner creates request, they are the owner.
  // If contractor views list, they see ALL open requests (marketplace).
  // We need to filter for Homeowner dashboard to ONLY show THEIR requests.
  // The API list endpoint returns ALL requests currently. 
  // REAL APP: Backend should filter 'list' based on user role/ID.
  // MVP HACK: Filter client-side based on role.
  
  const myRequests = profile?.role === "homeowner" 
    ? requests?.filter(r => r.homeownerId === profile.userId)
    : requests; // Contractors see all open requests (Leads)

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {profile?.role === "homeowner" ? "My Projects" : "Available Leads"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {profile?.role === "homeowner" 
                ? "Manage your service requests and view quotes." 
                : "Find new opportunities in your area."}
            </p>
          </div>
          
          {profile?.role === "homeowner" && (
            <Link href="/create-request">
              <Button size="lg" className="shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-5 w-5" /> Post New Request
              </Button>
            </Link>
          )}
        </div>

        {myRequests && myRequests.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRequests.map((request) => (
              <ServiceRequestCard 
                key={request.id} 
                request={request} 
                role={profile?.role as "homeowner" | "contractor"} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-border">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-display mb-2">No requests found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              {profile?.role === "homeowner" 
                ? "You haven't posted any service requests yet. Get started by creating your first project." 
                : "There are currently no open service requests in your area. Check back soon!"}
            </p>
            {profile?.role === "homeowner" && (
              <Link href="/create-request">
                <Button>Create Request</Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
