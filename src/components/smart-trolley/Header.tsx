import { Signal, Battery, Clock } from 'lucide-react';

export function Header() {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">🛒</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Smart Trolley</h1>
          <p className="text-xs text-muted-foreground">Dual-Layer Secure Billing</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="px-3 py-1 bg-secondary rounded-full">
          <span className="text-xs font-medium text-primary">TROLLEY-001</span>
        </div>
        
        <div className="flex items-center gap-3 text-muted-foreground">
          <Signal className="w-4 h-4 text-success" />
          <Battery className="w-4 h-4" />
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">{currentTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
