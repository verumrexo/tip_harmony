import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { InsertCalculation } from "@shared/schema";

// Helper to map snake_case DB result to camelCase frontend model
const mapToCamel = (data: any) => ({
  id: data.id,
  totalAmount: data.total_amount,
  waiterCount: data.waiter_count,
  cookCount: data.cook_count,
  dishwasherCount: data.dishwasher_count,
  waiterPerPerson: data.waiter_per_person,
  cookPerPerson: data.cook_per_person,
  dishwasherPerPerson: data.dishwasher_per_person,
  createdAt: new Date(data.created_at),
});

export function useCalculations() {
  return useQuery({
    queryKey: ['calculations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return data.map(mapToCamel);
    },
  });
}

export function useCreateCalculation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCalculation) => {
      // Map camelCase input to snake_case for DB
      const dbData = {
        total_amount: data.totalAmount,
        waiter_count: data.waiterCount,
        cook_count: data.cookCount,
        dishwasher_count: data.dishwasherCount,
        waiter_per_person: data.waiterPerPerson,
        cook_per_person: data.cookPerPerson,
        dishwasher_per_person: data.dishwasherPerPerson,
      };

      const { data: result, error } = await supabase
        .from('calculations')
        .insert(dbData)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return mapToCamel(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculations'] });
    },
  });
}

