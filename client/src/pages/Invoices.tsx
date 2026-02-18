import { useInvoices, usePayInvoice, useEarnings } from "@/hooks/use-invoices";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, CreditCard, DollarSign, TrendingUp, Receipt, ArrowDownRight, Percent, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { useProfile } from "@/hooks/use-profiles";
import { useToast } from "@/hooks/use-toast";
import { COMMISSION_TIERS } from "@shared/commission";

function EarningsSummary() {
  const { data: earnings, isLoading } = useEarnings();

  if (isLoading || !earnings) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/60 animate-pulse">
            <CardContent className="p-6"><div className="h-16" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Earnings",
      value: `$${(earnings.totalEarnings / 100).toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
      testId: "card-stat-total-earnings",
    },
    {
      label: "DOMO Service Fee",
      value: `$${(earnings.totalCommission / 100).toFixed(2)}`,
      icon: ArrowDownRight,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      testId: "card-stat-domo-service-fee",
    },
    {
      label: "Net Payout",
      value: `$${(earnings.netEarnings / 100).toFixed(2)}`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      testId: "card-stat-net-payout",
    },
    {
      label: "Invoices",
      value: `${earnings.paidCount} paid / ${earnings.pendingCount} pending`,
      icon: Receipt,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      testId: "card-stat-invoices",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/60" data-testid={stat.testId}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${stat.bg} rounded-md flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <div className="font-bold text-xl">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FeeTierInfo() {
  return (
    <Card className="border-border/60 mb-8" data-testid="card-fee-tiers">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Percent className="w-4 h-4" /> DOMO Service Fee Tiers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          DOMO deducts a service fee from customer payments before disbursing your earnings.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COMMISSION_TIERS.map((tier) => (
            <div key={tier.label} className="text-center p-3 rounded-md bg-muted/50">
              <div className="text-2xl font-bold text-primary">{Math.round(tier.rate * 100)}%</div>
              <div className="text-xs text-muted-foreground mt-1">{tier.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const { mutate: payInvoice, isPending: isPaying } = usePayInvoice();
  const { data: profile } = useProfile();
  const { toast } = useToast();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const isProvider = profile?.role === "contractor";
  const isHomeowner = profile?.role === "homeowner";

  const handlePay = (invoiceId: number) => {
    payInvoice(invoiceId, {
      onSuccess: (data: any) => {
        window.location.href = data.url;
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to start payment", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-display font-bold" data-testid="text-invoices-title">
            {isProvider ? "Earnings & Payments" : "Invoices & Payments"}
          </h1>
        </div>

        {isProvider && <EarningsSummary />}
        {isProvider && <FeeTierInfo />}

        <h2 className="text-xl font-semibold mb-4" data-testid="text-invoice-list-heading">
          {isProvider ? "Invoice History" : "Your Invoices"}
        </h2>

        <div className="space-y-4">
          {invoices?.map((invoice: any) => (
            <Card key={invoice.id} className="border-border/60" data-testid={`card-invoice-${invoice.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Invoice #{invoice.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.createdAt ? format(new Date(invoice.createdAt), "MMM d, yyyy") : ""}
                      </div>
                      {invoice.description && (
                        <div className="text-sm text-muted-foreground mt-1 max-w-sm truncate">
                          {invoice.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {isHomeowner ? "Amount Due" : "Job Total"}
                      </div>
                      <div className="font-bold text-lg">${(invoice.amount / 100).toFixed(2)}</div>
                    </div>

                    {isProvider && (
                      <>
                        <div className="text-right border-l pl-6">
                          <div className="text-xs text-muted-foreground">
                            Service Fee ({invoice.commissionRate ? `${invoice.commissionRate}%` : ""})
                          </div>
                          <div className="font-medium text-orange-600">
                            -${(invoice.commissionAmount / 100).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right border-l pl-6">
                          <div className="text-xs text-muted-foreground">Your Payout</div>
                          <div className="font-bold text-green-600">
                            ${((invoice.amount - invoice.commissionAmount) / 100).toFixed(2)}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                      {invoice.status === "paid" ? (
                        <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
                          <CheckCircle2 className="w-4 h-4" /> Paid
                        </div>
                      ) : (
                        <StatusBadge status="pending" />
                      )}

                      {isHomeowner && invoice.status === "pending" && (
                        <Button size="sm" onClick={() => handlePay(invoice.id)} disabled={isPaying} data-testid={`button-pay-invoice-${invoice.id}`}>
                          <CreditCard className="w-4 h-4 mr-2" /> Pay Now
                        </Button>
                      )}

                      {isProvider && invoice.status === "pending" && (
                        <div className="text-xs text-muted-foreground text-right">
                          Awaiting customer payment
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {invoices?.length === 0 && (
            <div className="text-center py-20 bg-card rounded-md border border-dashed text-muted-foreground" data-testid="text-no-invoices">
              No invoices found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
