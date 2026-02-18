import { useState, useEffect } from "react";
import { useInvoices, usePayInvoice, useEarnings } from "@/hooks/use-invoices";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  FileText,
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  ArrowDownRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Eye,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { useProfile } from "@/hooks/use-profiles";
import { useToast } from "@/hooks/use-toast";
import { COMMISSION_TIERS } from "@shared/commission";

const TAX_RATE = 0.13;

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function computeTaxBreakdown(amountCents: number) {
  const subtotalCents = Math.round(amountCents / (1 + TAX_RATE));
  const taxCents = amountCents - subtotalCents;
  return { subtotalCents, taxCents };
}

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
      value: formatCurrency(earnings.totalEarnings),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
      testId: "card-stat-total-earnings",
    },
    {
      label: "DOMO Service Fee",
      value: formatCurrency(earnings.totalCommission),
      icon: ArrowDownRight,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      testId: "card-stat-domo-service-fee",
    },
    {
      label: "Net Payout",
      value: formatCurrency(earnings.netEarnings),
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

function InvoiceDetailDialog({
  invoice,
  isProvider,
  open,
  onClose,
}: {
  invoice: any;
  isProvider: boolean;
  open: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDetail(null);
    setLoading(true);
    fetch(`/api/invoices/${invoice.id}`, { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => { setDetail(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [open, invoice.id]);

  const { subtotalCents, taxCents } = computeTaxBreakdown(invoice.amount);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="text-invoice-detail-title">
            <FileText className="w-5 h-5" />
            {isProvider ? `Record #${invoice.id}` : `Invoice #${invoice.id}`}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">DOMO</span>
              </div>
              <Badge variant={invoice.status === "paid" ? "default" : "secondary"} data-testid="badge-invoice-status">
                {invoice.status === "paid" ? "Paid" : "Pending"}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Date</div>
                <div data-testid="text-invoice-date">
                  {invoice.createdAt ? format(new Date(invoice.createdAt), "MMMM d, yyyy") : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">{isProvider ? "Record" : "Invoice"} #</div>
                <div>{invoice.id}</div>
              </div>
              {detail?.homeownerProfile && (
                <div>
                  <div className="text-muted-foreground mb-1">Property Owner</div>
                  <div data-testid="text-invoice-owner">{detail.homeownerProfile.businessName || "Property Owner"}</div>
                </div>
              )}
              {detail?.providerProfile && (
                <div>
                  <div className="text-muted-foreground mb-1">Service Provider</div>
                  <div data-testid="text-invoice-provider">{detail.providerProfile.businessName || "Service Provider"}</div>
                </div>
              )}
            </div>

            {detail?.serviceRequest && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Service</div>
                  <div className="font-medium" data-testid="text-invoice-service">{detail.serviceRequest.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {detail.serviceRequest.category} &middot; {detail.serviceRequest.location}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-2" data-testid="section-invoice-breakdown">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span data-testid="text-invoice-subtotal">{formatCurrency(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({Math.round(TAX_RATE * 100)}%)</span>
                <span data-testid="text-invoice-tax">{formatCurrency(taxCents)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span data-testid="text-invoice-total">{formatCurrency(invoice.amount)}</span>
              </div>

              {isProvider && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>DOMO Service Fee ({invoice.commissionRate}%)</span>
                    <span data-testid="text-invoice-fee">-{formatCurrency(invoice.commissionAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Your Payout</span>
                    <span data-testid="text-invoice-payout">{formatCurrency(invoice.amount - invoice.commissionAmount)}</span>
                  </div>
                </>
              )}
            </div>

            {invoice.description && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Description</div>
                  <div className="text-sm" data-testid="text-invoice-description">{invoice.description}</div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadInvoicePdf(invoice, detail, isProvider)}
                data-testid={`button-download-pdf-${invoice.id}`}
              >
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>

            <div className="text-[10px] text-muted-foreground text-center pt-2" data-testid="text-dialog-fee-tiers">
              DOMO Service Fee Tiers: {COMMISSION_TIERS.map(t => `${Math.round(t.rate * 100)}% ${t.label}`).join(" \u00B7 ")}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

async function downloadInvoicePdf(invoice: any, detail: any, isProvider: boolean) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("DOMO", 20, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Property Services Marketplace", 20, 32);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  const title = isProvider ? `Record #${invoice.id}` : `Invoice #${invoice.id}`;
  doc.text(title, pageWidth - 20, 25, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const statusText = invoice.status === "paid" ? "PAID" : "PENDING";
  doc.text(statusText, pageWidth - 20, 32, { align: "right" });

  let y = 48;
  doc.setTextColor(0);
  doc.setFontSize(9);

  const dateStr = invoice.createdAt ? format(new Date(invoice.createdAt), "MMMM d, yyyy") : "N/A";

  const leftInfo: string[] = [];
  const rightInfo: string[] = [];

  leftInfo.push(`Date: ${dateStr}`);
  leftInfo.push(`${isProvider ? "Record" : "Invoice"} #: ${invoice.id}`);

  if (detail?.homeownerProfile) {
    rightInfo.push(`Property Owner: ${detail.homeownerProfile.businessName || "Property Owner"}`);
  }
  if (detail?.providerProfile) {
    rightInfo.push(`Service Provider: ${detail.providerProfile.businessName || "Service Provider"}`);
  }

  leftInfo.forEach((line) => { doc.text(line, 20, y); y += 5; });
  y = 48;
  rightInfo.forEach((line) => { doc.text(line, pageWidth - 20, y, { align: "right" }); y += 5; });

  y = Math.max(48 + leftInfo.length * 5, 48 + rightInfo.length * 5) + 8;

  if (detail?.serviceRequest) {
    doc.setFont("helvetica", "bold");
    doc.text("Service Details", 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(`${detail.serviceRequest.title}`, 20, y); y += 5;
    doc.setTextColor(100);
    doc.text(`${detail.serviceRequest.category} - ${detail.serviceRequest.location}`, 20, y); y += 8;
    doc.setTextColor(0);
  }

  const { subtotalCents, taxCents } = computeTaxBreakdown(invoice.amount);

  const tableBody: any[][] = [
    ["Service", detail?.serviceRequest?.title || "Service", formatCurrency(subtotalCents)],
    [`Tax (${Math.round(TAX_RATE * 100)}%)`, "", formatCurrency(taxCents)],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Item", "Description", "Amount"]],
    body: tableBody,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
    styles: { fontSize: 9 },
    columnStyles: {
      2: { halign: "right" },
    },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total:", 120, y);
  doc.text(formatCurrency(invoice.amount), pageWidth - 20, y, { align: "right" });

  if (isProvider) {
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 100, 0);
    doc.text(`DOMO Service Fee (${invoice.commissionRate}%):`, 120, y);
    doc.text(`-${formatCurrency(invoice.commissionAmount)}`, pageWidth - 20, y, { align: "right" });

    y += 6;
    doc.setTextColor(0, 128, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Your Payout:", 120, y);
    doc.text(formatCurrency(invoice.amount - invoice.commissionAmount), pageWidth - 20, y, { align: "right" });
  }

  y += 12;
  doc.setTextColor(150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("DOMO Service Fee Tiers: " + COMMISSION_TIERS.map(t => `${Math.round(t.rate * 100)}% ${t.label}`).join(" | "), 20, y);

  doc.save(`domo-${isProvider ? "record" : "invoice"}-${invoice.id}.pdf`);
}

function exportToExcel(invoiceList: any[], isProvider: boolean) {
  import("xlsx").then(({ utils, writeFile }) => {
    const rows = invoiceList.map((inv: any) => {
      const { subtotalCents, taxCents } = computeTaxBreakdown(inv.amount);
      const base: any = {
        "ID": inv.id,
        "Date": inv.createdAt ? format(new Date(inv.createdAt), "yyyy-MM-dd") : "",
        "Description": inv.description || "",
        "Subtotal": (subtotalCents / 100).toFixed(2),
        [`Tax (${Math.round(TAX_RATE * 100)}%)`]: (taxCents / 100).toFixed(2),
        "Total": (inv.amount / 100).toFixed(2),
        "Status": inv.status,
      };
      if (isProvider) {
        base["Service Fee (%)"] = inv.commissionRate || "";
        base["Service Fee ($)"] = (inv.commissionAmount / 100).toFixed(2);
        base["Net Payout"] = ((inv.amount - inv.commissionAmount) / 100).toFixed(2);
      }
      return base;
    });

    const ws = utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length, 12) }));
    ws["!cols"] = colWidths;

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, isProvider ? "Records" : "Invoices");
    writeFile(wb, `domo-${isProvider ? "records" : "invoices"}.xlsx`);
  });
}

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const { mutate: payInvoice, isPending: isPaying } = usePayInvoice();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);

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
          {invoices && invoices.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToExcel(invoices, !!isProvider)}
              data-testid="button-export-excel"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
            </Button>
          )}
        </div>

        {isProvider && <EarningsSummary />}

        <h2 className="text-xl font-semibold mb-4" data-testid="text-invoice-list-heading">
          {isProvider ? "Records" : "Your Invoices"}
        </h2>

        <div className="space-y-4">
          {invoices?.map((invoice: any) => {
            const { subtotalCents, taxCents } = computeTaxBreakdown(invoice.amount);
            return (
              <Card key={invoice.id} className="border-border/60" data-testid={`card-invoice-${invoice.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg" data-testid={`text-invoice-title-${invoice.id}`}>
                          {isProvider ? `Record #${invoice.id}` : `Invoice #${invoice.id}`}
                        </div>
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

                    <div className="flex flex-wrap items-center gap-4">
                      {isHomeowner && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Subtotal</div>
                          <div className="text-sm">{formatCurrency(subtotalCents)}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            + {formatCurrency(taxCents)} tax
                          </div>
                        </div>
                      )}

                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {isHomeowner ? "Total Due" : "Job Total"}
                        </div>
                        <div className="font-bold text-lg">{formatCurrency(invoice.amount)}</div>
                      </div>

                      {isProvider && (
                        <>
                          <div className="text-right border-l pl-4">
                            <div className="text-xs text-muted-foreground">
                              Fee ({invoice.commissionRate ? `${invoice.commissionRate}%` : ""})
                            </div>
                            <div className="font-medium text-orange-600">
                              -{formatCurrency(invoice.commissionAmount)}
                            </div>
                          </div>
                          <div className="text-right border-l pl-4">
                            <div className="text-xs text-muted-foreground">Your Payout</div>
                            <div className="font-bold text-green-600">
                              {formatCurrency(invoice.amount - invoice.commissionAmount)}
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

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingInvoice(invoice)}
                            data-testid={`button-view-invoice-${invoice.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Button>

                          {isHomeowner && invoice.status === "pending" && (
                            <Button size="sm" onClick={() => handlePay(invoice.id)} disabled={isPaying} data-testid={`button-pay-invoice-${invoice.id}`}>
                              <CreditCard className="w-4 h-4 mr-1" /> Pay
                            </Button>
                          )}
                        </div>

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
            );
          })}

          {invoices?.length === 0 && (
            <div className="text-center py-20 bg-card rounded-md border border-dashed text-muted-foreground" data-testid="text-no-invoices">
              {isProvider ? "No records found." : "No invoices found."}
            </div>
          )}
        </div>

        <div className="mt-12 text-xs text-muted-foreground text-center" data-testid="text-fee-tiers-fine-print">
          DOMO Service Fee Tiers: {COMMISSION_TIERS.map(t => `${Math.round(t.rate * 100)}% ${t.label}`).join(" \u00B7 ")}
        </div>
      </div>

      {viewingInvoice && (
        <InvoiceDetailDialog
          invoice={viewingInvoice}
          isProvider={!!isProvider}
          open={!!viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
}
