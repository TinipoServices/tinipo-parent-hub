import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Shield, Lock, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacySection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="privacy" className="section-padding bg-foreground text-primary-foreground">
      <div ref={ref} className="container-custom">
        <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground font-semibold text-sm mb-4">
            <Shield size={16} />
            Privacy & Security
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Your Family's Safety is Our{' '}
            <span className="text-accent">Priority</span>
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-8">
            We take privacy seriously. Your personal data is encrypted, children's media requires explicit parental consent, and you have full control over your information.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: <Shield className="text-primary" size={24} />, title: 'Data Protection', desc: 'Industry-standard encryption & secure storage' },
              { icon: <Lock className="text-secondary" size={24} />, title: 'Parental Consent', desc: 'All media sharing requires your approval' },
              { icon: <Eye className="text-accent" size={24} />, title: 'Full Control', desc: 'Access, modify, or delete your data anytime' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10">
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-4 mx-auto">
                  {item.icon}
                </div>
                <h4 className="font-display font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-primary-foreground/70 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <Link
            to="/privacy-policy"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Read Full Privacy Policy
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;
