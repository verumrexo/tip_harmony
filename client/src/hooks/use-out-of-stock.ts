import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { OutOfStock } from "@shared/schema";

export function useOutOfStock() {
    return useQuery({
        queryKey: ['out_of_stock'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('out_of_stock')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);

            return data.map((item: any) => ({
                ...item,
                createdAt: item.created_at ? new Date(item.created_at) : null
            })) as OutOfStock[];
        },
    });
}

export function useCreateOutOfStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (name: string) => {
            const { data, error } = await supabase
                .from('out_of_stock')
                .insert({ name })
                .select()
                .single();

            if (error) throw new Error(error.message);

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['out_of_stock'] });
        },
    });
}

export function useDeleteOutOfStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('out_of_stock')
                .delete()
                .eq('id', id);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['out_of_stock'] });
        },
    });
}
