import { Button } from '@/components/ui/button';
import { Play, Star, Users, Calendar, ChevronDown } from 'lucide-react';
import heroImage from '@/assets/hero-kids-activities.jpg';

const HeroSection = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-light/50 via-background to-sky-light/50" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/20 animate-float" />
      <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-secondary/30 animate-float-delayed" />
      <div className="absolute bottom-40 left-20 w-12 h-12 rounded-full bg-accent/40 animate-bounce-soft" />
      <div className="absolute top-1/3 right-10 w-8 h-8 rounded-full bg-purple/30 animate-float" />
      
      {/* Floating Sport Icons */}
      <div className="absolute top-32 right-1/4 text-4xl animate-wiggle">⚽</div>
      <div className="absolute bottom-1/4 left-1/4 text-4xl animate-float-delayed">🎭</div>
      <div className="absolute top-1/2 right-16 text-3xl animate-bounce-soft">⛸️</div>
      <div className="absolute bottom-32 right-1/3 text-3xl animate-float">🎨</div>

      <div className="container-custom relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary font-medium">
              <Star size={16} className="fill-accent text-accent" />
              {/* <span>Trusted by 10,000+ Parents</span> */}
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Nurture Your Child's{' '}
              <span className="text-gradient-primary">Passion</span>{' '}
              With Expert Mentors
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Connect with skilled mentors, track progress, and watch your children thrive in dance, skating, sports & more. All in one powerful platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="hero"
                size="xl"
                onClick={() => scrollToSection('#contact')}
                className="animate-pulse-glow"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => scrollToSection('#about')}
              >
                <Play size={20} className="mr-2" />
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {/* <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl">500+</p>
                  <p className="text-sm text-muted-foreground">Expert Mentors</p>
                </div>
              </div> */}
              {/* <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Calendar className="text-secondary" size={24} />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl">50K+</p>
                  <p className="text-sm text-muted-foreground">Classes Monthly</p>
                </div>
              </div> */}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-scale-in">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={heroImage}
                alt="Happy children doing various activities"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -left-4 top-1/4 bg-card rounded-2xl p-4 shadow-card animate-float z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <span className="text-lg">📈</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Progress Report</p>
                  <p className="text-xs text-muted-foreground">Updated daily</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 bottom-1/4 bg-card rounded-2xl p-4 shadow-card animate-float-delayed z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-lg">🔔</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Class Reminder</p>
                  <p className="text-xs text-muted-foreground">In 30 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <button
            onClick={() => scrollToSection('#about')}
            className="p-2 rounded-full bg-card shadow-soft hover:shadow-card transition-shadow"
          >
            <ChevronDown className="text-primary" size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
