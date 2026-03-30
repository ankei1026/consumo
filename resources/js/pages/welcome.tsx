import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Hero from './components/landing/Hero';
import Features from './components/landing/Features';
import Stats from './components/landing/Stats';
import HowItWorks from './components/landing/HowItWorks';
import Testimonials from './components/landing/Testimonals'; // Note: You have a typo in filename
import CTASection from './components/landing/CTA';
import Footer from './components/landing/Footer';
import ApplyForConsumo from './components/landing/ApplyForConsumo';

function App() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 0.5, 1],
        ['#f0f9ff', '#ffffff', '#e0f2fe'],
    );

    return (
        <motion.div
            ref={containerRef}
            className="relative min-h-screen overflow-x-hidden"
            style={{ backgroundColor }}
        >
            {/* Background Pattern - FIXED SVG STRING */}
            <div className="pointer-events-none fixed inset-0">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230284c7' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                    }}
                />
            </div>

            {/* Floating Gradient Orbs */}
            <motion.div
                className="fixed top-20 -left-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            <motion.div
                className="fixed -right-20 bottom-20 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"
                animate={{
                    x: [0, -100, 0],
                    y: [0, 50, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* Main Content */}
            <main className="relative z-10">
                <Hero />
                <Features />
                <HowItWorks />
                <Footer />
            </main>
        </motion.div>
    );
}

export default App;
