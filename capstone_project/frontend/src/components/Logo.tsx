import { BookOpen } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 leading-none">
      <div className="relative flex items-center">
        <BookOpen className="h-6 w-6 text-orange-600" />
      </div>
      <span className="text-lg font-semibold tracking-tighter text-foreground leading-none">
        µLearn
      </span>
    </div>
  );
}
