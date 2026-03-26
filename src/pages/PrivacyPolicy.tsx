import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, UserCheck, FileText, Bell } from 'lucide-react';
import logo from '@/assets/logo.png';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md shadow-sm py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Tinipo Logo" className="h-9 w-auto" />
            <span className="font-display font-bold text-2xl text-primary">Tinipo</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
            <Shield size={16} />
            Privacy & Security
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: January 2026
          </p>
        </div>

        {/* Key Points */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {[
            { icon: <Shield className="text-primary" size={20} />, title: 'Data Protection', desc: 'Industry-standard encryption & protocols' },
            { icon: <Lock className="text-secondary" size={20} />, title: 'Secure Auth', desc: 'Multi-factor authentication support' },
            { icon: <Eye className="text-accent" size={20} />, title: 'Privacy Controls', desc: 'You control who sees your data' },
            { icon: <UserCheck className="text-primary" size={20} />, title: 'Parental Consent', desc: 'Explicit consent for all media' },
            { icon: <FileText className="text-secondary" size={20} />, title: 'Transparency', desc: 'Clear data collection policies' },
            { icon: <Bell className="text-accent" size={20} />, title: 'Breach Notification', desc: 'Immediate incident alerts' },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">{item.icon}</div>
                <h3 className="font-display font-bold text-sm">{item.title}</h3>
              </div>
              <p className="text-muted-foreground text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Full Policy */}
        <div className="prose prose-sm max-w-none space-y-8">
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Tinipo ("we," "our," or "us"). We are committed to protecting the privacy of our users, especially parents and children. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, and address provided during registration.</li>
              <li><strong className="text-foreground">Child Information:</strong> Child's name, age, and activity preferences for enrollment purposes.</li>
              <li><strong className="text-foreground">Usage Data:</strong> App usage patterns, class schedules, and interaction data to improve our services.</li>
              <li><strong className="text-foreground">Media Content:</strong> Photos and videos taken during classes, shared only with explicit parental consent.</li>
              <li><strong className="text-foreground">Device Information:</strong> Device type, operating system, and app version for technical support.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Manage class enrollments, schedules, and notifications</li>
              <li>Generate progress reports for participants</li>
              <li>Facilitate communication between parents and mentors</li>
              <li>Send reminders, alarms, and class updates</li>
              <li>Share photos and videos of classes (with consent)</li>
              <li>Improve platform functionality and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to protecting children's privacy in accordance with applicable laws. Photos and videos of children are only shared with explicit parental consent. Parents have full control over their children's data and can request access, modification, or deletion at any time. We do not knowingly collect personal information from children under 13 without verifiable parental consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Data Sharing & Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Mentors/Instructors:</strong> Relevant participant information for class management.</li>
              <li><strong className="text-foreground">Service Providers:</strong> Third-party services that help us operate (hosting, analytics), bound by confidentiality agreements.</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including encryption in transit and at rest, secure authentication, regular security audits, and access controls. While no system is 100% secure, we strive to protect your data using best practices.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Your Rights</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data.</li>
              <li><strong className="text-foreground">Correction:</strong> Update inaccurate or incomplete data.</li>
              <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data.</li>
              <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing communications while keeping service updates.</li>
              <li><strong className="text-foreground">Data Portability:</strong> Receive your data in a structured, machine-readable format.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Cookies & Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies and similar technologies to maintain session state and improve functionality. Analytics cookies help us understand usage patterns. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy from time to time. We will notify you of any material changes via email or in-app notification. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions, data requests, or concerns, please contact us at:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-card border border-border text-sm text-muted-foreground space-y-1">
              <p><strong className="text-foreground">Email:</strong> tinipo.services@gmail.com</p>
              <p><strong className="text-foreground">Phone:</strong> +91 93516 37498</p>
              <p><strong className="text-foreground">Address:</strong> Jaipur, Rajasthan, 302017</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Tinipo. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
