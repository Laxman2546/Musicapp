import { useEffect, useState } from "react";

const useFetch = <T>(fetchFunction: () => Promise<T>, autofetch = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      //@ts-ignore
      setError(err instanceof Erorr ? err : new Error("An error occured"));
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
    if (autofetch) {
      fetchData();
    }
  }, []);
  return { data, loading, error, refetch: fetchData, reset };
};
export default useFetch;
