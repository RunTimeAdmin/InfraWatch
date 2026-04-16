import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-lg mx-4 p-8 rounded-lg border border-neon-green/20 bg-card/80 backdrop-blur-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-neon-red/20 rounded-full animate-pulse" />
            <AlertCircle className="relative h-16 w-16 text-neon-red" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>

        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Page Not Found
        </h2>

        <p className="text-text-muted mb-8 leading-relaxed">
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleGoHome}
            className="bg-neon-green text-bg-primary hover:bg-neon-green/90 px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
