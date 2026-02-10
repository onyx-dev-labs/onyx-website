'use client';

import { Badge } from "@/components/ui/badge";
import { TeamGrid } from "@/components/home/team-grid";
import { TeamMemberRow } from "@/actions/team";

export function Team({ members }: { members: TeamMemberRow[] }) {
  return (
    <section id="team" className="py-20 relative overflow-hidden bg-navy-950/30">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="mb-12 text-center">
          <Badge variant="cyber" className="mb-4">The Squad</Badge>
          <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl font-mono">
            Meet Our Team
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            The visionary minds and technical experts behind Onyx.
          </p>
        </div>

        <TeamGrid members={members} />
      </div>
    </section>
  );
}
