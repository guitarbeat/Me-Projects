import { useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground animate-fade-in">
          404
        </h1>
        <p className="text-xl text-muted-foreground mb-4 animate-fade-in [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
          Oops! Page not found: {location.pathname}
        </p>
        <a
          href="/"
          className="text-primary hover:text-primary/80 underline animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
