import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Shield, Lock, Eye, UserCheck, FileText, Bell } from 'lucide-react';

const PrivacySection = () => {
  const { ref, isVisible } = useScrollReveal();

  const privacyPoints = [
    {
      icon: <Shield className="text-primary" size={24} />,
      title: 'Data Protection',
      description: 'Your personal information is encrypted and stored securely using industry-standard protocols.',
    },
    {
      icon: <Lock className="text-secondary" size={24} />,
      title: 'Secure Authentication',
      description: 'Multi-factor authentication and secure login to protect your account.',
    },
    {
      icon: <Eye className="text-accent" size={24} />,
      title: 'Privacy Controls',
      description: 'You control who sees your child\'s photos, videos, and progress reports.',
    },
    {
      icon: <UserCheck className="text-success" size={24} />,
      title: 'Parental Consent',
      description: 'All media sharing requires explicit parental consent before publication.',
    },
    {
      icon: <FileText className="text-purple" size={24} />,
      title: 'Data Transparency',
      description: 'Clear policies on what data we collect, how we use it, and your rights.',
    },
    {
      icon: <Bell className="text-coral-dark" size={24} />,
      title: 'Breach Notification',
      description: 'Immediate notification in the unlikely event of any security incident.',
    },
  ];

  return (
    <section id="privacy" className="section-padding bg-foreground text-primary-foreground">
      <div ref={ref} className="container-custom">
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground font-semibold text-sm mb-4">
            <Shield size={16} />
            Privacy & Security
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Your Family's Safety is Our{' '}
            <span className="text-accent">Priority</span>
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            We take privacy seriously. Here's how we protect you and your children's data.
          </p>
        </div>

        {/* Privacy Points Grid */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {privacyPoints.map((point, index) => (
            <div
              key={point.title}
              className="p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all duration-300"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-4">
                {point.icon}
              </div>
              <h4 className="font-display font-bold text-lg mb-2">{point.title}</h4>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Privacy Policy Summary */}
        <div className={`bg-primary-foreground/5 rounded-3xl p-8 md:p-12 border border-primary-foreground/10 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="font-display text-2xl font-bold mb-6">Privacy Policy Summary</h3>
          
          <div className="space-y-6 text-primary-foreground/80">
            <div>
              <h4 className="font-semibold text-primary-foreground mb-2">Information We Collect</h4>
              <p className="text-sm leading-relaxed">
                We collect only the information necessary to provide our services: contact details, children's activity preferences, and usage data to improve your experience. We never sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-primary-foreground mb-2">How We Use Your Data</h4>
              <p className="text-sm leading-relaxed">
                Your data is used to: manage class schedules and notifications, generate progress reports, facilitate communication between parents and mentors, and improve our platform's functionality.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-primary-foreground mb-2">Children's Privacy</h4>
              <p className="text-sm leading-relaxed">
                We are committed to protecting children's privacy. Photos and videos are only shared with explicit parental consent. Parents have full control over their children's data and can request deletion at any time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-primary-foreground mb-2">Your Rights</h4>
              <p className="text-sm leading-relaxed">
                You have the right to access, correct, or delete your personal information at any time. You can also opt out of marketing communications while still receiving essential service updates.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-primary-foreground/10">
            <p className="text-sm text-primary-foreground/50">
              Last updated: January 2026. For the full privacy policy or any questions, please contact us at tinipo.services@gmail.com
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;
