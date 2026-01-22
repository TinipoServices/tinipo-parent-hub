import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">T</span>
              </div>
              <span className="font-display font-bold text-2xl">Tinipo</span>
            </div>
            <p className="text-primary-foreground/70 leading-relaxed">
              The Platform to Enhance Kids Activities & Tracking Daily Performance. Connecting parents, mentors, and students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'About Us', 'Services', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(' ', '')}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(`#${item.toLowerCase().replace(' ', '')}`);
                    }}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('#privacy');
                  }}
                  className="text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Activities */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Activities</h4>
            <ul className="space-y-3">
              {['Dance Classes', 'Skating', 'Swimming', 'Soccer', 'Gymnastics', 'Martial Arts'].map((item) => (
                <li key={item}>
                  <span className="text-primary-foreground/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <Mail size={18} className="text-accent" />
                <span>tinipo.services@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <Phone size={18} className="text-accent" />
                <span>+918882596320</span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <MapPin size={18} className="text-accent mt-1" />
                <span>Jaipur, Rajasthan, 302017</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © {currentYear} Tinipo. All rights reserved.
          </p>
          <p className="text-primary-foreground/50 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-primary fill-primary" /> for amazing families
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
