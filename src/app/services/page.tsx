import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Background } from "@/components/layout/background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Globe, Code, Database, TrendingUp, Shield, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: "web-design",
    title: "Website Design",
    icon: Globe,
    description: "Immersive, high-performance UI/UX design that captures brand identity and converts visitors.",
    features: [
      "Responsive & Adaptive Layouts",
      "Interactive 3D Elements (WebGL)",
      "Accessibility Compliance (WCAG 2.1)",
      "Brand Identity Integration",
      "Motion Design & Micro-interactions"
    ],
    benefits: "Increase engagement and reduce bounce rates with visually stunning, user-centric interfaces."
  },
  {
    id: "web-app",
    title: "Web Application Development",
    icon: Code,
    description: "Scalable, full-stack applications built on Next.js and React Server Components for mission-critical operations.",
    features: [
      "Full-Stack Architecture (Next.js/Node.js)",
      "Real-time Collaboration Features",
      "API Development & Integration",
      "Progressive Web Apps (PWA)",
      "Cloud-Native Deployment"
    ],
    benefits: "Streamline operations and scale effortlessly with robust, maintainable application architecture."
  },
  {
    id: "data-science",
    title: "Data Science Services",
    icon: Database,
    description: "Advanced analytics pipelines and machine learning models to extract actionable insights from raw data.",
    features: [
      "Predictive Analytics & Forecasting",
      "Natural Language Processing (NLP)",
      "Data Visualization Dashboards",
      "Big Data Processing Pipelines",
      "Custom AI Model Training"
    ],
    benefits: "Make data-driven decisions and uncover hidden patterns to drive business growth."
  },
  {
    id: "economics",
    title: "Economics and Statistics",
    icon: TrendingUp,
    description: "Rigorous statistical modeling and econometric analysis for market research and financial planning.",
    features: [
      "Market Trend Analysis",
      "Econometric Modeling",
      "Risk Assessment & Management",
      "Statistical Survey Design",
      "Impact Evaluation Studies"
    ],
    benefits: "Optimize strategy and mitigate risk with scientifically backed economic intelligence."
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Services",
    icon: Shield,
    description: "Military-grade protection for your digital assets, ensuring data integrity and regulatory compliance.",
    features: [
      "Penetration Testing & Audits",
      "End-to-End Encryption Implementation",
      "Identity & Access Management (IAM)",
      "Compliance Consulting (GDPR, HIPAA)",
      "Incident Response Planning"
    ],
    benefits: "Protect your reputation and assets with proactive, multi-layered security protocols."
  }
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen relative flex flex-col">
      <Background />
      <Navbar />
      
      <div className="flex-1 pt-24 pb-16">
        <div className="container px-4 md:px-6 mx-auto">
          {/* Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge variant="cyber" className="mb-4">System Capabilities</Badge>
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl font-mono mb-6">
              Service Portfolio
            </h1>
            <p className="text-lg text-slate-400">
              Comprehensive digital solutions engineered for performance, security, and scalability.
              We architect the future of your business.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20">
            {services.map((service) => (
              <Card key={service.id} className="border-slate-800 bg-navy-900/40 hover:border-cyan-500/30 transition-all duration-300 group flex flex-col">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 group-hover:bg-cyan-500/20 transition-colors text-cyan-500">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-white font-mono">{service.title}</CardTitle>
                  <CardDescription className="text-slate-400 mt-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Deliverables:</h4>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start text-sm text-slate-400">
                        <CheckCircle className="h-4 w-4 text-cyan-500 mr-2 mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="p-4 rounded-lg bg-navy-950/50 border border-slate-800">
                    <p className="text-xs text-cyan-400 font-mono">IMPACT_METRIC:</p>
                    <p className="text-sm text-slate-300 mt-1">{service.benefits}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/contact?service=${service.id}`}>
                      REQUEST_BRIEFING <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Comparison / Pricing Tiers (Simplified) */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center font-mono">ENGAGEMENT_TIERS</h2>
            <div className="grid gap-6 md:grid-cols-3">
               <Card className="border-slate-800 bg-navy-950/30">
                 <CardHeader>
                   <CardTitle className="text-white">CONSULTATION</CardTitle>
                   <CardDescription>Initial assessment & strategy</CardDescription>
                   <div className="mt-4 text-3xl font-bold text-cyan-400">$500<span className="text-sm font-normal text-slate-500">/session</span></div>
                 </CardHeader>
                 <CardContent>
                   <ul className="space-y-2 text-sm text-slate-400">
                     <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-slate-600" /> Architecture Review</li>
                     <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-slate-600" /> Security Audit</li>
                     <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-slate-600" /> Tech Stack Advisory</li>
                   </ul>
                 </CardContent>
                 <CardFooter>
                   <Button className="w-full" variant="ghost">Select Plan</Button>
                 </CardFooter>
               </Card>
               
               <Card className="border-cyan-500/50 bg-navy-900/60 relative overflow-hidden">
                 <div className="absolute top-0 right-0 bg-cyan-500 text-navy-950 text-xs font-bold px-3 py-1">RECOMMENDED</div>
                 <CardHeader>
                   <CardTitle className="text-white">PROJECT_EXECUTION</CardTitle>
                   <CardDescription>Full-cycle development</CardDescription>
                   <div className="mt-4 text-3xl font-bold text-cyan-400">CUSTOM<span className="text-sm font-normal text-slate-500">/project</span></div>
                 </CardHeader>
                 <CardContent>
                   <ul className="space-y-2 text-sm text-slate-300">
                     <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-cyan-500" /> Dedicated Team</li>
                     <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-cyan-500" /> Agile Sprints</li>
                     <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-cyan-500" /> QA & Testing</li>
                     <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-cyan-500" /> Deployment Support</li>
                   </ul>
                 </CardContent>
                 <CardFooter>
                   <Button className="w-full" variant="cyber">INITIATE_CONTRACT</Button>
                 </CardFooter>
               </Card>

               <Card className="border-slate-800 bg-navy-950/30">
                 <CardHeader>
                   <CardTitle className="text-white">ENTERPRISE_PARTNER</CardTitle>
                   <CardDescription>Long-term support & evolution</CardDescription>
                   <div className="mt-4 text-3xl font-bold text-cyan-400">RETAINER<span className="text-sm font-normal text-slate-500">/month</span></div>
                 </CardHeader>
                 <CardContent>
                   <ul className="space-y-2 text-sm text-slate-400">
                     <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-slate-600" /> 24/7 SLA Support</li>
                     <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-slate-600" /> Priority Feature Dev</li>
                     <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-slate-600" /> Quarterly Audits</li>
                   </ul>
                 </CardContent>
                 <CardFooter>
                   <Button className="w-full" variant="ghost">Contact Sales</Button>
                 </CardFooter>
               </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-2xl p-12 border border-cyan-500/20">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Architect Your Future?</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Schedule a consultation with our experts to discuss your project requirements and receive a custom technical proposal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button size="lg" variant="cyber" asChild>
                 <Link href="/contact">INITIALIZE_COMMUNICATION</Link>
               </Button>
               <Button size="lg" variant="outline">
                 DOWNLOAD_CAPABILITIES_DECK
               </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}