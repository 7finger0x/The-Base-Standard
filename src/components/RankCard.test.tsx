import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RankCard } from './RankCard';
import { useAccount } from 'wagmi';
import { useReputation } from '@/hooks/useReputation';
import { MOCK_REPUTATION_RESPONSE } from '@/lib/mock-reputation';

// Mock dependencies
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}));

vi.mock('@/hooks/useReputation', () => ({
  useReputation: vi.fn(),
}));

vi.mock('@/components/TierBadge', () => ({
  TierBadge: ({ tier }: { tier: string }) => <div data-testid="tier-badge">{tier}</div>,
}));

describe('RankCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders connect wallet message when not connected', () => {
    vi.mocked(useAccount).mockReturnValue({ address: undefined } as any);
    vi.mocked(useReputation).mockReturnValue({ data: undefined, isLoading: false } as any);

    render(<RankCard />);

    expect(screen.getByText('Connect wallet to view rank')).toBeDefined();
  });

  it('renders loading state', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' } as any);
    vi.mocked(useReputation).mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<RankCard />);

    // Check for pulse animation class
    const container = screen.getByText((_, element) => element?.className.includes('animate-pulse') ?? false);
    expect(container).toBeDefined();
  });

  it('renders rank and score data correctly when connected', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' } as any);
    vi.mocked(useReputation).mockReturnValue({ 
      data: MOCK_REPUTATION_RESPONSE.data, 
      isLoading: false 
    } as any);

    render(<RankCard />);

    // Check Rank (formatted with locale string)
    expect(screen.getByText('#42')).toBeDefined();
    expect(screen.getByText('of 10,000')).toBeDefined();

    // Check Tier Badge
    expect(screen.getByTestId('tier-badge').textContent).toBe('BASED');

    // Check Total Score
    expect(screen.getByText('875')).toBeDefined();

    // Check Pillars
    // Capital (350 / 400)
    expect(screen.getByText('Capital')).toBeDefined();
    expect(screen.getByText('350')).toBeDefined();
    
    // Diversity (250 / 300)
    expect(screen.getByText('Diversity')).toBeDefined();
    expect(screen.getByText('250')).toBeDefined();

    // Identity (280 / 300)
    expect(screen.getByText('Identity')).toBeDefined();
    expect(screen.getByText('280')).toBeDefined();
  });
});