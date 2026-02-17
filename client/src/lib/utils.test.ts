import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('handles mixed inputs', () => {
    expect(cn('class1', ['class2'], { class3: true })).toBe('class1 class2 class3');
  });

  it('handles Tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles edge cases', () => {
    expect(cn(undefined, null, false)).toBe('');
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
  });
});
