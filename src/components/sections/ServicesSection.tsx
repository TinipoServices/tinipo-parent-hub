import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Import activity images
import danceImage from '@/assets/activity-dance.jpg';
import skatingImage from '@/assets/activity-skating.jpg';
import swimmingImage from '@/assets/activity-swimming.jpg';
import soccerImage from '@/assets/activity-soccer.jpg';
import gymnasticsImage from '@/assets/activity-gymnastics.jpg';
import martialArtsImage from '@/assets/activity-martial-arts.jpg';

const ServicesSection = () => {
  const { ref, isVisible } = useScrollReveal();

  const activities = [
    {
      name: 'Dance Classes',
      image: danceImage,
      color: 'from-pink-400 to-rose-500',
      description: 'Ballet, hip-hop, contemporary & more',
    },
    {
      name: 'Skating',
      image: skatingImage,
      color: 'from-cyan-400 to-teal-500',
      description: 'Roller skating & ice skating lessons',
    },
    {
      name: 'Swimming',
      image: swimmingImage,
      color: 'from-blue-400 to-cyan-500',
      description: 'Water safety & competitive swimming',
    },
    {
      name: 'Soccer',
      image: soccerImage,
      color: 'from-green-400 to-emerald-500',
      description: 'Team sports & football training',
    },
    {
      name: 'Gymnastics',
      image: gymnasticsImage,
      color: 'from-purple-400 to-violet-500',
      description: 'Flexibility, strength & coordination',
    },
    {
      name: 'Martial Arts',
      image: martialArtsImage,
      color: 'from-red-400 to-orange-500',
      description: 'Karate, taekwondo & self-defense',
    },
  ];

  const features = [
    {
      emoji: '📝',
      title: 'Easy Enrollment',
      description: 'Enroll participants in various activities with skilled mentors in just a few taps.',
    },
    {
      emoji: '📅',
      title: 'Class Notifications',
      description: 'Get notified of day-to-day classes, never miss an important session.',
    },
    {
      emoji: '🔔',
      title: 'Smart Reminders',
      description: 'Alarms & reminders for class updates, reschedules, and cancellations.',
    },
    {
      emoji: '📸',
      title: 'Media Gallery',
      description: 'Access photos and videos of classes to stay connected with progress.',
    },
    {
      emoji: '📊',
      title: 'Progress Reports',
      description: 'Detailed progress reports for participants to help them grow more.',
    },
    {
      emoji: '💳',
      title: 'Easy Payments',
      description: 'Track dues, receive reminders, and manage payments seamlessly.',
    },
  ];

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="section-padding bg-muted/30">
      <div ref={ref} className="container-custom">
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary font-semibold text-sm mb-4">
            Our Services
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Activities for Every{' '}
            <span className="text-gradient-primary">Young Champion</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From dance to martial arts, connect your child with expert mentors across a wide range of activities.
          </p>
        </div>

        {/* Activities Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-6 mb-20 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {activities.map((activity, index) => (
            <div
              key={activity.name}
              className="group relative rounded-3xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="aspect-square relative">
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${activity.color} opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="font-display font-bold text-lg md:text-xl text-white mb-1">
                    {activity.name}
                  </h3>
                  <p className="text-white/80 text-sm hidden md:block">
                    {activity.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
            Powerful Features for Parents
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.emoji}
                </div>
                <h4 className="font-display font-bold text-lg mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className={`text-center mt-16 transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button variant="hero" size="xl" onClick={scrollToContact}>
            Get Started Today
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
