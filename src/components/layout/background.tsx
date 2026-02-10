export function Background() {
  return (
    <div className="fixed inset-0 z-[-50] pointer-events-none">
      <div className="absolute inset-0 bg-navy-950" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-blue-600/10 blur-[80px] rounded-full" />
    </div>
  );
}
