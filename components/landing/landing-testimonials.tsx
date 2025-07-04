"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, Star, StarHalf } from 'lucide-react';

export function NewLandingTestimonials() {

  const testimonials = [
    {
      quote: "InterviewAI has completely transformed our hiring process. The AI-powered interviews save our team countless hours while still providing deep insights into each candidate's abilities. It's like having an expert interviewer available 24/7.",
      author: "Sarah Johnson",
      role: "Head of Talent Acquisition",
      company: "TechVision Inc.",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150",
      rating: 5
    },
    {
      quote: "The AI-powered interviews save our team countless hours while still providing deep insights into each candidate's abilities. It's like having an expert interviewer available 24/7.",
      author: "Michael Chen",
      role: "CTO",
      company: "Innovate Solutions",
      avatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150",
      rating: 5
    },
    {
      quote: "What impressed me most was how the AI could accurately assess technical skills across different programming languages. It's helped us build a more diverse engineering team.",
      author: "Priya Sharma",
      role: "Engineering Director",
      company: "DataFlow Systems",
      avatar: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150",
      rating: 4.5
    }
  ];

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-gray-50 dark:bg-gray-900/50">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
        <div className="absolute top-0 left-0 right-0 h-[20rem] bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 blur-3xl -z-10" />

      <div className="px-4 sm:px-6 md:px-8 lg:px-16 max-w-screen-2xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border-purple-200 dark:border-purple-800 rounded-full inline-block mb-4">
            Success Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground text-lg">
            Discover how InterviewAI is helping companies find the perfect candidates with AI-powered interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              data-aos-duration="800"
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-6 text-purple-500 dark:text-purple-400">
                    <Quote className="h-8 w-8 opacity-50" />
                  </div>

                  <p className="text-lg mb-6 flex-grow">"{testimonial.quote}"</p>

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <Avatar className="h-12 w-12 border-2 border-purple-100 dark:border-purple-900/50">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        {testimonial.rating % 1 !== 0 && (
                          <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Logos section */}
        <div className="mt-20" data-aos="fade-up" data-aos-delay="300">
          <p className="text-center text-sm text-muted-foreground mb-8">Trusted by innovative companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              "Microsoft", "Google", "Amazon", "Airbnb", "Spotify"
            ].map((company, i) => (
              <div
                key={i}
                className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600"
                data-aos="fade-up"
                data-aos-delay={400 + (i * 100)}
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}