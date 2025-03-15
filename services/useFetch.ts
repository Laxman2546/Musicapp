import { useEffect, useState, useRef } from "react";

const useFetch = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<Error | null>(null);

  const fetchFunctionRef = useRef(fetchFunction);

  const initialLoadRef = useRef<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunctionRef.current();

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    // Update the ref when fetchFunction changes
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    // Always fetch on initial mount
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      fetchData();
      return;
    }

    // Also fetch when dependencies change after initial loa
    fetchData();
  }, [...dependencies]); // Dependencies array includes all dependencies

  return { data, loading, error, refetch: fetchData, reset };
};

export default useFetch;
