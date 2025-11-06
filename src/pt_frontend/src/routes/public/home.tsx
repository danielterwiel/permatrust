import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, createTimer, stagger, svg } from 'animejs';

import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export const Route = createFileRoute('/')({
  component: Home,
});

interface Node {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
}

function Home() {
  const search = Route.useSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);

  const tooltipMessages = [
    'Create document',
    'Approve document',
    'Comment to revision',
  ];

  // Function to show tooltip with slide animations
  const showTooltip = useCallback((onSlideInComplete?: () => void) => {
    const tooltipElement = containerRef.current?.querySelector(
      '.user-action-tooltip',
    );

    if (!tooltipElement) return;

    // Reset position for slide in from bottom, maintaining horizontal centering
    (tooltipElement as HTMLElement).style.transform =
      'translate(-50%, -100%) translateY(40px)';

    // Slide in from bottom with fade in, preserving the horizontal centering
    animate(tooltipElement, {
      opacity: [0, 1],
      transform: [
        'translate(-50%, -100%) translateY(40px)',
        'translate(-50%, -100%) translateY(0px)',
      ],
      duration: 600,
      ease: 'outCubic',
      onComplete: () => {
        // Call the callback when slide-in is complete
        if (onSlideInComplete) {
          onSlideInComplete();
        }
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to hide tooltip with slide out animation
  const hideTooltip = useCallback(() => {
    const tooltipElement = containerRef.current?.querySelector(
      '.user-action-tooltip',
    );

    if (!tooltipElement) return;

    animate(tooltipElement, {
      opacity: [1, 0],
      transform: [
        'translate(-50%, -100%) translateY(0px)',
        'translate(-50%, -100%) translateY(-40px)',
      ],
      duration: 800,
      ease: 'inCubic',
      onComplete: () => {
        // Cycle to next message
        setCurrentTooltipIndex((prev) => (prev + 1) % tooltipMessages.length);
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate nodes: 1 user + 1 boundary + 7 internal replicas
  const nodes: Array<Node> = [
    // User node (outside the network)
    { id: 'user', x: 5, y: 50, size: 14, delay: 0 },

    // Boundary node (entry point to the subnet)
    { id: 'boundary', x: 25, y: 50, size: 16, delay: 100 },

    // Internal replica nodes (7 nodes randomly positioned)
    { id: 'replica-1', x: 45, y: 25, size: 12, delay: 200 },
    { id: 'replica-2', x: 70, y: 30, size: 12, delay: 250 },
    { id: 'replica-3', x: 85, y: 55, size: 12, delay: 300 },
    { id: 'replica-4', x: 75, y: 75, size: 12, delay: 350 },
    { id: 'replica-5', x: 50, y: 80, size: 12, delay: 400 },
    { id: 'replica-6', x: 35, y: 70, size: 12, delay: 450 },
    { id: 'replica-7', x: 40, y: 40, size: 12, delay: 500 },
  ];

  // Helper function to create connection lines and packets
  const createConnectionElements = useCallback(() => {
    const svgElement = containerRef.current?.querySelector('svg[data-network]');
    const connectionLinesGroup = svgElement?.querySelector(
      '.connection-lines-group',
    );
    const effectsGroup = svgElement?.querySelector('.effects-group');

    if (!svgElement || !connectionLinesGroup || !effectsGroup) {
      console.log('SVG element or groups not found');
      return;
    }

    console.log('Creating connection elements using anime.js approach...');

    // Clear existing connections and packets
    const elementsToRemove = svgElement.querySelectorAll(
      '.connection-line, .packet',
    );
    console.log(`Removing ${elementsToRemove.length} existing elements`);
    for (const el of elementsToRemove) {
      el.remove();
    }

    // Create connection from user to boundary using proper SVG path
    const userToBoundaryLine = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path',
    );
    userToBoundaryLine.setAttribute(
      'class',
      'connection-line user-to-boundary',
    );
    const pathData = `M ${nodes[0].x} ${nodes[0].y} L ${nodes[1].x} ${nodes[1].y}`;
    console.log('User-to-boundary path data:', pathData);
    userToBoundaryLine.setAttribute('d', pathData);
    userToBoundaryLine.setAttribute('stroke', '#f59e0b');
    userToBoundaryLine.setAttribute('stroke-width', '0.4');
    userToBoundaryLine.setAttribute('stroke-dasharray', '2,1');
    userToBoundaryLine.setAttribute('fill', 'none');
    userToBoundaryLine.setAttribute('stroke-linecap', 'round');
    connectionLinesGroup.appendChild(userToBoundaryLine);
    console.log('Created user-to-boundary path', userToBoundaryLine);

    // Create packet for user to boundary
    const userToBoundaryPacket = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    userToBoundaryPacket.setAttribute(
      'class',
      'packet user-to-boundary-packet',
    );
    userToBoundaryPacket.setAttribute('r', '1.5');
    userToBoundaryPacket.setAttribute('fill', '#f59e0b');
    userToBoundaryPacket.setAttribute('cx', nodes[0].x.toString());
    userToBoundaryPacket.setAttribute('cy', nodes[0].y.toString());
    userToBoundaryPacket.setAttribute('opacity', '0');
    userToBoundaryPacket.style.filter =
      'drop-shadow(0 0 4px rgba(245, 158, 11, 0.8))';
    effectsGroup.appendChild(userToBoundaryPacket);
    console.log('Created user-to-boundary packet');

    // Create connections from boundary to all replica nodes
    nodes.slice(2).forEach((replicaNode, index) => {
      const line = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path',
      );
      line.setAttribute(
        'class',
        `connection-line boundary-to-replica boundary-to-replica-${index}`,
      );
      const pathData = `M ${nodes[1].x} ${nodes[1].y} L ${replicaNode.x} ${replicaNode.y}`;
      console.log(`Replica ${index} path data:`, pathData);
      line.setAttribute('d', pathData);
      line.setAttribute('stroke', '#3b82f6');
      line.setAttribute('stroke-width', '0.3');
      line.setAttribute('stroke-dasharray', '1.5,0.8');
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke-linecap', 'round');
      connectionLinesGroup.appendChild(line);

      // Create packet for boundary to replica
      const packet = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle',
      );
      packet.setAttribute(
        'class',
        `packet boundary-to-replica-packet boundary-to-replica-packet-${index}`,
      );
      packet.setAttribute('r', '1.2');
      packet.setAttribute('fill', '#3b82f6');
      packet.setAttribute('cx', nodes[1].x.toString());
      packet.setAttribute('cy', nodes[1].y.toString());
      packet.setAttribute('opacity', '0');
      packet.style.filter = 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.8))';
      effectsGroup.appendChild(packet);
    });

    console.log(
      `Created ${nodes.slice(2).length} boundary-to-replica connections`,
    );

    // Initialize all lines as thin and light grey
    const allLines = svgElement.querySelectorAll('.connection-line');
    console.log(`Found ${allLines.length} connection lines to initialize`);

    for (const line of allLines) {
      const pathLength = (line as SVGPathElement).getTotalLength();
      console.log(`Line ${line.className} has length: ${pathLength}`);

      // Make lines thin and light grey consistently
      (line as SVGElement).style.strokeDashoffset = '0';
      (line as SVGElement).style.opacity = '0'; // Start completely hidden
      (line as SVGElement).style.stroke = '#d1d5db'; // Light grey (gray-300)
      (line as SVGElement).style.strokeWidth = '0.2'; // Thin lines
      (line as SVGElement).style.filter = 'none'; // No blur
    }

    console.log(
      'All lines initialized as hidden, ready to fade in after nodes appear',
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to animate packets from boundary to all replica nodes
  const animateBoundaryToReplicaPackets = useCallback(() => {
    const boundaryNode = nodes[1]; // Boundary node
    const replicaNodes = nodes.slice(2); // All replica nodes (7 nodes)

    console.log(
      `Animating ${replicaNodes.length} packets from boundary to replicas...`,
    );

    // Animate each replica packet with stagger
    replicaNodes.forEach((replicaNode, index) => {
      createTimer({
        duration: index * 40, // Stagger the packets like the original user packet
        onComplete: () => {
          console.log(`Starting packet ${index} to replica ${replicaNode.id}`);

          // Keep the connection line thin and light grey (no visual changes during packet transmission)

          // First fade in the packet at boundary position
          animate(`.boundary-replica-circle-${index}`, {
            opacity: [0, 0.8],
            duration: 800,
            ease: 'outCubic',
            onComplete: () => {
              // After fade-in completes, animate the circle to replica position
              createTimer({
                duration: 200, // Brief pause after appearing
                onComplete: () => {
                  console.log(
                    `Moving packet ${index} to replica ${replicaNode.id}`,
                  );

                  // Animate the packet from boundary to replica position
                  animate(`.boundary-replica-circle-${index}`, {
                    translateX: [`${replicaNode.x - boundaryNode.x}%`],
                    translateY: [`${replicaNode.y - boundaryNode.y}%`],
                    duration: 1000,
                    ease: 'outCubic',
                    onComplete: () => {
                      console.log(
                        `Packet ${index} reached replica ${replicaNode.id}`,
                      );

                      // Connection line remains unchanged (thin and light grey)

                      // Pulse the replica node when packet arrives
                      animate(`[data-node-id="${replicaNode.id}"]`, {
                        scale: [1, 1.2, 1],
                        duration: 350,
                        ease: 'outQuad',
                      });

                      // Fade out the packet after arrival
                      createTimer({
                        duration: 500,
                        onComplete: () => {
                          animate(`.boundary-replica-circle-${index}`, {
                            opacity: [0.8, 0],
                            duration: 400,
                            ease: 'outCubic',
                          });
                        },
                      });
                    },
                  });
                },
              });
            },
          });
        },
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!containerRef.current) return;

    // Create connection elements
    createConnectionElements();

    // Animate nodes appearing with more sophisticated easing
    animate('.subnet-node', {
      scale: [0, 1],
      opacity: [0, 1],
      delay: stagger(60, { from: 'center' }),
      duration: 800,
      ease: 'outElastic(1, 0.5)',
    });

    // Fade in connection lines after nodes have appeared
    // Calculate when last node finishes: 17 nodes * 60ms stagger + 800ms duration = ~1820ms
    createTimer({
      duration: 1820,
      onComplete: () => {
        console.log('Fading in connection lines...');
        // Fade in all connection lines
        animate('.connection-line', {
          opacity: [0, 0.6],
          duration: 1000,
          ease: 'outCubic',
          delay: stagger(50), // Subtle stagger for organic feel
        });
      },
    });

    // Animate user highlight circle after lines have faded in
    createTimer({
      duration: 2320, // 1820ms nodes + 500ms line fade delay
      onComplete: () => {
        animate('.user-highlight-circle', {
          opacity: [0, 0.8],
          duration: 1000,
          ease: 'outCubic',
          onComplete: () => {
            // Show tooltip first, then start packet animation when slide-in completes
            showTooltip(() => {
              // Packet animation starts after tooltip has slid in completely
              const userNode = nodes[0]; // User node
              const boundaryNode = nodes[1]; // Boundary node

              console.log(
                'Animating user highlight circle to boundary node...',
              );

              // Keep the connection line thin and light grey (no visual changes during packet transit)

              // Animate the highlight circle from user to boundary position
              animate('.user-highlight-circle', {
                translateX: [`${boundaryNode.x - userNode.x}%`],
                translateY: [`${boundaryNode.y - userNode.y}%`],
                duration: 1200,
                ease: 'outCubic',
                onComplete: () => {
                  console.log('User highlight circle reached boundary node');

                  // Connection line remains unchanged (thin and light grey)

                  // Activate boundary node to show packet arrival (only scale and color, no position change)
                  const boundaryNode = containerRef.current?.querySelector(
                    '[data-node-id="boundary"]',
                  );
                  if (boundaryNode) {
                    boundaryNode.setAttribute('data-already-animated', 'true');
                  }

                  animate('[data-node-id="boundary"]', {
                    scale: [1, 1.15, 1],
                    duration: 400,
                    ease: 'outQuad',
                    onComplete: () => {
                      // Hide the user highlight circle after boundary activation
                      animate('.user-highlight-circle', {
                        opacity: [0.8, 0],
                        duration: 400,
                        ease: 'outCubic',
                      });

                      // After boundary node activation, spawn packets to all replica nodes
                      createTimer({
                        duration: 300, // Brief pause after boundary activation
                        onComplete: () => {
                          animateBoundaryToReplicaPackets();

                          // Hide tooltip after the entire packet flow sequence completes
                          // Total packet flow: boundary activation (400ms) + pause (300ms) + replica packets (~1500ms)
                          createTimer({
                            duration: 2200, // Wait for replica packet animations to complete
                            onComplete: () => {
                              hideTooltip();
                            },
                          });
                        },
                      });
                    },
                  });
                },
              });
            });
          },
        });
      },
    });

    // Animate title and description with better timing
    createTimer({
      duration: 300,
      onComplete: () => {
        animate('.hero-text', {
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 1000,
          delay: stagger(150),
          ease: 'outCubic',
        });
      },
    });
  }, [
    createConnectionElements,
    animateBoundaryToReplicaPackets,
    showTooltip,
    hideTooltip,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const simulateTransaction = () => {
    console.log('Starting packet transmission simulation...');

    // Step 1: User node activation
    animate('[data-node-id="user"]', {
      scale: [1, 1.3, 1.1],
      backgroundColor: ['#fef3c7', '#f59e0b', '#fbbf24'],
      duration: 800,
      ease: 'outElastic(1, 0.6)',
    });

    // Show tooltip first, then start packet animation when slide-in completes
    showTooltip(() => {
      // Step 2: Show connection line from user to boundary and animate packet
      console.log('Animating user-to-boundary line...');
      // Keep the line thin and light grey (no visual changes during packet transmission)

      // Show and animate the packet
      const userToBoundaryPath = containerRef.current?.querySelector(
        '.user-to-boundary',
      ) as SVGPathElement;
      if (userToBoundaryPath) {
        console.log('Found user-to-boundary path, creating motion path...');
        const motionPath = svg.createMotionPath(userToBoundaryPath);

        animate('.user-to-boundary-packet', {
          opacity: [0, 1, 1, 0.8],
          scale: [0.8, 1.3, 1.1, 1.1],
          ...motionPath,
          duration: 600,
          ease: 'outCubic',
          onComplete: () => {
            console.log('User-to-boundary packet animation complete');
            // Line remains unchanged (thin and light grey)
          },
        });
      } else {
        console.log('User-to-boundary path not found!');
      }
    });

    // Step 3: Boundary node activation (skip if already animated by packet flow)
    createTimer({
      duration: 1200, // 600ms tooltip slide-in + 600ms packet animation
      onComplete: () => {
        // Only animate if boundary node hasn't been animated recently
        const boundaryNode = containerRef.current?.querySelector(
          '[data-node-id="boundary"]',
        );
        if (
          boundaryNode &&
          !boundaryNode.hasAttribute('data-already-animated')
        ) {
          animate('[data-node-id="boundary"]', {
            scale: [1, 1.15, 1],
            duration: 400,
            ease: 'outQuad',
          });
        }
      },
    });

    // Step 4: Boundary broadcasts to all replica nodes
    createTimer({
      duration: 2000, // 600ms tooltip + 600ms packet + 800ms boundary activation
      onComplete: () => {
        console.log('Starting boundary-to-replica broadcasts...');
        const replicaNodes = nodes.slice(2);

        replicaNodes.forEach((replicaNode, index) => {
          createTimer({
            duration: index * 40, // Stagger the broadcasts
            onComplete: () => {
              console.log(`Broadcasting to replica ${index}...`);
              // Keep the line thin and light grey (no visual changes during packet transmission)

              // Animate the packet along the path
              const replicaPath = containerRef.current?.querySelector(
                `.boundary-to-replica-${index}`,
              ) as SVGPathElement;
              if (replicaPath) {
                const motionPath = svg.createMotionPath(replicaPath);

                animate(`.boundary-to-replica-packet-${index}`, {
                  opacity: [0, 1, 1, 0.8],
                  scale: [0.8, 1.2, 1.0, 1.0],
                  ...motionPath,
                  duration: 700,
                  ease: 'outCubic',
                  onComplete: () => {
                    // Pulse the replica node when packet arrives
                    animate(`[data-node-id="${replicaNode.id}"]`, {
                      scale: [1, 1.2, 1],
                      duration: 350,
                      ease: 'outQuad',
                    });

                    // Connection line remains unchanged (thin and light grey)
                  },
                });
              } else {
                console.log(`Replica path ${index} not found!`);
              }
            },
          });
        });
      },
    });

    // Step 5: Final consensus confirmation wave
    createTimer({
      duration: 4700, // Adjusted for new timing: 600ms tooltip + remaining animation time
      onComplete: () => {
        console.log('Starting final consensus wave...');
        // Create ripple effect across all replica nodes
        animate('[data-node-id^="replica"]', {
          scale: [1, 1.1, 1.05, 1],
          boxShadow: [
            '0 0 0 rgba(59, 130, 246, 0)',
            '0 0 15px rgba(59, 130, 246, 0.8)',
            '0 0 20px rgba(59, 130, 246, 0.6)',
            '0 0 8px rgba(59, 130, 246, 0.3)',
          ],
          backgroundColor: ['#dbeafe', '#93c5fd', '#bfdbfe', '#e0f2fe'],
          duration: 1400,
          delay: stagger(60, { from: 'center' }),
          ease: 'outCubic',
        });

        // Hide all remaining packets and lines
        createTimer({
          duration: 800,
          onComplete: () => {
            animate('.packet', {
              opacity: 0,
              duration: 300,
            });

            // Hide tooltip after packet flow completes
            hideTooltip();
          },
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Mobile dotted background - visible only underneath animation area */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 lg:hidden"
        style={{
          backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(0,0,0,0.3) 60%, black 65%, black 95%, rgba(0,0,0,0.3) 98%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(0,0,0,0.3) 60%, black 65%, black 95%, rgba(0,0,0,0.3) 98%, transparent 100%)',
        }}
      />

      {/* Desktop dotted background - visible only underneath animation area */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 hidden lg:block"
        style={{
          backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage:
            'linear-gradient(to right, transparent 0%, transparent 45%, rgba(0,0,0,0.3) 50%, black 55%, black 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, transparent 45%, rgba(0,0,0,0.3) 50%, black 55%, black 100%)',
        }}
      />

      <header className="container mx-auto py-6 flex justify-between items-center relative z-10">
        <div className="font-bold text-2xl text-slate-800">Permatrust</div>
        <Link search={search} to="/login">
          <Button className="bg-slate-700 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            Login
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="hero-text text-5xl md:text-6xl font-bold leading-tight text-slate-800 opacity-0">
                Highly secure
                <span className="block text-4xl md:text-5xl text-blue-600 mt-2">
                  Quality Management
                </span>
              </h1>

              <p className="hero-text text-xl text-slate-600 leading-relaxed opacity-0 max-w-lg">
                Permatrust aims to be the most secure Quality Management System.
                By replicating the data across multiple nodes in independent
                datacenters, your data is
                <span className="font-semibold text-red-700">
                  {' '}
                  ransomware-resillient
                </span>{' '}
                and
                <span className="font-semibold text-blue-700">
                  {' '}
                  independent from big-tech
                </span>
                .
              </p>

              <div className="hero-text opacity-0 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={simulateTransaction}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  See Packet Flow
                  <svg
                    aria-hidden="true"
                    className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    height="16"
                    viewBox="0 0 16 16"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.5 12.5L11 8L6.5 3.5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 shadow hover:shadow-md transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* QMS Advantages */}
            <div className="hero-text opacity-0 grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon
                    name="check"
                    className="text-3xl text-blue-600"
                    size="xl"
                  />
                </div>
                <div className="text-sm text-slate-600">Data Integrity</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon
                    name="user-check-outline"
                    className="text-3xl text-red-600"
                    size="xl"
                  />
                </div>
                <div className="text-sm text-slate-600">Data Validity</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon
                    name="infinity-outline"
                    className="text-3xl text-emerald-600"
                    size="xl"
                  />
                </div>
                <div className="text-sm text-slate-600">Immutable Records</div>
              </div>
            </div>
          </div>

          {/* Right Column - Subnet Visualization */}
          <div className="relative" ref={containerRef}>
            <div className="aspect-square max-w-lg mx-auto relative">
              {/* Network visualization */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                data-network
              >
                <title>Network Connections</title>
                <defs>
                  <linearGradient
                    id="connectionGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                  </linearGradient>
                  <filter
                    id="glow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Gradients for node fills */}
                  <radialGradient id="userGradient" r="80%">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </radialGradient>
                  <radialGradient id="boundaryGradient" r="80%">
                    <stop offset="0%" stopColor="#fecaca" />
                    <stop offset="100%" stopColor="#f87171" />
                  </radialGradient>
                  <radialGradient id="replicaGradient" r="80%">
                    <stop offset="0%" stopColor="#dbeafe" />
                    <stop offset="100%" stopColor="#93c5fd" />
                  </radialGradient>
                </defs>

                {/* Group for connection lines - rendered first (behind nodes) */}
                <g className="connection-lines-group">
                  {/* Connection lines will be added here dynamically */}
                </g>

                {/* Group for nodes - rendered second (on top of lines) */}
                <g className="nodes-group">
                  {/* Render subnet nodes */}
                  {nodes.map((node) => (
                    <circle
                      key={node.id}
                      data-node-id={node.id}
                      className="subnet-node"
                      cx={node.x}
                      cy={node.y}
                      r={node.size / 8}
                      fill={
                        node.id === 'user'
                          ? 'url(#userGradient)'
                          : node.id === 'boundary'
                            ? 'url(#boundaryGradient)'
                            : 'url(#replicaGradient)'
                      }
                      stroke={
                        node.id === 'user'
                          ? '#f59e0b'
                          : node.id === 'boundary'
                            ? '#ef4444'
                            : '#3b82f6'
                      }
                      strokeWidth="0.4"
                      style={{
                        transformBox: 'fill-box',
                        transformOrigin: 'center center',
                      }}
                    />
                  ))}
                </g>

                {/* Group for effects - rendered last (on top of everything) */}
                <g className="effects-group">
                  {/* User highlight circle - appears after all nodes */}
                  <circle
                    className="user-highlight-circle"
                    cx={nodes[0].x}
                    cy={nodes[0].y}
                    r={nodes[0].size / 6.5} // Bigger than user node (14/8 = 1.75, 14/6.5 ≈ 2.15)
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="0.6"
                    opacity="0"
                    strokeDasharray="2,2"
                  />

                  {/* Boundary-to-replica highlight circles - spawn when boundary packet arrives */}
                  {nodes.slice(2).map((replicaNode, index) => (
                    <circle
                      key={replicaNode.id}
                      className={`boundary-replica-circle boundary-replica-circle-${index}`}
                      cx={nodes[1].x} // Start at boundary node position
                      cy={nodes[1].y}
                      r={nodes[1].size / 7} // Similar size to user highlight circle
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="0.6"
                      opacity="0"
                      strokeDasharray="2,2"
                    />
                  ))}
                </g>
              </svg>

              {/* User action tooltip - positioned centered above user node */}
              <div
                className="user-action-tooltip absolute pointer-events-none opacity-0"
                style={{
                  left: `${nodes[0].x}%`,
                  top: `${nodes[0].y - 3}%`,
                  zIndex: 50,
                }}
              >
                <div className="bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg">
                  <div className="tooltip-text">
                    {tooltipMessages[currentTooltipIndex]}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600" />
                  </div>
                </div>
              </div>

              {/* Network labels */}
              <div className="absolute top-2 left-2 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-yellow-200">
                  <div className="text-xs font-semibold text-yellow-700 text-center">
                    User
                  </div>
                </div>
              </div>

              <div className="absolute top-2 left-20 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-red-200">
                  <div className="text-xs font-semibold text-red-700 text-center">
                    Network orchestrator
                  </div>
                </div>
              </div>

              <div className="absolute top-2 left-64 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-red-200">
                  <div className="text-xs font-semibold text-blue-700 text-center">
                    Nodes
                  </div>
                </div>
              </div>
            </div>

            {/* Feature callouts */}
            <div className="absolute right-2 top-1/4 hidden lg:block">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-200 max-w-48">
                <div className="text-xs font-semibold text-slate-700">GDPR</div>
                <div className="text-xs text-slate-500 mt-1">
                  Optionally, all your data is stored in the EU
                </div>
              </div>
            </div>

            <div className="absolute -left-8 bottom-1/4 hidden lg:block">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-200 max-w-48">
                <div className="text-xs font-semibold text-slate-700">
                  End-to-end encryption
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  All your data is stored fully encrypted
                </div>
              </div>
            </div>

            <div className="absolute -right-8 top-2/3 hidden lg:block">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-200 max-w-48">
                <div className="text-xs font-semibold text-slate-700">
                  Data Replication
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Your data is safely stored across multiple geographic regions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
