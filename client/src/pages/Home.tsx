import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ArrowRight, CheckCircle, Clock, Shield, Star, DollarSign, Zap, Home as HomeIcon, Wrench } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CATEGORIES } from "@shared/categories";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: profile } = useProfile();
  const isContractor = profile?.role === "contractor";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* ── HERO ── */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 60%, hsl(221 83% 53%) 0%, transparent 45%), radial-gradient(circle at 85% 10%, hsl(262 83% 58%) 0%, transparent 45%)",
          }}
        />
        <div className="container mx-auto px-4 pt-24 pb-16 lg:pt-36 lg:pb-24 relative">
          <motion.div {...fadeUp()} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Now serving BC homeowners
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.05] mb-5">
              Home repairs,<br />
              <span className="text-primary">done right.</span>
            </h1>
            <p className="text-lg text-background/60 max-w-lg mb-10 leading-relaxed">
              Post any home job in 60 seconds. Get quotes from verified local tradespeople — plumbers, electricians, and handymen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {isAuthenticated ? (
                <>
                  <Link href={isContractor ? "/dashboard" : "/create-request"}>
                    <Button size="lg" className="h-13 px-8 text-base rounded-xl" data-testid="button-post-request">
                      {isContractor ? <>Find Work <ArrowRight className="ml-2 w-5 h-5" /></> : <>Post a Job <ArrowRight className="ml-2 w-5 h-5" /></>}
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="border-white/20 text-background hover:bg-white/10 h-13 px-8 text-base rounded-xl">
                      My Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="h-13 px-8 text-base rounded-xl"
                    data-testid="button-find-professional"
                    onClick={() => { localStorage.setItem("intended_role", "homeowner"); window.location.href = "/api/login"; }}
                  >
                    Get Free Quotes <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-background hover:bg-white/10 h-13 px-8 text-base rounded-xl"
                    data-testid="button-join-pro"
                    onClick={() => { localStorage.setItem("intended_role", "contractor"); window.location.href = "/api/login"; }}
                  >
                    Join as a Tradesperson
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { value: "500+", label: "Verified Trades" },
                { value: "2,000+", label: "Jobs Completed" },
                { value: "4.9 ★", label: "Average Rating" },
                { value: "< 2hrs", label: "Avg. Response" },
              ].map((stat, i) => (
                <div key={i} className="py-5 px-4 text-center border-r border-white/10 last:border-r-0">
                  <div className="text-2xl font-display font-bold">{stat.value}</div>
                  <div className="text-xs text-background/50 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp(0.1)} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">What do you need help with?</h2>
            <p className="text-muted-foreground">Post a job in any of our current categories. More trades coming soon.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.value} {...fadeUp(0.1 + i * 0.08)}>
                <div
                  className="group p-7 rounded-2xl border-2 border-border hover:border-primary/50 bg-card hover:shadow-xl transition-all duration-200 cursor-pointer text-center"
                  onClick={() => {
                    if (isAuthenticated) {
                      window.location.href = isContractor ? `/dashboard` : `/create-request?category=${cat.value}`;
                    } else {
                      localStorage.setItem("intended_role", "homeowner");
                      window.location.href = "/api/login";
                    }
                  }}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{cat.emoji}</div>
                  <h3 className="text-xl font-display font-bold mb-2">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{cat.desc}</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {cat.examples.map((ex) => (
                      <span key={ex} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{ex}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
              <Wrench className="w-4 h-4" />
              More trades coming soon — HVAC, Roofing, Painting & more
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: HOMEOWNERS ── */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeUp(0.1)} className="mb-12">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">For Homeowners</div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Get the job done in 3 steps</h2>
              <p className="text-muted-foreground max-w-lg">No phone calls, no chasing quotes. Post once, compare offers, hire confidently.</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  icon: "📋",
                  title: "Describe your job",
                  desc: "Tell us what needs fixing. Add photos for faster, more accurate quotes. Takes 60 seconds.",
                },
                {
                  step: "2",
                  icon: "💬",
                  title: "Receive quotes",
                  desc: "Verified local tradespeople send you quotes with their price and approach. Compare side by side.",
                },
                {
                  step: "3",
                  icon: "✅",
                  title: "Hire & pay safely",
                  desc: "Choose the best quote, get the work done, and pay securely through DOMO. Leave a review.",
                },
              ].map((item, i) => (
                <motion.div key={i} {...fadeUp(0.1 + i * 0.1)} className="relative bg-card border border-border/60 rounded-2xl p-7 hover:shadow-lg transition-all">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="absolute top-5 right-5 text-5xl font-display font-bold text-muted/20">{item.step}</div>
                  <h3 className="text-lg font-bold font-display mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-green-500" /> No obligation to hire</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-green-500" /> Free to post a job</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 text-green-500" /> Pay only when satisfied</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: TRADES ── */}
      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeUp(0.1)} className="mb-12">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">For Tradespeople</div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Grow your business with DOMO</h2>
              <p className="text-background/60 max-w-lg">Find qualified leads in your area. No subscription fees — only pay a small commission on completed jobs.</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Get matched to local jobs",
                  desc: "We notify you instantly when a homeowner posts a job that matches your trade and location.",
                },
                {
                  icon: <DollarSign className="w-6 h-6" />,
                  title: "Submit competitive quotes",
                  desc: "Send your price and proposal directly. No middleman — homeowners see your quote in real time.",
                },
                {
                  icon: <Star className="w-6 h-6" />,
                  title: "Build your reputation",
                  desc: "Earn 5-star reviews after every job. Your rating is your brand — the better it is, the more leads you win.",
                },
              ].map((item, i) => (
                <motion.div key={i} {...fadeUp(0.1 + i * 0.1)} className="p-7 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                  <div className="w-11 h-11 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-5">{item.icon}</div>
                  <h3 className="text-lg font-bold font-display mb-2">{item.title}</h3>
                  <p className="text-background/60 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 p-6 rounded-2xl border border-white/10 bg-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-lg font-display mb-1">Ready to find your next job?</div>
                <div className="text-background/60 text-sm">Free to join. Only a small platform commission on completed work.</div>
              </div>
              <Button
                size="lg"
                className="rounded-xl flex-shrink-0"
                onClick={() => { localStorage.setItem("intended_role", "contractor"); window.location.href = "/api/login"; }}
              >
                Join as a Tradesperson <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-3">Why homeowners trust DOMO</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Verified Tradespeople", desc: "Every pro on DOMO is reviewed and approved before they can submit quotes." },
              { icon: Clock, title: "Quotes in Hours", desc: "Post a job in 60 seconds. Get your first quote in under 2 hours on average." },
              { icon: CheckCircle, title: "Secure Payments", desc: "Your payment is protected. Money only moves when the job is done and you're happy." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold font-display mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      {!isAuthenticated && (
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Ready to get started?</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">Free to post. No commitment. Get quotes from verified local tradespeople today.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 h-13 px-8 rounded-xl text-base font-semibold"
                onClick={() => { localStorage.setItem("intended_role", "homeowner"); window.location.href = "/api/login"; }}
              >
                Post a Job Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 h-13 px-8 rounded-xl text-base"
                onClick={() => { localStorage.setItem("intended_role", "contractor"); window.location.href = "/api/login"; }}
              >
                Join as a Tradesperson
              </Button>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t py-10 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-display font-bold text-xl">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <HomeIcon className="w-4 h-4 text-white" />
            </div>
            DOMO
          </div>
          <div className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} DOMO Property Services. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
