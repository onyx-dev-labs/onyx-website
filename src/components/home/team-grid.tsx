'use client';

import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Card } from '@/components/ui/card';
import { TeamMemberRow } from '@/actions/team';
import Image from 'next/image';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TeamGridProps {
  members: TeamMemberRow[];
}

export function TeamGrid({ members }: TeamGridProps) {
  if (!members || members.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No team members found.</p>
      </div>
    );
  }

  // Sort by display_order if available, otherwise name
  const sortedMembers = [...members].sort((a, b) => {
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {sortedMembers.map((member, index) => (
        <ScrollReveal
          key={member.id}
          variant="slide-up"
          delay={index * 0.1}
          duration={0.5}
        >
          <Card className="h-full bg-navy-900/50 border-slate-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden group">
            <div className="p-6 flex flex-col items-center text-center h-full">
              {/* Profile Image Container */}
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-slate-700 group-hover:border-cyan-500 transition-colors duration-300 shadow-lg shadow-black/50">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={`${member.name} - ${member.role}`}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      quality={90}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <User className="w-16 h-16 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  )}
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between w-full">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-cyan-500 font-mono text-sm uppercase tracking-wider mb-4">
                    {member.role}
                  </p>
                </div>

                {member.bio && (
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-4">
                    {member.bio}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </ScrollReveal>
      ))}
    </div>
  );
}
