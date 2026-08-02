import RouteLoader from '@/components/route-loader';

export default function Loading() {
  return (
    <div className="home-theme" style={{ backgroundColor: "var(--home-bg)" }}>
      <RouteLoader />
    </div>
  );
}
