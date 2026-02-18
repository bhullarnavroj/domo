import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceRequestSchema } from "@shared/schema";
import { useCreateServiceRequest } from "@/hooks/use-service-requests";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { Loader2, UploadCloud } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { group: "Home & Repair", items: ["Plumbing", "Electrical", "Carpentry", "Painting", "HVAC", "Roofing", "General Repair"] },
  { group: "Property Services", items: ["Landscaping", "Cleaning", "Pest Control", "Moving", "Interior Design"] },
  { group: "Legal & Financial", items: ["Real Estate Law", "Property Law", "Notary", "Tax Services", "Insurance"] },
  { group: "Real Estate", items: ["Real Estate Agent", "Property Manager", "Home Inspector", "Appraiser"] },
  { group: "Creative & Media", items: ["Photography", "Videography", "Virtual Tour"] },
  { group: "Other", items: ["Other"] },
];

export default function CreateRequest() {
  const { mutate: createRequest, isPending } = useCreateServiceRequest();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(insertServiceRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      photos: [],
    },
  });

  const onSubmit = (data: any) => {
    createRequest({ ...data, photos }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Your request has been posted!" });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to post request.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Post a Service Request</h1>
          <p className="text-muted-foreground mt-1">Describe what you need and get quotes from local professionals.</p>
        </div>

        <div className="bg-card p-6 md:p-8 rounded-md shadow-sm border border-border/60">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Need a property photographer for listing" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Zip Code" {...field} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what you need in detail. Include any relevant information such as timeline, budget range, or special requirements." 
                        className="min-h-[120px]" 
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Photos (optional)</FormLabel>
                <div className="flex flex-wrap gap-4">
                  {photos.map((url, i) => (
                    <img key={i} src={url} alt="Upload" className="w-24 h-24 object-cover rounded-md border" />
                  ))}
                  <ObjectUploader
                    maxNumberOfFiles={5}
                    onGetUploadParameters={async (file) => {
                      const res = await fetch("/api/uploads/request-url", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: file.name,
                          size: file.size,
                          contentType: file.type,
                        }),
                      });
                      const { uploadURL, objectPath } = await res.json();
                      return {
                        method: "PUT" as const,
                        url: uploadURL,
                        headers: { "Content-Type": file.type },
                      };
                    }}
                    onComplete={(result) => {
                      const newPhotos = result.successful.map(() => {
                         return "https://placehold.co/400?text=Photo+Uploaded"; 
                      });
                      setPhotos([...photos, ...newPhotos]);
                      toast({ title: "Photos uploaded!" });
                    }}
                  >
                    <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                      <UploadCloud className="w-6 h-6 mb-1" />
                      <span className="text-xs">Upload</span>
                    </div>
                  </ObjectUploader>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => setLocation("/dashboard")} data-testid="button-cancel">Cancel</Button>
                <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-request">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Post Request"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
