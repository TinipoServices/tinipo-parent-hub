import { useScrollReveal } from '@/hooks/useScrollReveal';
import { CheckCircle, Clock, Bell, Camera, TrendingUp, Users } from 'lucide-react';
import parentChildImage from '@/assets/parent-child-sports.jpg';

const AboutSection = () => {
  const { ref, isVisible } = useScrollReveal();

  const parentBenefits = [
    {
      icon: <Clock className="text-primary" size={24} />,
      title: 'Automated Reminders',
      description: 'Never miss a class with smart notifications for schedules and payments',
    },
    {
      icon: <Bell className="text-secondary" size={24} />,
      title: 'Real-time Updates',
      description: 'Instant alerts for reschedules, cancellations, and mentor changes',
    },
    {
      icon: <Camera className="text-accent" size={24} />,
      title: 'Photos & Videos',
      description: 'Stay connected with your child\'s activities through media updates',
    },
    {
      icon: <TrendingUp className="text-success" size={24} />,
      title: 'Progress Tracking',
      description: 'Visual progress reports to see your child\'s growth and achievements',
    },
  ];

  const stats = [
    { value: '70%', label: 'Time Saved', description: 'Less admin work for coaches' },
    { value: '95%', label: 'Satisfaction', description: 'Parent happiness rate' },
    { value: '40%', label: 'More Engagement', description: 'Student participation boost' },
    { value: '0', label: 'Missed Updates', description: 'Automated communication' },
  ];

  return (
    <section id="about" className="section-padding bg-gradient-to-b from-background to-muted/30">
      <div ref={ref} className="container-custom">
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary font-semibold text-sm mb-4">
            About Tinipo
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Simplifying Sports Management{' '}
            <span className="text-gradient-primary">For Families</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Tinipo transforms how sports programs operate by creating a centralized hub where parents, coaches, and students connect, communicate, and thrive together.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image Side */}
          <div className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={parentChildImage}
                alt="Parent and child celebrating sports achievement"
                className="w-full h-auto"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -z-10 -bottom-6 -left-6 w-full h-full rounded-3xl bg-primary/10" />
            <div className="absolute -z-20 -bottom-12 -left-12 w-full h-full rounded-3xl bg-secondary/10" />
          </div>

          {/* Benefits Side */}
          <div className={`space-y-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <h3 className="font-display text-2xl md:text-3xl font-bold">
              Built for Busy Parents Like You
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Juggling work, multiple activities, and staying connected with your children's progress? We understand. Tinipo eliminates the chaos of scattered schedules, missed updates, and payment confusion.
            </p>

            <div className="grid gap-4">
              {parentBenefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg">{benefit.title}</h4>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <p className="font-display text-4xl md:text-5xl font-bold text-gradient-primary">{stat.value}</p>
              <p className="font-semibold text-foreground mt-2">{stat.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Who We Serve */}
        <div className={`mt-20 text-center transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-8">Who We Serve</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="text-primary" size={32} />,
                title: 'Parents',
                description: 'Busy families juggling work, multiple activities, and the need to stay connected with their children\'s progress.',
              },
              {
                icon: <CheckCircle className="text-secondary" size={32} />,
                title: 'Coaches & Mentors',
                description: 'Dedicated instructors managing multiple classes, tracking attendance, and providing quality training.',
              },
              {
                icon: <TrendingUp className="text-accent" size={32} />,
                title: 'Students',
                description: 'Young athletes eager to learn, improve, and see their progress recognized in meaningful ways.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-8 rounded-3xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h4 className="font-display font-bold text-xl mb-3">{item.title}</h4>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
