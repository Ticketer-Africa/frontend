import { useQuery } from "@tanstack/react-query";
import { fetchBankCodes } from "./bank";

export const useBankCodes = () => {
  return useQuery({
    queryKey: ["bankCodes"],
    queryFn: fetchBankCodes,
    staleTime: 1000 * 60 * 60,
  });
};
