import { useParams } from "wouter";
import { useServiceRequest, useUpdateServiceRequest } from "@/hooks/use-service-requests";
import { useQuotes, useCreateQuote, useAcceptQuote } from "@/hooks/use-quotes";
import { useProfile } from "@/hooks/use-profiles";
import { Navigation } from "@/components/Navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function RequestDetails() {
  const { id } = useParams();
  const requestId = Number(id);
  const { data: request, isLoading } = useServiceRequest(requestId);
  const { data: quotes, isLoading: quotesLoading } = useQuotes(requestId);
  const { data: profile } = useProfile();
  
  const { mutate: createQuote, isPending: isCreatingQuote } = useCreateQuote();
  const { mutate: acceptQuote, isPending: isAcceptingQuote } = useAcceptQuote();
  const { mutate: updateRequest, isPending: isUpdatingRequest } = useUpdateServiceRequest();
  
  const { toast } = useToast();
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteDesc, setQuoteDesc] = useState("");
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

  if (isLoading || quotesLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!request) return <div>Not found</div>;

  const isHomeowner = profile?.role === "homeowner";
  const isContractor = profile?.role === "contractor";
  const isOwner = isHomeowner && request.homeownerId === profile?.userId;
  
  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    createQuote({
      serviceRequestId: requestId,
      amount: Math.round(parseFloat(quoteAmount) * 100), // Convert to cents
      description: quoteDesc,
    }, {
      onSuccess: () => {
        setQuoteDialogOpen(false);
        toast({ title: "Quote submitted!" });
      },
    });
  };

  const handleAcceptQuote = (quoteId: number) => {
    acceptQuote(quoteId, {
      onSuccess: () => toast({ title: "Quote accepted!", description: "The contractor has been notified." }),
    });
  };

  const handleCompleteRequest = () => {
    updateRequest({ id: requestId, status: "completed" }, {
      onSuccess: () => toast({ title: "Marked as completed!", description: "Invoice generated." }),
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">{request.category}</div>
                    <h1 className="text-2xl font-bold font-display">{request.title}</h1>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {request.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Posted {format(new Date(request.createdAt!), "MMM d, yyyy")}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-foreground/80">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                  <p className="whitespace-pre-line leading-relaxed">{request.description}</p>
                </div>

                {request.photos && request.photos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Photos</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {request.photos.map((photo, i) => (
                        <img key={i} src={photo} alt="Request" className="w-32 h-32 object-cover rounded-lg border" />
                      ))}
                    </div>
                  </div>
                )}
                
                {isOwner && request.status === "in_progress" && (
                  <div className="pt-4 border-t">
                    <Button onClick={handleCompleteRequest} disabled={isUpdatingRequest} className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" /> Mark Job as Completed
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">This will generate an invoice for the contractor.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quotes Section */}
            <div>
              <h2 className="text-xl font-bold font-display mb-4">Quotes ({quotes?.length || 0})</h2>
              <div className="space-y-4">
                {quotes?.map((quote) => (
                  <Card key={quote.id} className="border-border/60">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-semibold text-lg">Contractor Quote</div>
                          <div className="text-sm text-muted-foreground">Submitted {format(new Date(quote.createdAt!), "MMM d")}</div>
                        </div>
                        <div className="text-xl font-bold text-primary">
                          ${(quote.amount / 100).toFixed(2)}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 bg-muted/30 p-3 rounded-lg border">
                        {quote.description}
                      </p>
                      
                      {isOwner && request.status === "open" && quote.status === "pending" && (
                        <Button 
                          onClick={() => handleAcceptQuote(quote.id)} 
                          disabled={isAcceptingQuote}
                          className="w-full"
                        >
                          Accept Quote
                        </Button>
                      )}
                      
                      {quote.status === "accepted" && (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center font-medium text-sm">
                          Quote Accepted
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {quotes?.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-xl border border-dashed text-muted-foreground">
                    No quotes yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             {isContractor && request.status === "open" && (
               <Card className="border-border/60 bg-blue-50/50">
                 <CardHeader>
                   <CardTitle className="text-lg">Interested in this job?</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-sm text-muted-foreground mb-4">
                     Review the details and submit a quote to the homeowner.
                   </p>
                   <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
                     <DialogTrigger asChild>
                       <Button className="w-full">Submit Quote</Button>
                     </DialogTrigger>
                     <DialogContent>
                       <DialogHeader>
                         <DialogTitle>Submit a Quote</DialogTitle>
                       </DialogHeader>
                       <form onSubmit={handleSubmitQuote} className="space-y-4 mt-4">
                         <div>
                           <Label>Amount ($)</Label>
                           <div className="relative">
                             <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                             <Input 
                               type="number" 
                               className="pl-9" 
                               placeholder="0.00" 
                               value={quoteAmount}
                               onChange={(e) => setQuoteAmount(e.target.value)}
                               required
                             />
                           </div>
                         </div>
                         <div>
                           <Label>Description / Proposal</Label>
                           <Textarea 
                             placeholder="Detail your service..." 
                             value={quoteDesc}
                             onChange={(e) => setQuoteDesc(e.target.value)}
                             required
                           />
                         </div>
                         <Button type="submit" className="w-full" disabled={isCreatingQuote}>
                           {isCreatingQuote ? <Loader2 className="animate-spin" /> : "Submit Quote"}
                         </Button>
                       </form>
                     </DialogContent>
                   </Dialog>
                 </CardContent>
               </Card>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
