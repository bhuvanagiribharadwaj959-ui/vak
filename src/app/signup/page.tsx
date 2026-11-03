import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import SignupForm from '@/components/auth/SignupForm';
import AuthShowcaseCard from '@/components/auth/AuthShowcaseCard';

export const metadata = {
  title: 'Sign Up — Chill Guy',
  description:
    'Join Chill Guy — Create your free account and access foundational Transformer architectures, 124M GPT pretrained weights, and studio design tokens.',
};

export default function SignupPage() {
  return (
    <div className="app-frame">
      <Navbar />

      <main className="app-container">
        <section className="auth-section">
          <div className="auth-grid">
            <SignupForm />
            <AuthShowcaseCard type="signup" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
