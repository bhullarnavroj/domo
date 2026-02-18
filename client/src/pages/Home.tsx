import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ArrowRight, CheckCircle2, Shield, Zap, Hammer } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 hero-gradient -z-10" />
        <div className="absolute inset-0 bg-[url('https://pixabay.com/get/ga3ad6977b619e182da1410236e573f0935c8ebaf4ac55defa23a1cdc6986c09f41fc19c2afb971955360f56341e32944e60ef78bcca9f140b5faf05285c5b53d_1280.png')] opacity-5 mix-blend-overlay -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-tight"
          >
            Find Trusted Pros for <br className="hidden md:block" />
            <span className="text-primary bg-clip-text">Every Home Project</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Connect with vetted contractors in minutes. From quick fixes to major renovations, 
            we make home improvement simple, secure, and stress-free.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-6 rounded-full w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all" onClick={() => window.location.href = "/api/login"}>
                  Find a Contractor
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full w-full sm:w-auto bg-white/50 backdrop-blur-sm" onClick={() => window.location.href = "/api/login"}>
                  Join as a Pro
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">Why Choose FixItPro?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We bridge the gap between homeowners and professionals with transparency and trust.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Vetted Professionals",
                desc: "Every contractor is verified to ensure quality and reliability for your peace of mind."
              },
              {
                icon: Zap,
                title: "Fast & Easy Quotes",
                desc: "Post a job and receive competitive quotes from local experts within hours."
              },
              {
                icon: CheckCircle2,
                title: "Secure Payments",
                desc: "Payments are protected and released only when you're satisfied with the work."
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 font-display font-bold text-2xl mb-4 md:mb-0">
              <Hammer className="w-6 h-6 text-primary" />
              <span>FixItPro</span>
            </div>
            <div className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} FixItPro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
