import { BookOpen, Sparkles } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <BookOpen className="h-6 w-6 text-orange-600" />
        <Sparkles className="h-3 w-3 text-orange-500 absolute -top-1 -right-1" />
      </div>
      <span className="text-lg font-semibold tracking-tight">µLearn</span>
    </div>
  );
}
