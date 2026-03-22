import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema } from "@shared/schema";
import { useCreateProfile } from "@/hooks/use-profiles";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Briefcase, Home, Loader2 } from "lucide-react";

import { CATEGORIES } from "@shared/categories";

export default function Onboarding() {
  const { user } = useAuth();
  const { mutate: createProfile, isPending } = useCreateProfile();
  const [, setLocation] = useLocation();

  const intendedRole = (localStorage.getItem("intended_role") as "homeowner" | "contractor") || "homeowner";

  const form = useForm({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: {
      role: intendedRole,
      businessName: "",
      description: "",
      phoneNumber: "",
      address: "",
      skills: [] as string[],
    },
  });

  const role = form.watch("role");

  const onSubmit = (data: any) => {
    localStorage.removeItem("intended_role");
    createProfile(data, {
      onSuccess: () => setLocation("/dashboard"),
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border/60 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display">Welcome to DOMO, {user?.firstName}!</CardTitle>
          <CardDescription>Let's set up your profile to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I am a...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="homeowner" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                            <Home className="mb-3 h-6 w-6" />
                            Property Owner
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="contractor" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                            <Briefcase className="mb-3 h-6 w-6" />
                            Service Provider
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address / Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, BC" {...field} data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === "contractor" && (
                <>
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business / Practice Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., ABC Plumbing Ltd." {...field} data-testid="input-business-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about the services you offer..." {...field} data-testid="input-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Which trades do you offer?</FormLabel>
                        <div className="grid grid-cols-3 gap-3 mt-1">
                          {CATEGORIES.map((cat) => {
                            const selected = (field.value as string[]).includes(cat.label);
                            return (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => {
                                  const current = field.value as string[];
                                  field.onChange(
                                    selected ? current.filter((s) => s !== cat.label) : [...current, cat.label]
                                  );
                                }}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                                  selected
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border hover:border-primary/40"
                                }`}
                              >
                                <span className="text-2xl">{cat.emoji}</span>
                                <span className="text-xs font-semibold">{cat.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Select all that apply. More categories coming soon.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isPending} data-testid="button-complete-profile">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
