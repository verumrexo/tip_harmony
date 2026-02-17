
import { describe, it, expect } from 'vitest';
import { insertCalculationSchema } from './schema';

describe('insertCalculationSchema', () => {
  it('validates a correct calculation object', () => {
    const validData = {
      totalAmount: "100.00",
      waiterCount: 2,
      cookCount: 1,
      dishwasherCount: 1,
      waiterPerPerson: "37.50",
      cookPerPerson: "20.00",
      dishwasherPerPerson: "5.00",
    };
    const result = insertCalculationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('accepts integer strings for numeric fields', () => {
    const validData = {
      totalAmount: "100",
      waiterCount: 2,
      cookCount: 1,
      dishwasherCount: 1,
      waiterPerPerson: "37",
      cookPerPerson: "20",
      dishwasherPerPerson: "5",
    };
    const result = insertCalculationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('accepts decimal strings for numeric fields', () => {
      const validData = {
        totalAmount: "100.50",
        waiterCount: 2,
        cookCount: 1,
        dishwasherCount: 1,
        waiterPerPerson: "37.5",
        cookPerPerson: "20.0",
        dishwasherPerPerson: "0.5",
      };
      const result = insertCalculationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

  it('rejects non-numeric strings for totalAmount', () => {
    const invalidData = {
      totalAmount: "abc",
      waiterCount: 2,
      cookCount: 1,
      dishwasherCount: 1,
      waiterPerPerson: "37.50",
      cookPerPerson: "20.00",
      dishwasherPerPerson: "5.00",
    };
    const result = insertCalculationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
       // We expect the custom error message we will add
       // OR just check that it failed. For now, checking success is false is enough.
       // But checking message is better.
       // expect(result.error.issues[0].message).toContain("valid positive number");
    }
  });

    it('rejects numeric strings with multiple dots', () => {
    const invalidData = {
      totalAmount: "100.50.50",
      waiterCount: 2,
      cookCount: 1,
      dishwasherCount: 1,
      waiterPerPerson: "37.50",
      cookPerPerson: "20.00",
      dishwasherPerPerson: "5.00",
    };
    const result = insertCalculationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });


  it('rejects invalid integers for waiterCount', () => {
    const invalidData = {
      totalAmount: "100.00",
      waiterCount: 2.5, // Float
      cookCount: 1,
      dishwasherCount: 1,
      waiterPerPerson: "37.50",
      cookPerPerson: "20.00",
      dishwasherPerPerson: "5.00",
    };
    const result = insertCalculationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const invalidData = {
      // totalAmount missing
      waiterCount: 2,
      cookCount: 1,
      dishwasherCount: 1,
      waiterPerPerson: "37.50",
      cookPerPerson: "20.00",
      dishwasherPerPerson: "5.00",
    };
    const result = insertCalculationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
