import { BookOpen } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-1.5 leading-none">
      <div className="relative flex items-center">
        <BookOpen className="h-6 w-6 text-orange-600" strokeWidth={2.3} />
      </div>
      <span className="text-lg font-semibold tracking-tighter text-foreground leading-none">
        <span className="text-orange-600 font-bold">µ</span>Learn
      </span>
    </div>
  );
}
