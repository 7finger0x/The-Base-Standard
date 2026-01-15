import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TierBadge } from './TierBadge';

describe('TierBadge', () => {
  it('renders correct label and description for BASED tier', () => {
    render(<TierBadge tier="BASED" />);
    expect(screen.getByText('BASED')).toBeDefined();
    expect(screen.getByText(/Top 5% Elite/)).toBeDefined();
    expect(screen.getByText(/851-950 pts/)).toBeDefined();
  });

  it('renders correct label and description for LEGEND tier', () => {
    render(<TierBadge tier="LEGEND" />);
    expect(screen.getByText('LEGEND')).toBeDefined();
    expect(screen.getByText(/Ecosystem Leaders/)).toBeDefined();
  });

  it('defaults to TOURIST for unknown tier', () => {
    render(<TierBadge tier="UNKNOWN_TIER" />);
    expect(screen.getByText('TOURIST')).toBeDefined();
    expect(screen.getByText(/Low Retention/)).toBeDefined();
  });

  it('hides description when size is sm', () => {
    render(<TierBadge tier="BASED" size="sm" />);
    expect(screen.queryByText(/Top 5% Elite/)).toBeNull();
  });
});