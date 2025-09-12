export default function Head() {
  return (
    <>
      <title>Ticketer - Event Ticketing Platform</title>
      <meta
        name="description"
        content="Discover and book tickets for amazing events"
      />

      {/* Favicon Icons */}
      <link rel="icon" href="/logo.png" />
      <link rel="apple-touch-icon" href="/logo.png" />
      <link rel="icon" type="image/png" sizes="64x64" href="/logo.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />

      {/* Open Graph + Twitter Meta Tags */}
      <meta property="og:title" content="Ticketer Africa- Event Ticketing Platform" />
      <meta
        property="og:description"
        content="Discover and book tickets for amazing events"
      />
      <meta property="og:image" content="/logo.png" />
      <meta property="og:url" content="https://ticketer.com" />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="Ticketer - Event Ticketing Platform"
      />
      <meta
        name="twitter:description"
        content="Discover and book tickets for amazing events"
      />
      <meta name="twitter:image" content="/logo.png" />
    </>
  );
}
