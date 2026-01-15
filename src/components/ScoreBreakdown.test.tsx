import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBreakdown } from './ScoreBreakdown';
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

describe('ScoreBreakdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' } as any);
    vi.mocked(useReputation).mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<ScoreBreakdown />);

    // Check for pulse animation class indicating loading skeleton
    const container = screen.getByText((_, element) => element?.className.includes('animate-pulse') ?? false);
    expect(container).toBeDefined();
  });

  it('renders pillar breakdown correctly', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' } as any);
    vi.mocked(useReputation).mockReturnValue({ 
      data: MOCK_REPUTATION_RESPONSE.data, 
      isLoading: false 
    } as any);

    render(<ScoreBreakdown />);

    // Check for Pillar Titles
    expect(screen.getByText(/Capital Efficiency/i)).toBeDefined();
    expect(screen.getByText(/Ecosystem Diversity/i)).toBeDefined();
    expect(screen.getByText(/Identity & Social/i)).toBeDefined();

    // Check for Scores (based on mock data: Capital 350, Diversity 250, Identity 280)
    // Max scores: Capital 400, Diversity 300, Identity 300
    expect(screen.getByText('350 / 400')).toBeDefined();
    expect(screen.getByText('250 / 300')).toBeDefined();
    expect(screen.getByText('280 / 300')).toBeDefined();
  });

  it('renders decay warning when applicable', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' } as any);
    
    const decayData = {
      ...MOCK_REPUTATION_RESPONSE.data,
      decayInfo: {
        daysSinceLastActivity: 45,
        decayMultiplier: 0.95,
        willDecay: true
      }
    };

    vi.mocked(useReputation).mockReturnValue({ 
      data: decayData, 
      isLoading: false 
    } as any);

    render(<ScoreBreakdown />);

    // Check for decay warning text
    expect(screen.getByText(/Score Decay Active/i)).toBeDefined();
    expect(screen.getByText(/45 days inactive/i)).toBeDefined();
  });

  it('renders multiplier when applicable', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' } as any);
    vi.mocked(useReputation).mockReturnValue({ 
      data: { ...MOCK_REPUTATION_RESPONSE.data, multiplier: 1.5 }, 
      isLoading: false 
    } as any);

    render(<ScoreBreakdown />);

    expect(screen.getByText(/1.5x Multiplier/i)).toBeDefined();
  });
});