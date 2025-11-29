import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { UserPresence } from '@/components/UserPresence';
import { useInterviewStore } from '@/store/interviewStore';

describe('UserPresence Component', () => {
  beforeEach(() => {
    useInterviewStore.setState({
      users: [],
      currentUser: null,
    });
  });

  it('should render participants header', () => {
    const { getByText } = render(<UserPresence />);
    expect(getByText('Participants')).toBeInTheDocument();
  });

  it('should display list of users', () => {
    useInterviewStore.setState({
      users: [
        { id: '1', name: 'John Doe', color: '#FF0000' },
        { id: '2', name: 'Jane Smith', color: '#00FF00' },
      ],
      currentUser: { id: '1', name: 'John Doe', color: '#FF0000' },
    });

    const { getByText } = render(<UserPresence />);
    
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should mark current user with (You)', () => {
    useInterviewStore.setState({
      users: [
        { id: '1', name: 'John Doe', color: '#FF0000' },
      ],
      currentUser: { id: '1', name: 'John Doe', color: '#FF0000' },
    });

    const { getByText } = render(<UserPresence />);
    
    expect(getByText('(You)')).toBeInTheDocument();
  });

  it('should render empty list when no users', () => {
    const { queryByText } = render(<UserPresence />);
    
    expect(queryByText('JD')).not.toBeInTheDocument();
  });
});
