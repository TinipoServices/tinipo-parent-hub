import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { z } from 'zod';

// Input validation schema
const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email is too long'),
  phone: z.string().trim().max(20, 'Phone number is too long').optional(),
  message: z.string().trim().min(1, 'Message is required').max(1000, 'Message is too long'),
});

const ContactSection = () => {
  const { ref, isVisible } = useScrollReveal();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("access_key", "5cf0711d-0006-41f2-86b9-8e364cbd9c25");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    setResult(data.success ? "Success!" : "Error");
  };
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setErrors({});
  
    // ✅ Validate form state (Zod)
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
  
    setIsSubmitting(true);
  
    // Optional UX delay
  
    // ✅ Use currentTarget (ALWAYS SAFE)
    const web3FormData = new FormData(e.currentTarget);
    web3FormData.append(
      "access_key",
      "5cf0711d-0006-41f2-86b9-8e364cbd9c25"
    );
  
    const response = await fetch(
      "https://api.web3forms.com/submit",
      {
        method: "POST",
        body: web3FormData,
      }
    );
  
    const data = await response.json();
  
    setResult(data.success ? "Success!" : "Error");
    setIsSubmitting(false);
    setIsSuccess(true);
  
    toast({
      title: "Message Sent! 🎉",
      description:
        "Thank you for reaching out. We'll get back to you within 24 hours.",
    });
  
    // ✅ Reset form safely
    e.currentTarget.reset();
  
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
      setIsSuccess(false);
    }, 3000);
  };
  

  const contactInfo = [
    {
      icon: <Mail className="text-primary" size={24} />,
      title: 'Email Us',
      value: 'tinipo.services@gmail.com',
      link: 'tinipo.services@gmail.com',
    },
    {
      icon: <Phone className="text-secondary" size={24} />,
      title: 'Call Us',
      value: '+918882596320',
      link: 'tel:+918882596320',
    },
    {
      icon: <MapPin className="text-accent" size={24} />,
      title: 'Visit Us',
      value: 'Jaipur',
      link: '#',
    },
  ];

  return (
    <section id="contact" className="section-padding bg-muted/30">
      <div ref={ref} className="container-custom">
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary font-semibold text-sm mb-4">
            Get In Touch
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to{' '}
            <span className="text-gradient-primary">Get Started?</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Have questions? Want to learn more? We'd love to hear from you. Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="bg-card rounded-3xl p-8 shadow-card">
              <h3 className="font-display text-2xl font-bold mb-6">Send Us a Message</h3>
              
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4 animate-scale-in">
                    <CheckCircle className="text-success" size={40} />
                  </div>
                  <h4 className="font-display text-xl font-bold mb-2">Message Sent!</h4>
                  <p className="text-muted-foreground">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Abhishek"
                      className={`h-12 rounded-xl ${errors.name ? 'border-destructive' : ''}`}
                    />
                    {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="abhi@gmail.com"
                      className={`h-12 rounded-xl ${errors.email ? 'border-destructive' : ''}`}
                    />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone Number (Optional)
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+912788123457"
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Your Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your needs..."
                      rows={4}
                      className={`rounded-xl resize-none ${errors.message ? 'border-destructive' : ''}`}
                    />
                    {errors.message && <p className="text-destructive text-sm mt-1">{errors.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send size={18} />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className={`space-y-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div>
              <h3 className="font-display text-2xl font-bold mb-4">Contact Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're a parent looking to enroll your child, a coach wanting to join our platform, or just curious about Tinipo - we're here to help!
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info) => (
                <a
                  key={info.title}
                  href={info.link}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-semibold">{info.title}</p>
                    <p className="text-muted-foreground">{info.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* FAQ Teaser */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <h4 className="font-display font-bold text-lg mb-2">Frequently Asked Questions</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Have more questions? Check out our FAQ section or reach out directly.
              </p>
              <div className="space-y-2">
                {[
                  'How do I enroll my child?',
                  'What activities are available?',
                  'How does progress tracking work?',
                ].map((q) => (
                  <div key={q} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
