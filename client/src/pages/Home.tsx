import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ArrowRight, CheckCircle2, Shield, Zap, Home as HomeIcon, Star, Users, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { motion } from "framer-motion";

const categories = [
  { label: "Plumbing", emoji: "🔧" },
  { label: "Electrical", emoji: "⚡" },
  { label: "Roofing", emoji: "🏠" },
  { label: "Landscaping", emoji: "🌿" },
  { label: "Photography", emoji: "📸" },
  { label: "Legal", emoji: "⚖️" },
  { label: "Cleaning", emoji: "✨" },
  { label: "Real Estate", emoji: "🏡" },
  { label: "HVAC", emoji: "❄️" },
  { label: "Moving", emoji: "📦" },
  { label: "Painting", emoji: "🎨" },
  { label: "Inspection", emoji: "🔍" },
];

const stats = [
  { value: "500+", label: "Verified Pros" },
  { value: "2,000+", label: "Jobs Completed" },
  { value: "4.9★", label: "Average Rating" },
  { value: "< 2hrs", label: "Avg. Quote Time" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(221 83% 53%) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(262 83% 58%) 0%, transparent 50%)" }}
        />
        <div className="container mx-auto px-4 pt-24 pb-28 lg:pt-36 lg:pb-40 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Trusted by homeowners across BC
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.05] mb-6">
              Property services,<br />
              <span className="text-primary">on demand.</span>
            </h1>
            <p className="text-lg md:text-xl text-background/60 max-w-xl mb-10 leading-relaxed">
              Post any home or property job. Get competitive quotes from verified local professionals — fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/create-request">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white h-14 px-8 text-base rounded-xl" data-testid="button-post-request">
                      Post a Job <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="border-white/20 text-background hover:bg-white/10 h-14 px-8 text-base rounded-xl" data-testid="button-dashboard">
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white h-14 px-8 text-base rounded-xl"
                    data-testid="button-find-professional"
                    onClick={() => { localStorage.setItem("intended_role", "homeowner"); window.location.href = "/api/login"; }}
                  >
                    Post a Job <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-background hover:bg-white/10 h-14 px-8 text-base rounded-xl"
                    data-testid="button-join-pro"
                    onClick={() => { localStorage.setItem("intended_role", "contractor"); window.location.href = "/api/login"; }}
                  >
                    Join as a Pro
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {stats.map((stat, i) => (
                <div key={i} className="py-6 px-4 text-center border-r border-white/10 last:border-r-0">
                  <div className="text-2xl font-display font-bold text-background">{stat.value}</div>
                  <div className="text-sm text-background/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-center mb-3">Browse by service</h2>
          <p className="text-muted-foreground text-center mb-10">30+ categories, one platform</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How DOMO works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to get any property job done.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Post your job", desc: "Describe what you need, add photos, and set your location. Takes under 2 minutes.", icon: Briefcase },
              { step: "02", title: "Get quotes", desc: "Verified local professionals send you competitive quotes. Compare and choose the best fit.", icon: Users },
              { step: "03", title: "Get it done", desc: "Work gets completed, you pay securely through the platform. Leave a review.", icon: CheckCircle2 },
            ].map((item) => (
              <div key={item.step} className="relative p-8 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-all group">
                <div className="text-6xl font-display font-bold text-muted/30 absolute top-6 right-6">{item.step}</div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Verified Professionals", desc: "Every contractor is reviewed and approved before they can quote on jobs." },
              { icon: Zap, title: "Quotes in Hours", desc: "Post a job and start receiving competitive quotes from local pros within hours." },
              { icon: Star, title: "Secure Payments", desc: "Pay through the platform only when the job is complete. No surprises." },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">{feature.title}</h3>
                <p className="text-background/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">Join thousands of property owners and professionals on DOMO.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-14 px-10 text-base rounded-xl"
                onClick={() => { localStorage.setItem("intended_role", "homeowner"); window.location.href = "/api/login"; }}
              >
                Post a Job Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-base rounded-xl"
                onClick={() => { localStorage.setItem("intended_role", "contractor"); window.location.href = "/api/login"; }}
              >
                Join as a Pro
              </Button>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-display font-bold text-2xl">
            <HomeIcon className="w-6 h-6 text-primary" />
            <span>DOMO</span>
          </div>
          <div className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} DOMO. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
