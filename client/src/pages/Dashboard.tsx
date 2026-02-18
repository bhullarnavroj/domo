import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { useServiceRequests } from "@/hooks/use-service-requests";
import { Navigation } from "@/components/Navigation";
import { ServiceRequestCard } from "@/components/ServiceRequestCard";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ArrowLeftRight } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { mutate: updateProfile, isPending: isSwtiching } = useUpdateProfile();
  const { toast } = useToast();
  
  const { data: requests, isLoading: requestsLoading } = useServiceRequests(
    profile?.role === "homeowner" ? undefined : { status: "open" }
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

  if (profileLoading || requestsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const myRequests = profile?.role === "homeowner" 
    ? requests?.filter(r => r.homeownerId === profile.userId)
    : requests;

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
