import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertCalculation } from "@shared/routes";

export function useCalculations() {
  return useQuery({
    queryKey: [api.calculations.list.path],
    queryFn: async () => {
      const res = await fetch(api.calculations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.calculations.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCalculation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCalculation) => {
      const validated = api.calculations.create.input.parse(data);
      const res = await fetch(api.calculations.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.calculations.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save calculation");
      }
      return api.calculations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.calculations.list.path] });
    },
  });
}
