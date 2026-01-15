import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletList } from './WalletList';
import { useAccount } from 'wagmi';
import { useIdentity, useUnlinkWallet, useSetPrimaryWallet } from '@/hooks/useIdentity';

// Mock dependencies
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}));

vi.mock('@/hooks/useIdentity', () => ({
  useIdentity: vi.fn(),
  useUnlinkWallet: vi.fn(),
  useSetPrimaryWallet: vi.fn(),
}));

const MOCK_WALLETS = [
  {
    id: '1',
    address: '0x1234567890123456789012345678901234567890',
    isPrimary: true,
    linkedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: '2',
    address: '0x0987654321098765432109876543210987654321',
    isPrimary: false,
    linkedAt: '2026-01-02T00:00:00Z'
  }
];

describe('WalletList', () => {
  const mockUnlink = vi.fn();
  const mockSetPrimary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useUnlinkWallet).mockReturnValue({ mutate: mockUnlink, isPending: false } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useSetPrimaryWallet).mockReturnValue({ mutate: mockSetPrimary, isPending: false } as any);
  });

  it('renders loading state', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useIdentity).mockReturnValue({ data: undefined, isLoading: true } as any);
    render(<WalletList />);
    const container = screen.getByText((_, element) => element?.className.includes('animate-pulse') ?? false);
    expect(container).toBeDefined();
  });

  it('renders nothing if no wallets', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useIdentity).mockReturnValue({ data: { wallets: [] }, isLoading: false } as any);
    const { container } = render(<WalletList />);
    expect(container.firstChild).toBeNull();
  });

  it('renders wallet list correctly', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useIdentity).mockReturnValue({ data: { wallets: MOCK_WALLETS }, isLoading: false } as any);
    render(<WalletList />);

    // Check addresses are displayed (truncated)
    expect(screen.getByText('0x1234...7890')).toBeDefined();
    expect(screen.getByText('0x0987...4321')).toBeDefined();

    // Check Primary badge
    expect(screen.getByText('PRIMARY')).toBeDefined();
  });

  it('calls setPrimary when button clicked', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useIdentity).mockReturnValue({ data: { wallets: MOCK_WALLETS }, isLoading: false } as any);
    render(<WalletList />);

    const makePrimaryBtn = screen.getByText('Make Primary');
    fireEvent.click(makePrimaryBtn);

    expect(mockSetPrimary).toHaveBeenCalledWith('2');
  });

  it('calls unlinkWallet when button clicked', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useIdentity).mockReturnValue({ data: { wallets: MOCK_WALLETS }, isLoading: false } as any);
    render(<WalletList />);

    const unlinkBtn = screen.getByText('Unlink');
    fireEvent.click(unlinkBtn);

    expect(mockUnlink).toHaveBeenCalledWith('2');
  });
});
