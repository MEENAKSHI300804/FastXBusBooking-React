import React, { useState, useMemo } from 'react';
import { PassengerLayout } from "@/components/layout/passenger-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { useSearchRoutes, getSearchRoutesQueryKey, RouteDetail } from "@workspace/api-client-react";
import { MapPin, Search, Calendar, Clock, Filter, Bus, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatTime, calculateDuration, getBusTypeDisplay } from "@/lib/formatters";
import { useTitle } from "@/hooks/use-title";

export default function SearchPage() {
  useTitle("Search Results");
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const originParam = searchParams.get('origin') || '';
  const destinationParam = searchParams.get('destination') || '';
  const todayYmd = new Date().toISOString().split('T')[0];
  const dateParam = searchParams.get('date')?.split('T')[0] || todayYmd;

  const [origin, setOrigin] = useState(originParam);
  const [destination, setDestination] = useState(destinationParam);
  const [date, setDate] = useState(dateParam);

  const [busTypeFilter, setBusTypeFilter] = useState<string[]>([]);
  
  const { data: routes, isLoading } = useSearchRoutes({
    origin: originParam,
    destination: destinationParam,
    date: dateParam
  }, {
    query: {
      enabled: !!(originParam && destinationParam && dateParam),
      queryKey: getSearchRoutesQueryKey({ origin: originParam, destination: destinationParam, date: dateParam })
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;
    const params = new URLSearchParams();
    params.set("origin", origin);
    params.set("destination", destination);
    params.set("date", date);
    setLocation(`/search?${params.toString()}`);
  };

  const toggleBusType = (type: string) => {
    setBusTypeFilter(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const filteredRoutes = useMemo(() => {
    if (!routes) return [];
    let filtered = [...routes];
    if (busTypeFilter.length > 0) {
      filtered = filtered.filter(route => route.busType && busTypeFilter.includes(route.busType));
    }
    return filtered;
  }, [routes, busTypeFilter]);

  const displayDate = new Date(dateParam).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <PassengerLayout>
      <div className="bg-primary pt-8 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-white/95 backdrop-blur">
            <CardContent className="p-2 md:p-4">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2">
                <div className="w-full md:flex-1 relative flex items-center">
                  <div className="absolute left-3 z-10 text-muted-foreground"><MapPin className="h-4 w-4" /></div>
                  <Input 
                    placeholder="Origin" 
                    className="pl-10 h-12 bg-background border-muted"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
                <div className="w-full md:flex-1 relative flex items-center">
                  <div className="absolute left-3 z-10 text-muted-foreground"><MapPin className="h-4 w-4" /></div>
                  <Input 
                    placeholder="Destination" 
                    className="pl-10 h-12 bg-background border-muted"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48 relative flex items-center">
                  <div className="absolute left-3 z-10 text-muted-foreground"><Calendar className="h-4 w-4" /></div>
                  <Input 
                    type="date"
                    className="pl-10 h-12 bg-background border-muted"
                    value={date.split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto h-12 px-6 shrink-0">
                  <Search className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Modify</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 -mt-10 relative z-10">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 font-semibold mb-4">
                  <Filter className="h-4 w-4" />
                  <h3>Filters</h3>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h4 className="font-medium text-sm mb-3">Bus Type</h4>
                  <div className="space-y-2">
                    {['seater_ac', 'seater_non_ac', 'sleeper_ac', 'sleeper_non_ac'].map(type => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                          checked={busTypeFilter.includes(type)}
                          onChange={() => toggleBusType(type)}
                        />
                        <span className="text-sm">{getBusTypeDisplay(type)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">
                {originParam} to {destinationParam}
              </h2>
              <span className="text-sm font-medium bg-muted px-3 py-1 rounded-full">{displayDate}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {filteredRoutes.length} {filteredRoutes.length === 1 ? 'bus' : 'buses'} found
            </p>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6 h-32 bg-muted/20"></CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRoutes.length > 0 ? (
              <div className="space-y-4">
                {filteredRoutes.map((route: RouteDetail) => (
                  <Card key={route.id} className="hover:border-primary/50 transition-colors shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="p-5 md:w-3/4 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{route.operatorName}</h3>
                          <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
                            <Bus className="h-3 w-3" />
                            <span>{route.busName} ({getBusTypeDisplay(route.busType || '')})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-center">
                          <div className="font-bold text-xl">{formatTime(route.departureTime)}</div>
                          <div className="text-xs text-muted-foreground">{route.origin}</div>
                        </div>
                        
                        <div className="flex-1 px-4 flex flex-col items-center">
                          <div className="text-xs text-muted-foreground mb-1">{calculateDuration(route.departureTime, route.arrivalTime)}</div>
                          <div className="w-full flex items-center">
                            <div className="h-2 w-2 rounded-full border-2 border-primary bg-background"></div>
                            <Separator className="flex-1" />
                            <div className="h-2 w-2 rounded-full border-2 border-primary bg-background"></div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-bold text-xl">{formatTime(route.arrivalTime)}</div>
                          <div className="text-xs text-muted-foreground">{route.destination}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {route.amenities?.waterBottle && <Badge variant="outline" className="text-[10px] font-normal border-primary/20 bg-primary/5">Water</Badge>}
                        {route.amenities?.chargingPoint && <Badge variant="outline" className="text-[10px] font-normal border-primary/20 bg-primary/5">Charging Point</Badge>}
                        {route.amenities?.tv && <Badge variant="outline" className="text-[10px] font-normal border-primary/20 bg-primary/5">TV</Badge>}
                        {route.amenities?.blanket && <Badge variant="outline" className="text-[10px] font-normal border-primary/20 bg-primary/5">Blanket</Badge>}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 md:w-1/4 p-5 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-border">
                      <div className="text-2xl font-extrabold text-primary mb-1">
                        {formatCurrency(route.fare)}
                      </div>
                      <div className="text-sm font-medium mb-4 text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {route.availableSeats} Seats left
                      </div>
                      <Button className="w-full font-bold" asChild>
                        <Link href={`/routes/${route.id}/seats`}>Select Seats</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No buses found</h3>
                  <p className="text-muted-foreground">Try changing your search criteria or date.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PassengerLayout>
  );
}