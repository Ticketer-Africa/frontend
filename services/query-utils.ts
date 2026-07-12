import type { QueryClient, QueryKey } from "@tanstack/react-query";

interface OptimisticContext<TCache> {
  previous: TCache | undefined;
}

/**
 * Wraps the standard React Query onMutate/onError/onSettled triangle for an
 * optimistic cache update: snapshot the current value, apply `updater`
 * immediately, roll back on error, reconcile with the server via invalidate
 * once the mutation settles either way.
 *
 * Spread the result into a useMutation() call:
 *
 *   useMutation({
 *     mutationFn: ...,
 *     ...optimisticUpdate<Thing[], Payload>(queryClient, ["things", id], (old = [], payload) => [...old, toOptimisticThing(payload)]),
 *   })
 */
export function optimisticUpdate<TCache, TVariables = unknown>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updater: (old: TCache | undefined, variables: TVariables) => TCache,
) {
  return {
    onMutate: async (
      variables: TVariables,
    ): Promise<OptimisticContext<TCache>> => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TCache>(queryKey);
      queryClient.setQueryData<TCache>(queryKey, updater(previous, variables));
      return { previous };
    },
    onError: (
      _err: unknown,
      _variables: TVariables,
      context: OptimisticContext<TCache> | undefined,
    ) => {
      if (!context) return;
      if (context.previous === undefined) {
        queryClient.removeQueries({ queryKey });
      } else {
        queryClient.setQueryData<TCache>(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}
