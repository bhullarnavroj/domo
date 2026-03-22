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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { PROVINCE_LIST } from "@shared/tax";
import { CATEGORIES } from "@shared/categories";
import { useProfile } from "@/hooks/use-profiles";

export default function CreateRequest() {
  const { mutate: createRequest, isPending } = useCreateServiceRequest();
  const [, setLocation] = useLocation();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (profile && profile.role !== "homeowner") {
      setLocation("/dashboard");
    }
  }, [profile]);
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(insertServiceRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      province: "",
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
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Post a Job</h1>
          <p className="text-muted-foreground mt-1">Fill in the details below and get quotes from verified local tradespeople.</p>
        </div>

        <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/60 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">

              {/* Category — visual cards */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">What type of job is this?</FormLabel>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => field.onChange(cat.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                            field.value === cat.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/40 hover:bg-muted/50"
                          }`}
                          data-testid={`select-category-${cat.value}`}
                        >
                          <span className="text-3xl">{cat.emoji}</span>
                          <span className="text-sm font-semibold">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Job title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fix leaky kitchen faucet" className="h-11 rounded-xl" {...field} data-testid="input-title" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Keep it short and specific — pros respond faster to clear titles.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Describe the job</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., The kitchen faucet has been dripping for 2 weeks. It's a single-handle Moen. Need it fixed or replaced. Happy to discuss budget."
                        className="min-h-[130px] rounded-xl"
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">More detail = better quotes. Include timeline, access notes, or budget if you have one.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location + Province */}
              <div className="grid md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., North Delta, BC" className="h-11 rounded-xl" {...field} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Province</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl" data-testid="select-province">
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROVINCE_LIST.map((p) => (
                            <SelectItem key={p.code} value={p.code}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Photos */}
              <div className="space-y-3">
                <div>
                  <div className="text-base font-semibold">Photos <span className="text-muted-foreground font-normal text-sm">(optional)</span></div>
                  <p className="text-xs text-muted-foreground mt-0.5">Jobs with photos get 3× more quotes. Add up to 5 images.</p>
                </div>
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

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="w-full rounded-xl h-11" onClick={() => setLocation("/dashboard")} data-testid="button-cancel">Cancel</Button>
                <Button type="submit" className="w-full rounded-xl h-11 text-base font-semibold" disabled={isPending} data-testid="button-submit-request">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Post Job →"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
