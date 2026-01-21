import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cursos from "./pages/Cursos";
import Templates from "./pages/Templates";
import Comunidade from "./pages/Comunidade";
import Mentoria from "./pages/Mentoria";
import Eventos from "./pages/Eventos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/mentoria" element={<Mentoria />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
