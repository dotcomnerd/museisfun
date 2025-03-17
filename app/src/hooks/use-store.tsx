import { useState, useEffect } from "react";
import { StoreApi, UseBoundStore } from "zustand";

/**
 * Hook to subscribe to a Zustand store and return some selected state c:
 *
 * @param store - zustand store
 * @param selector - selector function that extracts the desired state from the store
 * @returns selected state from the store
 *
 * @example
 * const song = useStore(useSongStore, (state) => state.song);
 */
export const useStore = <T, F>(
    store: UseBoundStore<StoreApi<T>>,
    selector: (state: T) => F,
): F => {
    const result = store(selector);
    const [data, setData] = useState<F>(result);

    useEffect(() => {
        const unsubscribe = store.subscribe((state) => {
            const newData = selector(state);
            setData(newData);
        });
        return unsubscribe;
    }, [store, selector]);

    return data;
};
