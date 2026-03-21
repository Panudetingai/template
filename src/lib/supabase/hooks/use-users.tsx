'use client'

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { createClient } from "../client";

const useUsers = () => {
    const supabase = createClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        }
    });
    const user_metadata = useMemo(() => data?.user_metadata, [data]);
    return { user_metadata, isLoading, error };
}

export default useUsers;