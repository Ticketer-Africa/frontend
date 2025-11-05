// app/sitemap.ts

export default function sitemap() {
  const baseUrl = "https://ticketer.africa";

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
    { url: `${baseUrl}/register`, lastModified: new Date() },
    { url: `${baseUrl}/explore`, lastModified: new Date() },
    { url: `${baseUrl}/resale`, lastModified: new Date() },
  ];
}
