import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PinLock } from './PinLock';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock hooks
const mockUseToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockUseToast
  })
}));

vi.mock('@/hooks/use-ios-input-zoom-fix', () => ({
  useIOSInputZoomFix: () => false
}));

// Mock localStorage
let store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value.toString();
  }),
  clear: vi.fn(() => {
    store = {};
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  })
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('PinLock', () => {
  beforeEach(() => {
    store = {};
    // Reset implementation to default behavior
    localStorageMock.getItem.mockImplementation((key: string) => store[key] || null);

    mockUseToast.mockClear();
    vi.clearAllMocks();
  });

  it('renders lock screen by default', () => {
    render(
      <PinLock>
        <div>Secret Content</div>
      </PinLock>
    );

    expect(screen.getByText('Tip Harmony')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('PIN Code')).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('unlocks with correct PIN', () => {
    render(
      <PinLock>
        <div>Secret Content</div>
      </PinLock>
    );

    const input = screen.getByPlaceholderText('PIN Code');
    fireEvent.change(input, { target: { value: '2519' } });

    const button = screen.getByRole('button', { name: /unlock/i });
    fireEvent.click(button);

    expect(screen.getByText('Secret Content')).toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('tip_harmony_unlocked', 'true');
    expect(mockUseToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Unlocked',
      description: 'Welcome back.'
    }));
  });

  it('fails with incorrect PIN', () => {
    render(
      <PinLock>
        <div>Secret Content</div>
      </PinLock>
    );

    const input = screen.getByPlaceholderText('PIN Code');
    fireEvent.change(input, { target: { value: '1234' } });

    const button = screen.getByRole('button', { name: /unlock/i });
    fireEvent.click(button);

    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
    expect(mockUseToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Access Denied',
      variant: 'destructive'
    }));
    // Should clear input on failure
    expect(input).toHaveValue('');
  });

  it('remains unlocked if session exists', () => {
    // Override implementation specifically for this test
    localStorageMock.getItem.mockReturnValue('true');

    render(
      <PinLock>
        <div>Secret Content</div>
      </PinLock>
    );

    expect(screen.getByText('Secret Content')).toBeInTheDocument();
    expect(screen.queryByText('Tip Harmony')).not.toBeInTheDocument();
  });

  it('respects VITE_PIN_CODE environment variable', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_PIN_CODE', '9999');

    // Re-import the component to pick up the new environment variable
    const { PinLock } = await import('./PinLock');

    render(
      <PinLock>
        <div>Secret Content</div>
      </PinLock>
    );

    const input = screen.getByPlaceholderText('PIN Code');
    fireEvent.change(input, { target: { value: '9999' } });

    const button = screen.getByRole('button', { name: /unlock/i });
    fireEvent.click(button);

    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });
});
