import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

// Error logging utility (in production, this would send to a logging service)
const logError = (error: string, context?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(error, context);
  }
  // In production, send to logging service like Sentry, LogRocket, etc.
  // Example: Sentry.captureException(new Error(error), { extra: context });
};

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logError("404 Error: User attempted to access non-existent route", {
      pathname: location.pathname,
      search: location.search,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="max-w-md w-full text-center shadow-lg">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">404</div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600 mb-6">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Link>
            </Button>

            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            If you believe this is an error, please{" "}
            <Link to="/contact" className="text-blue-600 hover:text-blue-700 underline">
              contact our support team
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
