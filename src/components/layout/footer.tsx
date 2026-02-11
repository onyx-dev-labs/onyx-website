export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-950 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 font-mono text-lg font-bold text-white">
              ONYX<span className="text-cyan-500">_LABS</span>
            </h3>
            <p className="text-sm text-slate-400">
              High-fidelity digital command node. 
              Engineering the future of digital interaction.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
              Sectors
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-cyan-400">Web Architecture</a></li>
              <li><a href="#" className="hover:text-cyan-400">Data Intelligence</a></li>
              <li><a href="#" className="hover:text-cyan-400">Cyber Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
              Protocol
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-cyan-400">Manifesto</a></li>
              <li><a href="#" className="hover:text-cyan-400">Process</a></li>
              <li><a href="#" className="hover:text-cyan-400">System Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-cyan-400">GitHub</a></li>
              <li><a href="#" className="hover:text-cyan-400">Twitter</a></li>
              <li><a href="#" className="hover:text-cyan-400">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-slate-500 md:flex-row">
          <p>&copy; 2026 NyxUs Dev. All systems operational.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
