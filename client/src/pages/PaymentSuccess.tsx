import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invoiceId = params.get("invoiceId");
    const sessionId = params.get("session_id");

    if (!invoiceId || !sessionId) {
      setError("Missing payment information");
      setConfirming(false);
      return;
    }

    fetch(`/api/invoices/${invoiceId}/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to confirm payment");
        return res.json();
      })
      .then(() => setConfirming(false))
      .catch(() => {
        setError("Could not confirm payment. Please contact support.");
        setConfirming(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Card className="border-border/60">
          <CardContent className="p-8 text-center space-y-6">
            {confirming ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-semibold">Confirming your payment...</h2>
              </>
            ) : error ? (
              <>
                <div className="text-destructive text-lg font-medium">{error}</div>
                <Button onClick={() => navigate("/invoices")} data-testid="button-back-invoices">
                  Back to Invoices
                </Button>
              </>
            ) : (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold" data-testid="text-payment-success">Payment Successful</h2>
                <p className="text-muted-foreground">
                  Your payment has been processed. The service provider will receive their payout shortly.
                </p>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="outline" onClick={() => navigate("/invoices")} data-testid="button-view-invoices">
                    View Invoices
                  </Button>
                  <Button onClick={() => navigate("/dashboard")} data-testid="button-back-dashboard">
                    Back to Dashboard
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
