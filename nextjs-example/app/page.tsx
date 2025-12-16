import { RandomFact } from "@/components/RandomFact";
import { Badge } from "@/components/ui/badge";
import { Beaker } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-16 text-slate-100">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xNSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="outline" className="gap-1.5 border-violet-500/30 bg-violet-500/10 px-3 py-1 text-violet-300">
            <Beaker className="h-3.5 w-3.5" />
            Science Facts
          </Badge>

          <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Random Science Facts
          </h1>

          <p className="max-w-lg text-base text-slate-400">
            Discover fascinating facts about physics, biology, chemistry, astronomy, and more.
            Click the button to explore the wonders of science.
          </p>
        </div>

        <RandomFact />

        <footer className="mt-8 text-center text-xs text-slate-600">
          Built with Next.js 15 & shadcn/ui
        </footer>
      </div>
    </main>
  );
}
