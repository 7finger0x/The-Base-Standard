import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareButton } from './ShareButton';
import { useAccount } from 'wagmi';
import { useReputation } from '@/hooks/useReputation';

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}));

vi.mock('@/hooks/useReputation', () => ({
  useReputation: vi.fn(),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('ShareButton', () => {
  it('renders nothing when no reputation data', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' } as any);
    vi.mocked(useReputation).mockReturnValue({ data: undefined } as any);
    
    const { container } = render(<ShareButton />);
    expect(container.firstChild).toBeNull();
  });

  it('renders share buttons when data exists', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' } as any);
    vi.mocked(useReputation).mockReturnValue({ 
      data: { totalScore: 850, tier: 'BASED' } 
    } as any);

    render(<ShareButton />);
    
    expect(screen.getByText('Share on X')).toBeDefined();
    expect(screen.getByText('Warpcast')).toBeDefined();
    expect(screen.getByText('Copy Link')).toBeDefined();
  });

  it('copies to clipboard', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' } as any);
    vi.mocked(useReputation).mockReturnValue({ 
      data: { totalScore: 850, tier: 'BASED' } 
    } as any);

    render(<ShareButton />);
    
    const copyButton = screen.getByText('Copy Link');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Score: 850/1000')
    );
    expect(screen.getByText('Copied!')).toBeDefined();
  });
});