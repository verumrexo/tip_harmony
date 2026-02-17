import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonSelector } from './PersonSelector';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('PersonSelector', () => {
  const defaultProps = {
    label: 'Waiters',
    value: 1,
    options: [1, 2, 3],
    onChange: vi.fn(),
  };

  it('renders with correct label and options', () => {
    render(<PersonSelector {...defaultProps} />);
    expect(screen.getByText('Waiters')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('has accessible group role and label association', () => {
    render(<PersonSelector {...defaultProps} />);
    // Check for the group role
    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();

    // Check if the group is labelled by "Waiters"
    expect(group).toHaveAccessibleName('Waiters');
  });

  it('indicates selected state with aria-pressed', () => {
    render(<PersonSelector {...defaultProps} />);
    const button1 = screen.getByRole('button', { name: '1' });
    const button2 = screen.getByRole('button', { name: '2' });

    expect(button1).toHaveAttribute('aria-pressed', 'true');
    expect(button2).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when clicked', () => {
    render(<PersonSelector {...defaultProps} />);
    const button2 = screen.getByRole('button', { name: '2' });
    fireEvent.click(button2);
    expect(defaultProps.onChange).toHaveBeenCalledWith(2);
  });
});
