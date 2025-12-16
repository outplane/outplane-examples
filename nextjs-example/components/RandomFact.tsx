"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scienceFacts, type ScienceFact } from "@/lib/facts";
import { Sparkles, RefreshCw, Atom, Microscope, FlaskConical, Star, Mountain, Calculator } from "lucide-react";

const categoryIcons: Record<ScienceFact["category"], React.ReactNode> = {
  physics: <Atom className="h-4 w-4" />,
  biology: <Microscope className="h-4 w-4" />,
  chemistry: <FlaskConical className="h-4 w-4" />,
  astronomy: <Star className="h-4 w-4" />,
  geology: <Mountain className="h-4 w-4" />,
  mathematics: <Calculator className="h-4 w-4" />,
};

const categoryColors: Record<ScienceFact["category"], string> = {
  physics: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  biology: "bg-green-500/20 text-green-300 border-green-500/30",
  chemistry: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  astronomy: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  geology: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  mathematics: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

function getRandomFact(exclude?: number): ScienceFact {
  let randomIndex: number;
  do {
    randomIndex = Math.floor(Math.random() * scienceFacts.length);
  } while (exclude !== undefined && scienceFacts[randomIndex].id === exclude);
  return scienceFacts[randomIndex];
}

export function RandomFact() {
  const [fact, setFact] = useState<ScienceFact>(() => getRandomFact());
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNewFact = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setFact(getRandomFact(fact.id));
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Card className={`w-full max-w-2xl transition-all duration-300 ${isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"}`}>
        <CardContent className="p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={`${categoryColors[fact.category]} flex items-center gap-1.5 px-3 py-1 text-xs font-medium capitalize`}
              >
                {categoryIcons[fact.category]}
                {fact.category}
              </Badge>
              <span className="text-xs text-slate-500">#{fact.id}</span>
            </div>

            <p className="text-xl leading-relaxed text-slate-100 font-light">
              {fact.fact}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleNewFact}
        size="lg"
        className="group"
        disabled={isAnimating}
      >
        {isAnimating ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
        )}
        {isAnimating ? "Loading..." : "Discover New Fact"}
      </Button>
    </div>
  );
}
