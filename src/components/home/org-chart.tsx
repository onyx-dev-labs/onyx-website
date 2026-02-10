'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import { TeamMemberNode } from '@/actions/team';

// Node Component
const OrgNode = ({ member, isRoot = false }: { member: TeamMemberNode; isRoot?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = member.children && member.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        <Card
          className={cn(
            "w-64 border-slate-800 bg-navy-900/80 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group cursor-pointer",
            isRoot ? "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)] scale-110" : ""
          )}
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          <div className="p-4 flex flex-col items-center text-center gap-3">
            <div className={cn(
              "h-24 w-24 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-colors bg-slate-800",
              isRoot ? "border-cyan-400" : "border-slate-600 group-hover:border-cyan-500/50"
            )}>
              {member.avatar_url ? (
                <Image 
                  src={member.avatar_url} 
                  alt={`${member.name} - ${member.role}`}
                  width={96}
                  height={96}
                  className="object-cover h-full w-full"
                  loading="lazy"
                />
              ) : (
                <User className={cn("h-10 w-10", isRoot ? "text-cyan-300" : "text-slate-400")} />
              )}
            </div>
            
            <div>
              <h3 className={cn("font-bold text-lg", isRoot ? "text-white" : "text-slate-200")}>
                {member.name}
              </h3>
              <p className="text-cyan-500 font-mono text-xs font-medium uppercase tracking-wider mt-1">
                {member.role}
              </p>
              {member.bio && (
                <Badge variant="secondary" className="mt-2 text-[10px] bg-slate-800/50 text-slate-400 max-w-[180px] truncate">
                  {member.bio}
                </Badge>
              )}
            </div>

            {hasChildren && (
              <button 
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 hover:bg-cyan-900 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Children Container */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            {/* Vertical connector from parent */}
            <div className="h-8 w-px bg-slate-700"></div>

            {/* Horizontal connector bar */}
            <div className="relative flex justify-center pt-8">
              {/* The horizontal line spanning all children */}
              <div className="absolute top-0 left-0 w-full h-px bg-slate-700 -translate-y-px hidden md:block" 
                   style={{ left: '50%', width: `calc(100% - ${100 / member.children!.length}%)`, transform: 'translateX(-50%)' }}></div>

              <div className="flex flex-col md:flex-row gap-8 md:gap-4 px-4">
                {member.children!.map((child) => (
                  <div key={child.id} className="flex flex-col items-center relative">
                     {/* Vertical connector to child (Desktop) */}
                    <div className="absolute -top-8 left-1/2 w-px h-8 bg-slate-700 hidden md:block"></div>
                    
                    {/* Vertical connector (Mobile) - simplistic stack approach */}
                    <div className="h-8 w-px bg-slate-700 md:hidden"></div>
                    
                    <OrgNode member={child} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function OrgChart({ data }: { data: TeamMemberNode | null }) {
  if (!data) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
        <p>No organizational structure defined yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-12 pt-4 px-4 min-h-[600px] flex justify-center">
      <div className="min-w-fit">
        <OrgNode member={data} isRoot={true} />
      </div>
    </div>
  );
}
