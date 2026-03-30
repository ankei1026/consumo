import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '../ui/Button';
import { Droplets, ArrowRight } from 'lucide-react';

const CTASection = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
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
            },
        },
    };

    return (
        <section ref={ref} className="relative overflow-hidden py-24">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700">
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        background: [
                            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        ],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            </div>

            {/* Floating Water Drops */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-white/20"
                    initial={{
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                        scale: 0,
                    }}
                    animate={{
                        x: [null, Math.random() * 200 - 100],
                        y: [null, Math.random() * 200 - 100],
                        scale: [0, 1, 0],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 10 + i * 2,
                        repeat: Infinity,
                        delay: i * 2,
                        ease: 'linear',
                    }}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                >
                    <Droplets className="h-12 w-12" />
                </motion.div>
            ))}

            <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl md:p-16"
                >
                    {/* Icon */}
                    <motion.div
                        variants={itemVariants}
                        className="mb-8 flex justify-center"
                    >
                        <div className="flex h-20 w-20 rotate-12 items-center justify-center rounded-2xl bg-white">
                            <Droplets className="h-10 w-10 text-blue-600" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                        variants={itemVariants}
                        className="mb-6 text-center text-4xl font-black text-white md:text-5xl"
                    >
                        Ready to Transform
                        <br />
                        Water Service Management?
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        variants={itemVariants}
                        className="mx-auto mb-12 max-w-2xl text-center text-xl text-white/80"
                    >
                        Join Cagwait Water System in digitizing service
                        reporting with AI-powered intelligence—no hardware
                        investment needed.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col justify-center gap-4 sm:flex-row"
                    >
                        <Button
                            size="lg"
                            variant="primary"
                            className="group bg-white text-blue-600 hover:bg-blue-50 hover:text-white"
                            href="/report"
                        >
                            <span>Avail Now</span>
                            <motion.span
                                className="ml-2 inline-block"
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                →
                            </motion.span>
                        </Button>
                    </motion.div>

                    {/* Trust Badge */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-12 text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                            <span className="text-sm text-white/60">
                                🏛️ Developed for Municipality of Cagwait,
                                Surigao del Sur
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
