import Link from 'next/link';

export default function CtaBanner() {
  return (
    <section className="showcase-banner">
      <div className="banner-glow" aria-hidden="true" />
      <div className="banner-content">
        <h2 className="banner-headline">Ready to Elevate Your Craft?</h2>
        <p className="banner-text">
          Join over 500,000 creators, developers, and studios worldwide who build with the Chill Guy design system.
          Get lifetime access with our limited-time 40% launch discount.
        </p>
      </div>
      <div className="banner-actions">
        <Link href="/chat" className="btn-visit-store">
          Open AI Chat Studio
        </Link>
        <Link href="/signup" className="btn-register">
          Sign Up Now
        </Link>
      </div>
    </section>
  );
}
