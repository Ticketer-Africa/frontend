export default function EventSiteUnavailable() {
  return <main style={{ minHeight: "100vh", display: "grid", placeContent: "center", textAlign: "center", padding: "2rem", color: "#171717", background: "#f8f6f2" }}>
    <h1 style={{ fontSize: "clamp(2rem,6vw,4rem)", marginBottom: ".75rem" }}>Site unavailable</h1>
    <p>This Event Site is not available right now.</p>
  </main>;
}
