import { Badge } from "@/components/ui/badge";

const goals = [
  {
    year: "2024",
    quarter: "Q1",
    title: "Foundation",
    description: "Establish core infrastructure and design system protocols.",
    status: "completed",
  },
  {
    year: "2024",
    quarter: "Q2",
    title: "Expansion",
    description: "Launch beta services for select partners and refine client portal.",
    status: "in_progress",
  },
  {
    year: "2024",
    quarter: "Q3",
    title: "Automation",
    description: "Implement AI-driven workflows for project deployment and monitoring.",
    status: "pending",
  },
  {
    year: "2025",
    quarter: "Q1",
    title: "Singularity",
    description: "Full autonomy of the Onyx digital command node.",
    status: "pending",
  },
];

export function GoalsTimeline() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white font-mono">Mission Timeline</h2>
      <div className="relative border-l border-slate-800 ml-3 space-y-8 pb-8">
        {goals.map((goal, index) => (
          <div key={index} className="relative pl-8">
            <div className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border border-navy-950 ${
              goal.status === 'completed' ? 'bg-emerald-500' : 
              goal.status === 'in_progress' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'
            }`} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-cyan-500">{goal.year} // {goal.quarter}</span>
                <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
              </div>
              <Badge variant={
                goal.status === 'completed' ? 'default' : 
                goal.status === 'in_progress' ? 'outline' : 'secondary'
              } className={
                goal.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                goal.status === 'in_progress' ? 'text-cyan-500 border-cyan-500/30' : 'text-slate-500'
              }>
                {goal.status.toUpperCase().replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              {goal.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
