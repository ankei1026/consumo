import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Camera, Brain, Bell, CheckCircle } from 'lucide-react';

const steps = [
    {
        icon: Camera,
        title: '1. Report Issue',
        description:
            'Consumer submits text description and photo of water leak.',
        color: 'from-blue-500 to-blue-500',
    },
    {
        icon: Brain,
        title: '2. AI Classification',
        description:
            'Multimodal AI analyzes text and images to categorize urgency, type, and location of issue.',
        color: 'from-blue-500 to-blue-500',
    },
    {
        icon: Bell,
        title: '3. Admin Notification',
        description:
            'CWS team receives alert with all details—no manual sorting or paperwork.',
        color: 'from-blue-500 to-blue-500',
    },
    {
        icon: CheckCircle,
        title: '4. Action',
        description: 'CWS team will action and resolve the problem.',
        color: 'from-blue-500 to-blue-500',
    },
];

const HowItWorks = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const lineVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: 2,
                ease: 'easeInOut',
            },
        },
    };

    return (
        <section
            ref={ref}
            className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50 py-24"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <h2 className="mb-4 text-4xl font-black text-gray-900 md:text-5xl">
                        How It{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                            Works
                        </span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600">
                        From consumer report to resolution—intelligently
                        automated
                    </p>
                </motion.div>

                {/* Steps with Connecting Line */}
                <div className="relative">
                    {/* Desktop Connecting Line */}
                    <svg
                        className="absolute top-1/2 left-0 hidden w-full -translate-y-1/2 lg:block"
                        height="100"
                        preserveAspectRatio="none"
                    >
                        <motion.path
                            d="M 100,50 L 400,50 L 700,50 L 1000,50"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            strokeDasharray="8 8"
                            fill="none"
                            variants={lineVariants}
                            initial="hidden"
                            animate={isInView ? 'visible' : 'hidden'}
                        />
                        <defs>
                            <linearGradient
                                id="gradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                            >
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Steps Grid */}
                    <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={
                                        isInView ? { opacity: 1, y: 0 } : {}
                                    }
                                    transition={{
                                        delay: index * 0.2,
                                        duration: 0.6,
                                    }}
                                    whileHover={{ y: -10 }}
                                    className="group relative"
                                >
                                    {/* Step Number Background */}
                                    <div className="absolute -top-4 -left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-600 text-xl font-black text-white shadow-xl">
                                        {index + 1}
                                    </div>

                                    {/* Content Card */}
                                    <div className="h-full rounded-2xl border border-gray-100 bg-white p-8 shadow-xl transition-all duration-300 group-hover:shadow-2xl">
                                        <div
                                            className={`h-16 w-16 rounded-xl bg-gradient-to-r ${step.color} mb-6 -rotate-6 transform p-4 transition-transform duration-300 group-hover:rotate-0`}
                                        >
                                            <Icon className="h-full w-full text-white" />
                                        </div>

                                        <h3 className="mb-3 text-xl font-bold text-gray-900">
                                            {step.title}
                                        </h3>

                                        <p className="text-gray-600">
                                            {step.description}
                                        </p>

                                        {/* Tech Note */}
                                        {index === 1 && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                }}
                                                animate={
                                                    isInView
                                                        ? {
                                                              opacity: 1,
                                                              scale: 1,
                                                          }
                                                        : {}
                                                }
                                                transition={{
                                                    delay: 1,
                                                    duration: 0.5,
                                                }}
                                                className="mt-4 rounded-lg border border-purple-200 bg-blue-50 p-2 font-mono text-xs text-blue-600"
                                            >
                                                Multimodal AI: Text + Image
                                                Processing
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Research Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="mt-16 rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
                >
                    <p className="text-sm text-gray-700">
                        <span className="font-bold text-blue-600">
                            Why this matters:
                        </span>{' '}
                        Traditional systems require IoT hardware and manual
                        sorting. CONSUMO's AI approach works with existing
                        smartphones—no new infrastructure needed. This fills the
                        gap identified in recent LWUA studies for affordable,
                        scalable solutions in small municipalities.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default HowItWorks;
