import { useInvoices, usePayCommission } from "@/hooks/use-invoices";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { useProfile } from "@/hooks/use-profiles";

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const { mutate: payCommission, isPending: isPaying } = usePayCommission();
  const { data: profile } = useProfile();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const isProvider = profile?.role === "contractor";

  const handlePay = (invoiceId: number) => {
    payCommission(invoiceId, {
      onSuccess: (data) => {
        window.location.href = data.url;
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-display font-bold mb-8" data-testid="text-invoices-title">Invoices</h1>

        <div className="space-y-4">
          {invoices?.map((invoice) => (
            <Card key={invoice.id} className="border-border/60" data-testid={`card-invoice-${invoice.id}`}>
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Invoice #{invoice.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(invoice.createdAt!), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="font-bold">${(invoice.amount / 100).toFixed(2)}</div>
                  </div>
                  
                  {isProvider && (
                    <div className="text-right border-l pl-6">
                      <div className="text-sm text-muted-foreground">Commission (10%)</div>
                      <div className="font-bold text-primary">${(invoice.commissionAmount / 100).toFixed(2)}</div>
                    </div>
                  )}

                  <div className="flex flex-col items-end gap-2 min-w-[120px]">
                    <StatusBadge status={invoice.status === "paid" ? "paid" : "pending"} />
                    
                    {isProvider && invoice.status === "pending" && (
                      <Button size="sm" onClick={() => handlePay(invoice.id)} disabled={isPaying} data-testid={`button-pay-${invoice.id}`}>
                        <CreditCard className="w-4 h-4 mr-2" /> Pay Now
                      </Button>
                    )}
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
