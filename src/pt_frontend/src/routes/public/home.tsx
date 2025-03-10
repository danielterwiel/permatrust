import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const search = Route.useSearch();

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="container mx-auto py-4 flex justify-between items-center">
        <div className="font-bold text-xl">Permatrust QMS</div>
        <Link search={search} to="/login">
          <Button>Login</Button>
        </Link>
      </header>

      {/* Hero Section - max 1/3 of viewport height with content fit */}
      <section className="relative min-h-fit max-h-[33vh] h-auto overflow-visible flex items-center">
        <div className="container mx-auto py-8 px-4 sm:py-10 md:py-12 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Quality Management done differently
            </h1>
            <p className="mt-2 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-md">
              Streamline your quality processes with our intuitive, compliant
              and secure management system.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-4 pb-2 sm:pb-4">
              <Button className="group" size="lg">
                Get Started
                <svg
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  height="16"
                  viewBox="0 0 16 16"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Arrow right</title>
                  <path
                    d="M6.5 12.5L11 8L6.5 3.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* SVG Abstract Graph Background - hardware accelerated with transform-gpu */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-r from-background via-primary/5 to-background">
          {/* SVG abstract graph with hardware acceleration */}
          <svg 
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-75"
            height="100%"
            preserveAspectRatio="none"
            style={{ willChange: 'transform' }}
            viewBox="0 0 1440 800"
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="graph-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
                <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="wave-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.05" />
                <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="pulse-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
              </linearGradient>
              <filter height="140%" id="glow" width="140%" x="-20%" y="-20%">
                <feGaussianBlur result="blur" stdDeviation="8" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <mask id="graph-mask">
                <rect fill="white" height="100%" width="100%" />
              </mask>
            </defs>
            
            {/* Dense grid lines - horizontal */}
            <g mask="url(#graph-mask)" stroke="currentColor" strokeOpacity="0.03">
              <line x1="0" x2="1440" y1="50" y2="50" />
              <line x1="0" x2="1440" y1="100" y2="100" />
              <line x1="0" x2="1440" y1="150" y2="150" />
              <line x1="0" x2="1440" y1="200" y2="200" />
              <line x1="0" x2="1440" y1="250" y2="250" />
              <line x1="0" x2="1440" y1="300" y2="300" />
              <line x1="0" x2="1440" y1="350" y2="350" />
              <line x1="0" x2="1440" y1="400" y2="400" />
              <line x1="0" x2="1440" y1="450" y2="450" />
              <line x1="0" x2="1440" y1="500" y2="500" />
              <line x1="0" x2="1440" y1="550" y2="550" />
              <line x1="0" x2="1440" y1="600" y2="600" />
              <line x1="0" x2="1440" y1="650" y2="650" />
              <line x1="0" x2="1440" y1="700" y2="700" />
              <line x1="0" x2="1440" y1="750" y2="750" />
            </g>
            
            {/* Dense grid lines - vertical */}
            <g mask="url(#graph-mask)" stroke="currentColor" strokeOpacity="0.03">
              <line x1="80" x2="80" y1="0" y2="800" />
              <line x1="160" x2="160" y1="0" y2="800" />
              <line x1="240" x2="240" y1="0" y2="800" />
              <line x1="320" x2="320" y1="0" y2="800" />
              <line x1="400" x2="400" y1="0" y2="800" />
              <line x1="480" x2="480" y1="0" y2="800" />
              <line x1="560" x2="560" y1="0" y2="800" />
              <line x1="640" x2="640" y1="0" y2="800" />
              <line x1="720" x2="720" y1="0" y2="800" />
              <line x1="800" x2="800" y1="0" y2="800" />
              <line x1="880" x2="880" y1="0" y2="800" />
              <line x1="960" x2="960" y1="0" y2="800" />
              <line x1="1040" x2="1040" y1="0" y2="800" />
              <line x1="1120" x2="1120" y1="0" y2="800" />
              <line x1="1200" x2="1200" y1="0" y2="800" />
              <line x1="1280" x2="1280" y1="0" y2="800" />
              <line x1="1360" x2="1360" y1="0" y2="800" />
            </g>
            
            {/* Main grid lines - highlighted */}
            <g mask="url(#graph-mask)" stroke="currentColor" strokeOpacity="0.07">
              <line x1="0" x2="1440" y1="200" y2="200" />
              <line x1="0" x2="1440" y1="400" y2="400" />
              <line x1="0" x2="1440" y1="600" y2="600" />
              <line x1="320" x2="320" y1="0" y2="800" />
              <line x1="640" x2="640" y1="0" y2="800" />
              <line x1="960" x2="960" y1="0" y2="800" />
              <line x1="1280" x2="1280" y1="0" y2="800" />
            </g>
            
            {/* Wave patterns - animated with different speeds/phases */}
            <path 
              className="transform-gpu animate-wave-1"
              d="M0,500 C120,470 240,530 360,500 C480,470 600,530 720,500 C840,470 960,530 1080,500 C1200,470 1320,530 1440,500"
              fill="none"
              stroke="url(#wave-gradient)"
              strokeWidth="2"
            />
            
            <path 
              className="transform-gpu animate-wave-2"
              d="M0,300 C120,330 240,270 360,300 C480,330 600,270 720,300 C840,330 960,270 1080,300 C1200,330 1320,270 1440,300"
              fill="none"
              stroke="url(#wave-gradient)"
              strokeWidth="2"
            />
            
            <path 
              className="transform-gpu animate-wave-3"
              d="M0,600 C160,550 320,650 480,600 C640,550 800,650 960,600 C1120,550 1280,650 1440,600"
              fill="none"
              stroke="url(#wave-gradient)"
              strokeWidth="2.5"
            />
            
            {/* Additional wave patterns */}
            <path 
              className="transform-gpu animate-wave-4"
              d="M0,200 C90,220 180,180 270,200 C360,220 450,180 540,200 C630,220 720,180 810,200 C900,220 990,180 1080,200 C1170,220 1260,180 1350,200 C1440,220"
              fill="none"
              stroke="url(#wave-gradient)"
              strokeWidth="2"
            />
            
            <path 
              className="transform-gpu animate-wave-5"
              d="M0,400 C160,380 320,420 480,400 C640,380 800,420 960,400 C1120,380 1280,420 1440,400"
              fill="none"
              stroke="url(#wave-gradient)"
              strokeWidth="2"
            />
            
            {/* Path 1 - Quality trend line */}
            <path 
              className="transform-gpu animate-path-draw"
              d="M0,650 C160,620 320,480 480,510 C640,540 800,430 960,410 C1120,390 1280,450 1440,430"
              fill="none"
              filter="url(#glow)"
              stroke="url(#graph-gradient)"
              strokeWidth="3"
            />
            
            {/* Path 2 - Secondary metric line */}
            <path 
              className="transform-gpu animate-path-slide"
              d="M0,580 C160,560 320,590 480,570 C640,550 800,580 960,550 C1120,520 1280,540 1440,510"
              fill="none"
              stroke="url(#graph-gradient)" 
              strokeDasharray="5,5"
              strokeWidth="2"
            />
            
            {/* Path 3 - Additional trend line */}
            <path 
              className="transform-gpu animate-path-slide-alt"
              d="M0,350 C120,320 240,380 360,350 C480,320 600,380 720,350 C840,320 960,380 1080,350 C1200,320 1320,380 1440,350"
              fill="none"
              stroke="url(#graph-gradient)" 
              strokeDasharray="3,3"
              strokeWidth="2"
            />
            
            {/* Data points - Primary with glow effect */}
            <g className="transform-gpu animate-pulse-slow" fill="url(#pulse-gradient)" filter="url(#glow)">
              <circle cx="0" cy="650" opacity="0.7" r="4" />
              <circle cx="480" cy="510" opacity="0.8" r="5" />
              <circle cx="960" cy="410" opacity="0.8" r="5" />
              <circle cx="1440" cy="430" opacity="0.7" r="4" />
              
              <circle cx="0" cy="580" opacity="0.6" r="3" />
              <circle cx="480" cy="570" opacity="0.7" r="3" />
              <circle cx="960" cy="550" opacity="0.7" r="3" />
              <circle cx="1440" cy="510" opacity="0.6" r="3" />
            </g>
            
            {/* Wave data points */}
            <g className="transform-gpu animate-pulse-alternate" fill="var(--primary)">
              <circle cx="360" cy="500" opacity="0.5" r="2.5" />
              <circle cx="720" cy="500" opacity="0.5" r="2.5" />
              <circle cx="1080" cy="500" opacity="0.5" r="2.5" />
              
              <circle cx="240" cy="300" opacity="0.5" r="2" />
              <circle cx="480" cy="300" opacity="0.5" r="2" />
              <circle cx="720" cy="300" opacity="0.5" r="2" />
              <circle cx="960" cy="300" opacity="0.5" r="2" />
              <circle cx="1200" cy="300" opacity="0.5" r="2" />
              
              <circle cx="240" cy="200" opacity="0.4" r="1.5" />
              <circle cx="540" cy="200" opacity="0.4" r="1.5" />
              <circle cx="810" cy="200" opacity="0.4" r="1.5" />
              <circle cx="1080" cy="200" opacity="0.4" r="1.5" />
              <circle cx="1350" cy="200" opacity="0.4" r="1.5" />
              
              <circle cx="320" cy="400" opacity="0.4" r="2" />
              <circle cx="640" cy="400" opacity="0.4" r="2" />
              <circle cx="960" cy="400" opacity="0.4" r="2" />
              <circle cx="1280" cy="400" opacity="0.4" r="2" />
              
              <circle cx="160" cy="600" opacity="0.5" r="2.5" />
              <circle cx="480" cy="600" opacity="0.5" r="2.5" />
              <circle cx="800" cy="600" opacity="0.5" r="2.5" />
              <circle cx="1120" cy="600" opacity="0.5" r="2.5" />
              <circle cx="1440" cy="600" opacity="0.5" r="2.5" />
            </g>
            
            {/* Additional effect nodes with pulse animations */}
            <g className="transform-gpu" filter="url(#glow)">
              <circle className="animate-node-pulse-1" cx="480" cy="510" fill="var(--primary)" opacity="0.7" r="6" />
              <circle className="animate-node-pulse-2" cx="960" cy="410" fill="var(--primary)" opacity="0.7" r="6" />
              <circle className="animate-node-pulse-3" cx="720" cy="300" fill="var(--primary)" opacity="0.6" r="4" />
              <circle className="animate-node-pulse-2" cx="1080" cy="500" fill="var(--primary)" opacity="0.6" r="4" />
              <circle className="animate-node-pulse-3" cx="240" cy="300" fill="var(--primary)" opacity="0.6" r="4" />
            </g>
            
            {/* Mathematical-looking patterns with enhanced visibility */}
            <g fill="none" stroke="var(--primary)" strokeOpacity="0.15" strokeWidth="1.5">
              <path className="transform-gpu animate-path-fade" d="M100,350 Q150,300 200,350 T300,350" />
              <path className="transform-gpu animate-path-fade" d="M700,200 Q750,150 800,200 T900,200" />
              <path className="transform-gpu animate-path-fade" d="M1100,450 Q1150,400 1200,450 T1300,450" />
              <path className="transform-gpu animate-path-fade-delayed" d="M400,250 Q450,200 500,250 T600,250" />
              <path className="transform-gpu animate-path-fade-delayed" d="M900,400 Q950,350 1000,400 T1100,400" />
            </g>
            
            {/* Digital circuit-like pattern */}
            <g fill="none" stroke="var(--primary)" strokeLinecap="square" strokeOpacity="0.2" strokeWidth="1.5">
              <path className="transform-gpu animate-circuit-fade" d="M100,150 L180,150 L180,250 L280,250" />
              <path className="transform-gpu animate-circuit-fade" d="M500,100 L500,200 L600,200 L600,300" />
              <path className="transform-gpu animate-circuit-fade" d="M900,120 L1000,120 L1000,300 L1100,300" />
              <path className="transform-gpu animate-circuit-fade-delayed" d="M300,450 L300,550 L400,550 L400,650" />
              <path className="transform-gpu animate-circuit-fade-delayed" d="M700,500 L800,500 L800,600 L900,600" />
              <path className="transform-gpu animate-circuit-fade-delayed" d="M1200,350 L1200,450 L1300,450" />
            </g>
            
            {/* Connection nodes for circuit patterns */}
            <g className="transform-gpu" fill="var(--primary)">
              <circle className="animate-node-pulse-1" cx="180" cy="150" opacity="0.3" r="3" />
              <circle className="animate-node-pulse-2" cx="180" cy="250" opacity="0.3" r="3" />
              <circle className="animate-node-pulse-3" cx="500" cy="200" opacity="0.3" r="3" />
              <circle className="animate-node-pulse-1" cx="1000" cy="120" opacity="0.3" r="3" />
              <circle className="animate-node-pulse-2" cx="1000" cy="300" opacity="0.3" r="3" />
              <circle className="animate-node-pulse-3" cx="300" cy="550" opacity="0.3" r="3" />
              <circle className="animate-node-pulse-1" cx="800" cy="500" opacity="0.3" r="3" />
              <circle className="animate-node-pulse-2" cx="800" cy="600" opacity="0.3" r="3" />
              <circle className="animate-node-pulse-3" cx="1200" cy="450" opacity="0.3" r="3" />
            </g>
          </svg>
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-background/20" />
        </div>
      </section>

      {/* Features Section - 3 columns */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Our QMS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="group hover:shadow-md transition-all border-t-4 border-t-primary/80">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <svg
                  aria-hidden="true"
                  className="text-primary"
                  fill="none"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Compliance icon</title>
                  <path
                    d="M8 12L11 15L16 9"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <CardTitle>Compliance Assurance</CardTitle>
              <CardDescription>
                Stay compliant with industry standards and regulations
                automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our platform continuously monitors regulatory changes and
                ensures your processes remain compliant at all times.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="group p-0 h-auto" variant="ghost">
                Learn more
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Button>
            </CardFooter>
          </Card>

          {/* Feature 2 */}
          <Card className="group hover:shadow-md transition-all border-t-4 border-t-primary/80">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <svg
                  aria-hidden="true"
                  className="text-primary"
                  fill="none"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Document control icon</title>
                  <path
                    d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 12H16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 8H16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 16H12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <CardTitle>Document Control</CardTitle>
              <CardDescription>
                Centralize and manage all quality documentation effortlessly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track revisions, manage approvals, and ensure everyone has
                access to the most up-to-date documentation.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="group p-0 h-auto" variant="ghost">
                Learn more
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Button>
            </CardFooter>
          </Card>

          {/* Feature 3 */}
          <Card className="group hover:shadow-md transition-all border-t-4 border-t-primary/60">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <svg
                  aria-hidden="true"
                  className="text-primary"
                  fill="none"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Process automation icon</title>
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M19.4 15C19.1277 15.8031 19.2289 16.6718 19.68 17.4L19.75 17.51C20.1294 18.0628 20.168 18.7879 19.8514 19.377C19.5348 19.9661 18.9158 20.3421 18.25 20.39L18.12 20.4C17.3366 20.4538 16.6375 20.9106 16.3 21.6C16.057 22.1495 15.5726 22.5691 14.984 22.7451C14.3955 22.921 13.7602 22.8338 13.25 22.51L13.15 22.43C12.4388 21.9047 11.5173 21.8996 10.8 22.42L10.74 22.47C10.2266 22.8275 9.59771 22.9219 9.01363 22.7324C8.42956 22.5429 7.95648 22.0889 7.73 21.51L7.69 21.37C7.41871 20.661 6.77109 20.1464 6 20.05L5.88 20.05C5.21539 19.9788 4.65149 19.5553 4.39457 18.949C4.13766 18.3427 4.22664 17.6457 4.63 17.13L4.69 17.04C5.13298 16.3041 5.21001 15.3999 4.9 14.6L4.86 14.47C4.60512 13.8795 4.65632 13.1965 5 12.65C5.34368 12.1035 5.9436 11.764 6.6 11.75H6.75C7.55044 11.7009 8.26988 11.2159 8.6 10.49L8.64 10.37C8.91233 9.7913 9.44784 9.38343 10.07 9.28041C10.6922 9.17739 11.3295 9.39208 11.76 9.85L11.85 9.93C12.5718 10.6089 13.6646 10.6089 14.39 9.93L14.46 9.86C14.8882 9.41295 15.5158 9.20055 16.1309 9.30014C16.746 9.39973 17.2785 9.80059 17.56 10.37L17.61 10.5C17.9292 11.2188 18.641 11.7088 19.44 11.76H19.53C20.1864 11.774 20.7863 12.1135 21.13 12.66C21.4736 13.2065 21.5248 13.8895 21.27 14.48L21.23 14.6C20.9309 15.4122 21.0255 16.3144 21.49 17.05"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <CardTitle>Process Automation</CardTitle>
              <CardDescription>
                Automate workflows and eliminate manual quality processes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Reduce errors and save time with intelligent process automation
                and customizable approval workflows.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="group p-0 h-auto" variant="ghost">
                Learn more
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-muted/30">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Permatrust QMS</h3>
              <p className="text-sm text-muted-foreground">
                Simplifying quality management for modern organizations.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="/about"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="/careers"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="/contact"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="/docs"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="/blog"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="/support"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="/privacy"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="/terms"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    href="/cookies"
                  >
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Permatrust. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
