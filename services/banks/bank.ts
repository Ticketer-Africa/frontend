export const fetchBankCodes = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/payment/banks`);
  if (!res.ok) {
    throw new Error("Failed to fetch bank codes");
  }
  const response = await res.json();
  return response.data;
};
