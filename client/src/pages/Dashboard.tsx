import { useProfile } from "@/hooks/use-profiles";
import { useServiceRequests } from "@/hooks/use-service-requests";
import { Navigation } from "@/components/Navigation";
import { ServiceRequestCard } from "@/components/ServiceRequestCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { CATEGORIES } from "@shared/categories";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;
  const isContractor = profile?.role === "contractor";
  const isHomeowner = profile?.role === "homeowner";

  const { data: requestsData, isLoading: requestsLoading } = useServiceRequests({
    status: isContractor ? "open" : undefined,
    search: search || undefined,
    category: categoryFilter || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allRequests = requestsData?.data ?? [];
  const totalRequests = requestsData?.total ?? 0;
  const totalPages = Math.ceil(totalRequests / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold" data-testid="text-dashboard-title">
              {isHomeowner ? "My Jobs" : "Available Jobs"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isHomeowner
                ? "Track your posted jobs and incoming quotes."
                : "Browse open jobs in your area and submit quotes."}
            </p>
          </div>
          {isHomeowner && (
            <Link href="/create-request">
              <Button size="lg" className="rounded-xl" data-testid="button-new-request">
                <Plus className="mr-2 h-5 w-5" /> Post a Job
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isHomeowner ? "Search your jobs..." : "Search available jobs..."}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-11 rounded-xl"
          />
        </div>

        {/* Category filter chips — contractors only */}
        {isContractor && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => { setCategoryFilter(""); setPage(0); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                !categoryFilter ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              All Trades
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setCategoryFilter(cat.value === categoryFilter ? "" : cat.value); setPage(0); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  categoryFilter === cat.value ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {requestsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : allRequests.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allRequests.map((request) => (
                <ServiceRequestCard
                  key={request.id}
                  request={request}
                  role={profile?.role as "homeowner" | "contractor"}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <Button variant="outline" className="rounded-xl" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
                <Button variant="outline" className="rounded-xl" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border border-dashed border-border">
            <div className="text-5xl mb-4">{isHomeowner ? "📋" : "🔍"}</div>
            <h3 className="text-xl font-bold font-display mb-2" data-testid="text-empty-state">
              {isHomeowner ? "No jobs posted yet" : "No open jobs right now"}
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              {isHomeowner
                ? "Post your first job and start getting quotes from verified local tradespeople."
                : "New jobs are posted daily. Check back soon or clear your filters."}
            </p>
            {isHomeowner && (
              <Link href="/create-request">
                <Button className="rounded-xl" data-testid="button-create-first">
                  <Plus className="mr-2 h-4 w-4" /> Post Your First Job
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
