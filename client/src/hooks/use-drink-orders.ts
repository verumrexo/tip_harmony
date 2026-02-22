import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DrinkOrderItem {
    name: string;
    category: string;
    quantity: number;
}

export function useCreateDrinkOrder() {
    return useMutation({
        mutationFn: async (items: DrinkOrderItem[]) => {
            const { data, error } = await supabase
                .from('drink_orders')
                .insert({ items: JSON.stringify(items) })
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
    });
}
