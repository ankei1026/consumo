import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
    Camera,
    MessageSquare,
    Bell,
    BarChart3,
    MapPin,
    Zap,
    UserCheckIcon,
} from 'lucide-react';

const features = [
    {
        icon: MessageSquare,
        title: 'Multimodal Issue Reporting',
        description:
            'Upload photos of leakings our multimodal AI classifies them automatically for faster response.',
        color: 'from-blue-500 to-blue-500',
    },
    {
        icon: Bell,
        title: 'SMS Notifications',
        description:
            'Instant SMS update for Public Advisory alerts for faster communication with residents',
        color: 'from-blue-500 to-blue-500',
    },
    {
        icon: UserCheckIcon,
        title: 'User Friendly',
        description:
            'Intuitive interface for all users, including those with limited tech experience.',
        color: 'from-blue-500 to-blue-500',
    },
    {
        icon: Zap,
        title: 'Bridge the Gap',
        description:
            'From walking to the office to mobile application, we bring the office to your fingertips.',
        color: 'from-blue-500 to-blue-500',
    },
];

const Features = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12,
            },
        },
    };

    return (
        <section ref={ref} className="relative overflow-hidden py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <h2 className="mb-4 text-4xl font-black text-gray-900 md:text-5xl">
                        Built for{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Cagwait
                        </span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600">
                        Intelligent features designed specifically for small
                        municipal water systems
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2"
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{
                                    y: -10,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 300,
                                    },
                                }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 scale-105 rotate-1 transform rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                <div className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    {/* Icon */}
                                    <div
                                        className={`h-16 w-16 rounded-xl bg-gradient-to-r ${feature.color} mb-6 -rotate-6 transform p-4 transition-transform duration-300 group-hover:rotate-0`}
                                    >
                                        <Icon className="h-full w-full text-white" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="mb-3 text-xl font-bold text-gray-900">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="leading-relaxed text-gray-600">
                                        {feature.description}
                                    </p>

                                    {/* Hover Effect Line */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                                        initial={{ width: 0 }}
                                        whileHover={{ width: '100%' }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Research Context Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="mt-16 rounded-xl border-l-8 border-blue-600 bg-blue-50 p-6"
                >
                    <p className="text-sm leading-relaxed text-gray-700">
                        <span className="font-bold text-blue-600">
                            Research Gap Addressed:
                        </span>{' '}
                        Unlike IoT-dependent systems, CONSUMO uses multimodal AI
                        to interpret consumer-submitted text and images without
                        hardware investments—making intelligent water management
                        accessible for small municipalities like Cagwait.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
