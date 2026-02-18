import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ArrowRight, CheckCircle2, Shield, Zap, Home as HomeIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 hero-gradient -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-tight"
          >
            Your Home, <br className="hidden md:block" />
            <span className="text-primary bg-clip-text">One Platform</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            From plumbers to lawyers, photographers to property managers — connect 
            with vetted professionals for every property need in minutes.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" data-testid="button-go-dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Button size="lg" data-testid="button-find-professional" onClick={() => window.location.href = "/api/login"}>
                  Find a Professional
                </Button>
                <Button size="lg" variant="outline" data-testid="button-join-pro" onClick={() => window.location.href = "/api/login"}>
                  Join as a Pro
                </Button>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-8 text-sm text-muted-foreground"
          >
            {["Plumbing", "Legal", "Photography", "Real Estate", "Electrical", "Property Mgmt"].map((cat) => (
              <span key={cat} className="px-3 py-1 rounded-full bg-muted border border-border/50">{cat}</span>
            ))}
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">+20 more</span>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">Why Choose DOMO?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">One marketplace for every property service — from home repairs to legal counsel.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Vetted Professionals",
                desc: "Every service provider is verified to ensure quality and reliability for your peace of mind."
              },
              {
                icon: Zap,
                title: "Fast & Easy Quotes",
                desc: "Post a request and receive competitive quotes from local experts within hours."
              },
              {
                icon: CheckCircle2,
                title: "Secure Payments",
                desc: "Payments are protected and processed securely through our platform."
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-md bg-muted/30 border border-border/50">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center text-primary mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 font-display font-bold text-2xl">
              <HomeIcon className="w-6 h-6 text-primary" />
              <span>DOMO</span>
            </div>
            <div className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} DOMO. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
