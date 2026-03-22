import { useParams } from "wouter";
import { useServiceRequest, useUpdateServiceRequest } from "@/hooks/use-service-requests";
import { useQuotes, useCreateQuote, useAcceptQuote } from "@/hooks/use-quotes";
import { useMessages, useCreateMessage } from "@/hooks/use-messages";
import { useInvoiceByRequest, usePayInvoice } from "@/hooks/use-invoices";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { Navigation } from "@/components/Navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Calendar, DollarSign, CheckCircle, Pencil, MessageCircle, Send, CreditCard, Star, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";

const categories = [
  { group: "Home & Repair", items: ["Plumbing", "Electrical", "Carpentry", "Painting", "HVAC", "Roofing", "General Repair"] },
  { group: "Property Services", items: ["Landscaping", "Cleaning", "Pest Control", "Moving", "Interior Design"] },
  { group: "Legal & Financial", items: ["Real Estate Law", "Property Law", "Notary", "Tax Services", "Insurance"] },
  { group: "Real Estate", items: ["Real Estate Agent", "Property Manager", "Home Inspector", "Appraiser"] },
  { group: "Creative & Media", items: ["Photography", "Videography", "Virtual Tour"] },
  { group: "Other", items: ["Other"] },
];
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
  const { data: messagesList } = useMessages(requestId);
  const { mutate: sendMessage, isPending: isSending } = useCreateMessage(requestId);
  const { data: invoice } = useInvoiceByRequest(requestId);
  const { mutate: payInvoice, isPending: isPayingInvoice } = usePayInvoice();
  const { user } = useAuth();
  
  const { toast } = useToast();
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteDesc, setQuoteDesc] = useState("");
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const queryClient = useQueryClient();

  const { data: existingReview } = useQuery({
    queryKey: [`/api/service-requests/${requestId}/review`],
    queryFn: async () => {
      const res = await fetch(`/api/service-requests/${requestId}/review`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!requestId,
  });

  const { mutate: submitReview, isPending: isSubmittingReview } = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      const res = await fetch(`/api/service-requests/${requestId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-requests/${requestId}/review`] });
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading || quotesLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!request) return <div>Not found</div>;

  const isHomeowner = profile?.role === "homeowner";
  const isProvider = profile?.role === "contractor";
  const isOwner = isHomeowner && request.homeownerId === profile?.userId;
  
  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    createQuote({
      serviceRequestId: requestId,
      amount: Math.round(parseFloat(quoteAmount) * 100),
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
      onSuccess: () => toast({ title: "Quote accepted!", description: "The service provider has been notified." }),
    });
  };

  const handleCompleteRequest = () => {
    updateRequest({ id: requestId, status: "completed" }, {
      onSuccess: () => toast({ title: "Marked as completed!", description: "Invoice generated." }),
    });
  };

  const openEditDialog = () => {
    if (!request) return;
    setEditTitle(request.title);
    setEditDescription(request.description);
    setEditCategory(request.category);
    setEditLocation(request.location);
    setEditDialogOpen(true);
  };

  const handleEditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    updateRequest({
      id: requestId,
      title: editTitle,
      description: editDescription,
      category: editCategory,
      location: editLocation,
    }, {
      onSuccess: () => {
        setEditDialogOpen(false);
        toast({ title: "Request updated!", description: "Your changes have been saved." });
      },
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageText.trim(), {
      onSuccess: () => setMessageText(""),
    });
  };

  const canMessage = isOwner || (isProvider && quotes?.some(q => q.contractorId === profile?.userId));

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-1" data-testid="text-category">{request.category}</div>
                    <h1 className="text-2xl font-bold font-display" data-testid="text-request-title">{request.title}</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && request.status === "open" && (
                      <Button variant="outline" size="icon" onClick={openEditDialog} data-testid="button-edit-request">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    <StatusBadge status={request.status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
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
                        <img key={i} src={photo} alt="Request" className="w-32 h-32 object-cover rounded-md border" />
                      ))}
                    </div>
                  </div>
                )}
                
                {isOwner && request.status === "in_progress" && (
                  <div className="pt-4 border-t">
                    <Button onClick={handleCompleteRequest} disabled={isUpdatingRequest} className="w-full" data-testid="button-complete">
                      <CheckCircle className="w-4 h-4 mr-2" /> Mark Job as Completed
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">This will generate an invoice for payment.</p>
                  </div>
                )}

                {isOwner && request.status === "completed" && invoice && invoice.status === "pending" && (
                  <div className="pt-4 border-t" data-testid="section-payment-due">
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 font-semibold">
                          <CreditCard className="w-5 h-5 text-primary" /> Payment Due
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="text-xl font-bold">${(invoice.amount / 100).toFixed(2)}</span>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => payInvoice(invoice.id, {
                            onSuccess: (data: any) => { window.location.href = data.url; },
                            onError: () => { toast({ title: "Error", description: "Failed to start payment", variant: "destructive" }); },
                          })}
                          disabled={isPayingInvoice}
                          data-testid="button-pay-now"
                        >
                          {isPayingInvoice ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                          Pay Now
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {request.status === "completed" && invoice && invoice.status === "paid" && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium py-3" data-testid="text-payment-complete">
                      <CheckCircle className="w-5 h-5" /> Payment Complete
                    </div>
                  </div>
                )}

                {isOwner && request.status === "completed" && invoice?.status === "paid" && (
                  <div className="pt-4 border-t">
                    {existingReview ? (
                      <div className="bg-muted/50 rounded-md p-4">
                        <div className="text-sm font-semibold mb-1">Your Review</div>
                        <div className="flex gap-1 mb-2">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-5 h-5 ${s <= existingReview.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                        {existingReview.comment && <p className="text-sm text-muted-foreground">{existingReview.comment}</p>}
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-semibold mb-3">Leave a Review</div>
                        <div className="flex gap-1 mb-3">
                          {[1,2,3,4,5].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewRating(s)}
                              onMouseEnter={() => setHoverRating(s)}
                              onMouseLeave={() => setHoverRating(0)}
                            >
                              <Star className={`w-7 h-7 transition-colors ${s <= (hoverRating || reviewRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="Share your experience (optional)..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="mb-3 min-h-[80px]"
                        />
                        <Button
                          onClick={() => submitReview({ rating: reviewRating, comment: reviewComment })}
                          disabled={reviewRating === 0 || isSubmittingReview}
                          className="w-full"
                        >
                          {isSubmittingReview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
                          Submit Review
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              <h2 className="text-xl font-bold font-display mb-4">Quotes ({quotes?.length || 0})</h2>
              <div className="space-y-4">
                {quotes?.map((quote) => (
                  <Card key={quote.id} className="border-border/60" data-testid={`card-quote-${quote.id}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <div>
                          <div className="font-semibold text-lg" data-testid={`text-quote-title-${quote.id}`}>Professional Quote</div>
                          <div className="text-sm text-muted-foreground">Submitted {format(new Date(quote.createdAt!), "MMM d")}</div>
                        </div>
                        <div className="text-xl font-bold text-primary">
                          ${(quote.amount / 100).toFixed(2)}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 bg-muted/30 p-3 rounded-md border">
                        {quote.description}
                      </p>
                      
                      {isOwner && request.status === "open" && quote.status === "pending" && (
                        <Button 
                          onClick={() => handleAcceptQuote(quote.id)} 
                          disabled={isAcceptingQuote}
                          className="w-full"
                          data-testid={`button-accept-quote-${quote.id}`}
                        >
                          Accept Quote
                        </Button>
                      )}
                      
                      {quote.status === "accepted" && (
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-md text-center font-medium text-sm">
                          Quote Accepted
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {quotes?.length === 0 && (
                  <div className="text-center py-10 bg-card rounded-md border border-dashed text-muted-foreground">
                    No quotes yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
               <DialogContent className="max-w-lg">
                 <DialogHeader>
                   <DialogTitle>Edit Service Request</DialogTitle>
                 </DialogHeader>
                 <form onSubmit={handleEditRequest} className="space-y-4 mt-2">
                   <div>
                     <Label>Title</Label>
                     <Input 
                       value={editTitle} 
                       onChange={(e) => setEditTitle(e.target.value)} 
                       required 
                       data-testid="input-edit-title"
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label>Category</Label>
                       <Select value={editCategory} onValueChange={setEditCategory}>
                         <SelectTrigger data-testid="select-edit-category">
                           <SelectValue placeholder="Select a category" />
                         </SelectTrigger>
                         <SelectContent>
                           {categories.map((group) => (
                             <div key={group.group}>
                               <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.group}</div>
                               {group.items.map((cat) => (
                                 <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                               ))}
                             </div>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label>Location</Label>
                       <Input 
                         value={editLocation} 
                         onChange={(e) => setEditLocation(e.target.value)} 
                         required 
                         data-testid="input-edit-location"
                       />
                     </div>
                   </div>
                   <div>
                     <Label>Description</Label>
                     <Textarea 
                       value={editDescription} 
                       onChange={(e) => setEditDescription(e.target.value)} 
                       className="min-h-[120px]"
                       required 
                       data-testid="input-edit-description"
                     />
                   </div>
                   <div className="flex gap-3 pt-2">
                     <Button type="button" variant="outline" className="w-full" onClick={() => setEditDialogOpen(false)} data-testid="button-edit-cancel">
                       Cancel
                     </Button>
                     <Button type="submit" className="w-full" disabled={isUpdatingRequest} data-testid="button-edit-save">
                       {isUpdatingRequest ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                     </Button>
                   </div>
                 </form>
               </DialogContent>
             </Dialog>

             {isProvider && request.status === "open" && (
               profile?.isVerified ? (
                 <Card className="border-border/60 bg-primary/5">
                   <CardHeader>
                     <CardTitle className="text-lg">Interested in this project?</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                       Review the details and submit your quote to the property owner.
                     </p>
                     <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
                       <DialogTrigger asChild>
                         <Button className="w-full" data-testid="button-submit-quote">Submit Quote</Button>
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
                                 data-testid="input-quote-amount"
                               />
                             </div>
                           </div>
                           <div>
                             <Label>Description / Proposal</Label>
                             <Textarea
                               placeholder="Detail your service, approach, and timeline..."
                               value={quoteDesc}
                               onChange={(e) => setQuoteDesc(e.target.value)}
                               required
                               data-testid="input-quote-description"
                             />
                           </div>
                           <Button type="submit" className="w-full" disabled={isCreatingQuote} data-testid="button-confirm-quote">
                             {isCreatingQuote ? <Loader2 className="animate-spin" /> : "Submit Quote"}
                           </Button>
                         </form>
                       </DialogContent>
                     </Dialog>
                   </CardContent>
                 </Card>
               ) : (
                 <Card className="border-amber-200 bg-amber-50">
                   <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                     <Clock className="w-8 h-8 text-amber-500 mt-1" />
                     <div>
                       <div className="font-semibold text-amber-800 mb-1">Account Pending Approval</div>
                       <p className="text-sm text-amber-700">
                         Our team is reviewing your application. Once approved, you'll be able to submit quotes on jobs.
                       </p>
                     </div>
                   </CardContent>
                 </Card>
               )
             )}

             {canMessage && (
               <Card className="border-border/60" data-testid="card-messages">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg flex items-center gap-2">
                     <MessageCircle className="w-5 h-5" /> Messages
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-3 max-h-80 overflow-y-auto mb-4" data-testid="messages-list">
                     {messagesList && messagesList.length > 0 ? (
                       messagesList.map((msg: any) => {
                         const isMe = msg.senderId === user?.id;
                         return (
                           <div 
                             key={msg.id} 
                             className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                             data-testid={`message-${msg.id}`}
                           >
                             <div className="text-xs text-muted-foreground mb-1">
                               {isMe ? "You" : msg.senderName}
                               {" \u00b7 "}
                               {msg.senderRole === "homeowner" ? "Owner" : "Provider"}
                             </div>
                             <div className={`px-3 py-2 rounded-md text-sm max-w-[85%] ${
                               isMe 
                                 ? "bg-primary text-primary-foreground" 
                                 : "bg-muted"
                             }`}>
                               {msg.body}
                             </div>
                             <div className="text-[10px] text-muted-foreground mt-1">
                               {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                             </div>
                           </div>
                         );
                       })
                     ) : (
                       <div className="text-center py-6 text-muted-foreground text-sm" data-testid="text-no-messages">
                         No messages yet. Start a conversation.
                       </div>
                     )}
                   </div>
                   <form onSubmit={handleSendMessage} className="flex gap-2">
                     <Input
                       value={messageText}
                       onChange={(e) => setMessageText(e.target.value)}
                       placeholder="Type a message..."
                       data-testid="input-message"
                     />
                     <Button type="submit" size="icon" disabled={isSending || !messageText.trim()} data-testid="button-send-message">
                       {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                     </Button>
                   </form>
                 </CardContent>
               </Card>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
