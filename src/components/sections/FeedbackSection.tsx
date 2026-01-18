import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Star, Quote } from 'lucide-react';

const FeedbackSection = () => {
  const { ref, isVisible } = useScrollReveal();

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Mother of 2',
      content: 'Tinipo has been a game-changer for our family! I no longer stress about missed classes or forgotten schedules. The progress reports help me stay connected to my kids\' achievements.',
      rating: 5,
      avatar: '👩',
    },
    {
      name: 'Michael Chen',
      role: 'Father of 3',
      content: 'Managing three kids with different activities used to be chaos. Now everything is in one place - schedules, payments, photos. I even get to see videos of their practice sessions!',
      rating: 5,
      avatar: '👨',
    },
    {
      name: 'Priya Sharma',
      role: 'Working Mom',
      content: 'The automatic reminders have saved me so many times! As a working parent, I can\'t always keep track of everything. Tinipo does it for me.',
      rating: 5,
      avatar: '👩‍💼',
    },
    {
      name: 'David Martinez',
      role: 'Dance Coach',
      content: 'From a coach\'s perspective, Tinipo reduced my admin work by 70%. I spend more time teaching and less time managing paperwork. The parent communication is seamless.',
      rating: 5,
      avatar: '🧑‍🏫',
    },
    {
      name: 'Emily Wilson',
      role: 'Mother of twins',
      content: 'Having twins in different activities was overwhelming until we found Tinipo. The unified dashboard shows everything at a glance. Highly recommend to all parents!',
      rating: 5,
      avatar: '👩‍👧‍👦',
    },
    {
      name: 'Robert Kim',
      role: 'Single Dad',
      content: 'I was always missing important updates before Tinipo. Now I get instant notifications about schedule changes. My son\'s swimming coach can reach me easily.',
      rating: 5,
      avatar: '👨‍👦',
    },
  ];

  return (
    <section id="feedback" className="section-padding bg-gradient-to-b from-background to-muted/30">
      <div ref={ref} className="container-custom">
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-2 rounded-full bg-accent/30 text-accent-foreground font-semibold text-sm mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Loved by{' '}
            <span className="text-gradient-primary">Families Everywhere</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of happy parents who have transformed their children's activity management with Tinipo.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative p-6 rounded-3xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 text-primary/20" size={40} />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="fill-accent text-accent" size={18} />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground/80 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-display font-bold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className={`mt-16 text-center transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-card shadow-soft">
            <div className="flex -space-x-3">
              {['👨', '👩', '👨‍🦱', '👩‍🦰', '🧔'].map((emoji, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg border-2 border-card"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="fill-accent text-accent" size={16} />
                ))}
                <span className="font-bold ml-2">4.9/5</span>
              </div>
              <p className="text-sm text-muted-foreground">Based on 2,000+ reviews from happy parents</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
