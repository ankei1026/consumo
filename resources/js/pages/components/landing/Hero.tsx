import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Droplets, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    });

    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
    const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
            },
        },
    };

    const floatingAnimation = {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    };

    return (
        <motion.section
            ref={containerRef}
            className="relative flex min-h-screen items-center justify-center overflow-hidden"
            style={{ opacity, scale, y }}
        >
            {/* Animated Water Background */}
            <div className="absolute inset-0 -z-10">
                <svg
                    className="absolute bottom-0 w-full"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        fill="#0284c7"
                        fillOpacity="0.1"
                        d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        animate={{
                            d: [
                                'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
                                'M0,256L48,245.3C96,235,192,213,288,202.7C384,192,480,192,576,208C672,224,768,256,864,256C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
                                'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
                            ],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </svg>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"
            >
                {/* Logo/Icon */}
                <motion.div
                    variants={itemVariants}
                    className="mb-8 flex justify-center"
                    animate={floatingAnimation}
                >
                    <div className="relative">
                        <div className="flex h-24 w-24 rotate-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl">
                            <Droplets className="h-12 w-12 text-white" />
                        </div>
                        <motion.div
                            className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    variants={itemVariants}
                    className="mb-6 text-5xl font-black tracking-tight text-gray-900 md:text-7xl lg:text-8xl"
                >
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        CONSUMO
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={itemVariants}
                    className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 md:text-2xl"
                >
                    Smart Water Reporting & Consumer Engagement System
                    <br />
                    <span className="mt-2 block text-base text-gray-500 md:text-lg">
                        Powered by Multimodal Artificial Intelligence
                    </span>
                </motion.p>

                {/* Description */}
                <motion.p
                    variants={itemVariants}
                    className="mx-auto mb-12 max-w-2xl text-lg text-gray-500"
                >
                    Digitizing service reporting for Cagwait Water System with
                    AI-powered classification and real-time consumer engagement.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="mb-16 flex flex-col justify-center gap-4 sm:flex-row"
                >
                    <a
                        href="https://drive.google.com/drive/u/4/folders/1shOeduvCd3nUncGNm1SeXDwZw4DbCnTX"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                    >
                        <span>Download App</span>
                        <motion.span
                            className="ml-2 inline-block"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            →
                        </motion.span>
                    </a>
                    <Button
                        size="lg"
                        variant="secondary"
                        href="/login"
                        className="hover:text-white"
                    >
                        Login
                    </Button>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    variants={itemVariants}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
                    animate={{
                        y: [0, 10, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                </motion.div>
            </motion.div>
        </motion.section>
    );
};

export default Hero;
