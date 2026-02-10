import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Cpu } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-navy-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-8 w-8 items-center justify-center transition-opacity group-hover:opacity-80">
            <Image src="/icon.png" alt="Onyx Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="font-mono text-lg font-bold tracking-tight text-white">
            Onyx Dev Labs
          </span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link
            href="/#projects"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
          >
            Projects
          </Link>
          <Link
            href="/manifesto"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
          >
            Manifesto
          </Link>
          <Link
            href="/services"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
          >
            Services
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/contact">
            <Button variant="cyber" size="sm" className="rounded-full">
              <Cpu className="mr-2 h-4 w-4" />
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
