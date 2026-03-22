import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import type {
  AdminUserResponse,
  AdminServiceRequestResponse,
  AdminInvoiceResponse,
  AdminContractorApplicationResponse,
} from "@shared/schema";

function useAdminCheck() {
  return useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/admin-check"],
    retry: false,
  });
}

function useAdminUsers() {
  return useQuery<AdminUserResponse[]>({
    queryKey: ["/api/admin/users"],
  });
}

function useAdminServiceRequests() {
  return useQuery<AdminServiceRequestResponse[]>({
    queryKey: ["/api/admin/service-requests"],
  });
}

function useAdminInvoices() {
  return useQuery<AdminInvoiceResponse[]>({
    queryKey: ["/api/admin/invoices"],
  });
}

function useAdminContractorApplications() {
  return useQuery<AdminContractorApplicationResponse[]>({
    queryKey: ["/api/admin/contractor-applications"],
  });
}

function UsersTable() {
  const { data: users, isLoading } = useAdminUsers();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", `/api/admin/users/${userId}/suspend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User suspended" });
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", `/api/admin/users/${userId}/unsuspend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User unsuspended" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-3" data-testid="text-admin-users-heading">All Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm" data-testid="table-admin-users">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-3 py-2 text-left">Name</th>
              <th className="border border-border px-3 py-2 text-left">Email</th>
              <th className="border border-border px-3 py-2 text-left">Role</th>
              <th className="border border-border px-3 py-2 text-left">Status</th>
              <th className="border border-border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? users.map((user) => (
              <tr key={user.id} data-testid={`row-user-${user.id}`}>
                <td className="border border-border px-3 py-2">
                  {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || "—"}
                </td>
                <td className="border border-border px-3 py-2">{user.email ?? "—"}</td>
                <td className="border border-border px-3 py-2">{user.profile?.role ?? "no profile"}</td>
                <td className="border border-border px-3 py-2" data-testid={`status-user-${user.id}`}>
                  {user.profile?.isSuspended ? "Suspended" : "Active"}
                </td>
                <td className="border border-border px-3 py-2">
                  {user.profile && (
                    user.profile.isSuspended ? (
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`button-unsuspend-${user.id}`}
                        onClick={() => unsuspendMutation.mutate(user.id)}
                        disabled={unsuspendMutation.isPending}
                      >
                        Unsuspend
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        data-testid={`button-suspend-${user.id}`}
                        onClick={() => suspendMutation.mutate(user.id)}
                        disabled={suspendMutation.isPending}
                      >
                        Suspend
                      </Button>
                    )
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="border border-border px-3 py-4 text-center text-muted-foreground">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ServiceRequestsTable() {
  const { data: requests, isLoading } = useAdminServiceRequests();

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-3" data-testid="text-admin-requests-heading">All Service Requests</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm" data-testid="table-admin-requests">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-3 py-2 text-left">Title</th>
              <th className="border border-border px-3 py-2 text-left">Category</th>
              <th className="border border-border px-3 py-2 text-left">Status</th>
              <th className="border border-border px-3 py-2 text-left">Homeowner</th>
            </tr>
          </thead>
          <tbody>
            {requests && requests.length > 0 ? requests.map((req) => (
              <tr key={req.id} data-testid={`row-request-${req.id}`}>
                <td className="border border-border px-3 py-2">{req.title}</td>
                <td className="border border-border px-3 py-2">{req.category}</td>
                <td className="border border-border px-3 py-2">{req.status}</td>
                <td className="border border-border px-3 py-2">{req.homeownerName ?? "—"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="border border-border px-3 py-4 text-center text-muted-foreground">No service requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoicesTable() {
  const { data: invoices, isLoading } = useAdminInvoices();

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-3" data-testid="text-admin-invoices-heading">All Invoices</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm" data-testid="table-admin-invoices">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-3 py-2 text-left">ID</th>
              <th className="border border-border px-3 py-2 text-left">Amount</th>
              <th className="border border-border px-3 py-2 text-left">Commission</th>
              <th className="border border-border px-3 py-2 text-left">Status</th>
              <th className="border border-border px-3 py-2 text-left">Service Request ID</th>
            </tr>
          </thead>
          <tbody>
            {invoices && invoices.length > 0 ? invoices.map((inv) => (
              <tr key={inv.id} data-testid={`row-invoice-${inv.id}`}>
                <td className="border border-border px-3 py-2">{inv.id}</td>
                <td className="border border-border px-3 py-2">${(inv.amount / 100).toFixed(2)}</td>
                <td className="border border-border px-3 py-2">${(inv.commissionAmount / 100).toFixed(2)}</td>
                <td className="border border-border px-3 py-2">{inv.status}</td>
                <td className="border border-border px-3 py-2">{inv.serviceRequestId}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="border border-border px-3 py-4 text-center text-muted-foreground">No invoices found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContractorApplicationsTable() {
  const { data: applications, isLoading } = useAdminContractorApplications();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approveMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", `/api/admin/contractors/${userId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contractor-applications"] });
      toast({ title: "Contractor approved" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", `/api/admin/contractors/${userId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contractor-applications"] });
      toast({ title: "Contractor rejected" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-3" data-testid="text-admin-applications-heading">Pending Contractor Applications</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm" data-testid="table-admin-applications">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-3 py-2 text-left">Name</th>
              <th className="border border-border px-3 py-2 text-left">Business Name</th>
              <th className="border border-border px-3 py-2 text-left">Email</th>
              <th className="border border-border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications && applications.length > 0 ? applications.map((app) => (
              <tr key={app.userId} data-testid={`row-application-${app.userId}`}>
                <td className="border border-border px-3 py-2">
                  {app.user ? `${app.user.firstName ?? ''} ${app.user.lastName ?? ''}`.trim() || "—" : "—"}
                </td>
                <td className="border border-border px-3 py-2">{app.businessName ?? "—"}</td>
                <td className="border border-border px-3 py-2">{app.user?.email ?? "—"}</td>
                <td className="border border-border px-3 py-2 flex gap-2">
                  <Button
                    size="sm"
                    data-testid={`button-approve-${app.userId}`}
                    onClick={() => approveMutation.mutate(app.userId)}
                    disabled={approveMutation.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    data-testid={`button-reject-${app.userId}`}
                    onClick={() => rejectMutation.mutate(app.userId)}
                    disabled={rejectMutation.isPending}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="border border-border px-3 py-4 text-center text-muted-foreground">No pending applications</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Admin() {
  const { data: adminCheck, isLoading } = useAdminCheck();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-3xl font-bold mb-2" data-testid="text-access-denied">403 — Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" data-testid="text-admin-heading">Admin Dashboard</h1>
        <UsersTable />
        <ServiceRequestsTable />
        <InvoicesTable />
        <ContractorApplicationsTable />
      </main>
    </div>
  );
}
