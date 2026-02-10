import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Background } from "@/components/layout/background";
import { ContactForm } from "@/components/contact/contact-form";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function ContactPage() {
  return (
    <main className="min-h-screen relative flex flex-col">
      <Background />
      <Navbar />
      
      <div className="flex-1 container px-4 md:px-6 py-24 md:py-32 relative z-10">
        <ScrollReveal variant="slide-up">
          <div className="flex flex-col items-center mb-12 text-center">
            <Badge variant="cyber" className="mb-4">Communication Link</Badge>
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl font-mono mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                Initiate Contact
              </span>
            </h1>
            <p className="max-w-[600px] text-lg text-slate-400">
              Ready to architect the future? Establish a secure connection with our team 
              to discuss your next mission-critical project.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="slide-up" delay={0.2}>
          <ContactForm />
        </ScrollReveal>
      </div>

      <Footer />
    </main>
  );
}
