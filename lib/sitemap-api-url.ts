type SitemapEnv = {
  NEXT_PUBLIC_API_BASE_URL?: string;
  NEXT_PUBLIC_API_URL?: string;
};

export function getSitemapApiUrl(env: SitemapEnv = process.env) {
  const configuredUrl =
    env.NEXT_PUBLIC_API_BASE_URL ||
    env.NEXT_PUBLIC_API_URL ||
    "https://api.ticketer.africa";

  return /^https?:\/\//i.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl}`;
}
