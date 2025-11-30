import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInterviewStore } from '@/store/interviewStore';
import { User } from '@/api';

export const UserPresence = () => {
  const { users, currentUser } = useInterviewStore();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isCurrentUser = (user: User) => {
    return user.id === currentUser?.id;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Participants</h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Avatar className="w-8 h-8" style={{ backgroundColor: user.color }}>
              <AvatarFallback className="text-white text-xs font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name}
                {isCurrentUser(user) && (
                  <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                )}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        ))}
      </div>
    </div>
  );
};
