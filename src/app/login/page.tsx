import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import LoginForm from '@/components/auth/LoginForm';
import AuthShowcaseCard from '@/components/auth/AuthShowcaseCard';

export const metadata = {
  title: 'Log In — Chill Guy',
  description:
    'Log in to Chill Guy — Access your saved neural architectures, model checkpoints, and design tokens in an unbothered space.',
};

export default function LoginPage() {
  return (
    <div className="app-frame">
      <Navbar />

      <main className="app-container">
        <section className="auth-section">
          <div className="auth-grid">
            <LoginForm />
            <AuthShowcaseCard type="login" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
