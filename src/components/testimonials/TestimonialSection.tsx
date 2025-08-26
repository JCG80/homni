import React from 'react';
import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  service: string;
  savings: string;
  rating: number;
  quote: string;
  timeframe: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Maria Andersen",
    location: "Oslo",
    service: "Varmepumpe",
    savings: "18,500 kr",
    rating: 5,
    quote: "Fantastisk service! Jeg sparte masse penger og fikk varmepumpen installert på bare en uke. Absolutt anbefalt!",
    timeframe: "årlig"
  },
  {
    name: "Kari Olsen", 
    location: "Bergen",
    service: "Refinansiering",
    savings: "42,000 kr",
    rating: 5,
    quote: "Homni hjalp meg å finne et mye bedre boliglån. Prosessen var smidig og jeg sparer tusenvis av kroner årlig.",
    timeframe: "årlig"
  },
  {
    name: "Lars Haugen",
    location: "Trondheim", 
    service: "Håndverkere",
    savings: "8,200 kr",
    rating: 5,
    quote: "Fikk tilbud fra flere kvalitetshåndverkere raskt. Valgte den beste og fikk baderommet pusset opp til en god pris.",
    timeframe: "på prosjektet"
  }
];

export const TestimonialSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Hva sier våre kunder?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Over 15,000 nordmenn har allerede spart penger gjennom Homni
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 relative">
              <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-muted-foreground mb-4 italic">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Savings Highlight */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="text-sm text-green-800 font-medium">
                  Sparte {testimonial.savings} {testimonial.timeframe}
                </div>
                <div className="text-xs text-green-600">
                  på {testimonial.service.toLowerCase()}
                </div>
              </div>
              
              {/* Attribution */}
              <div className="flex items-center justify-between">
                <div>
                  <cite className="font-medium not-italic">{testimonial.name}</cite>
                  <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {testimonial.service}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Trust Indicators */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span>4.8/5 gjennomsnitt</span>
            </div>
            <div>•</div>
            <div>15,000+ fornøyde kunder</div>
            <div>•</div>
            <div>500+ kvalitetsleverandører</div>
          </div>
        </div>
      </div>
    </section>
  );
};