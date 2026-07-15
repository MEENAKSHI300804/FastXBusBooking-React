import React from 'react';
import { PassengerLayout } from "@/components/layout/passenger-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Search, ArrowRight, ShieldCheck, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import { useTitle } from "@/hooks/use-title";

export default function HomePage() {
  useTitle("Home");
  const [, setLocation] = useLocation();
  const [origin, setOrigin] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;
    
    const params = new URLSearchParams();
    params.set("origin", origin);
    params.set("destination", destination);
    params.set("date", format(date, "yyyy-MM-dd"));
    
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <PassengerLayout>
      <div className="relative bg-primary overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl translate-x-1/3"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-20 lg:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
              The smartest way to <span className="text-accent">travel</span> intercity
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 font-medium">
              Premium buses, timely departures, and a booking experience that feels like magic.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto shadow-2xl border-0">
            <CardContent className="p-2 md:p-4">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2">
                <div className="w-full md:flex-1 relative flex items-center">
                  <div className="absolute left-4 z-10 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <Input 
                    placeholder="Leaving from" 
                    className="pl-12 h-14 bg-muted/50 border-0 focus-visible:ring-primary focus-visible:bg-background text-base"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                </div>
                
                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0 text-muted-foreground z-10 -mx-6 shadow-sm border border-background">
                  <ArrowRight className="h-4 w-4" />
                </div>
                
                <div className="w-full md:flex-1 relative flex items-center">
                  <div className="absolute left-4 z-10 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <Input 
                    placeholder="Going to" 
                    className="pl-12 h-14 bg-muted/50 border-0 focus-visible:ring-primary focus-visible:bg-background text-base md:pl-8"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>

                <div className="w-full md:w-[220px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-14 justify-start text-left font-normal border-0 bg-muted/50 text-base hover:bg-muted/80",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                        {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button type="submit" size="lg" className="w-full md:w-auto h-14 px-8 text-base shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Search className="mr-2 h-5 w-5" />
                  Search Buses
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Why book with FastX?</h2>
            <p className="text-muted-foreground">We've reimagined bus travel from the ground up to provide a reliable, comfortable experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
              <p className="text-muted-foreground leading-relaxed">Book tickets in seconds. No complex forms, no hidden fees. Just fast, secure payments.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">On-Time Departures</h3>
              <p className="text-muted-foreground leading-relaxed">Our partner operators are strictly vetted for punctuality. Your time is valuable.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Operators</h3>
              <p className="text-muted-foreground leading-relaxed">Travel with peace of mind. Every operator goes through rigorous quality checks.</p>
            </div>
          </div>
        </div>
      </div>
    </PassengerLayout>
  );
}