import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyInput } from './CurrencyInput';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('CurrencyInput', () => {
  it('renders correctly', () => {
    render(<CurrencyInput label="Amount" value="" onValueChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add decimal comma/i })).toBeInTheDocument();
  });

  it('calls onValueChange with correct value when typing digits', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput label="Amount" value="" onValueChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '123' } });
    expect(handleChange).toHaveBeenCalledWith('123');
  });

  it('converts dot to comma', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput label="Amount" value="12" onValueChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '12.' } });
    expect(handleChange).toHaveBeenCalledWith('12,');
  });

  it('allows comma input', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput label="Amount" value="12" onValueChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '12,' } });
    expect(handleChange).toHaveBeenCalledWith('12,');
  });

  it('prevents multiple commas', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput label="Amount" value="12," onValueChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '12,,' } });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('prevents non-digit characters', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput label="Amount" value="" onValueChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('appends comma when button is clicked', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput label="Amount" value="123" onValueChange={handleChange} />);
    const button = screen.getByRole('button', { name: /add decimal comma/i });
    fireEvent.mouseDown(button); // We use onMouseDown in the component
    expect(handleChange).toHaveBeenCalledWith('123,');
  });

  it('does not append comma if already present when button is clicked', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput label="Amount" value="123," onValueChange={handleChange} />);
    const button = screen.getByRole('button', { name: /add decimal comma/i });
    fireEvent.mouseDown(button);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
