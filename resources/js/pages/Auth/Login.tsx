// resources/js/Pages/Auth/Login.tsx
import { motion } from 'framer-motion';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { Droplets, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/pages/components/ui/Button';
import toast from 'react-hot-toast';

interface Props {
    status?: string;
    canResetPassword: boolean;
    errors?: any;
}

const Login = ({ status, canResetPassword }: Props) => {
    const [showPassword, setShowPassword] = useState(false);
    const { errors: pageErrors } = usePage().props;
    const hasShownStatusToast = useRef(false); // Prevent duplicate status toasts

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        role: '',
        // remember: false,
    });

    // Show toast for status message (like password reset success) - only once
    useEffect(() => {
        if (status && !hasShownStatusToast.current) {
            hasShownStatusToast.current = true;
            toast.success(status, {
                icon: '✅',
                duration: 4000,
            });
        }
    }, [status]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Dismiss any existing toasts
        toast.dismiss();

        // Show loading toast
        const loadingToast = toast.loading('Signing in...', {});

        post('/login', {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                // Only show success toast here, not in useEffect
                toast.success('Successfully logged in! Welcome to the dashboard.', {
                    icon: '🎉',
                    duration: 3000,
                });
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);

                // Show validation errors
                if (errors.email || errors.password) {
                    toast.error(
                        'Invalid credentials. Please check your email and password.',
                        {
                            icon: '🔐',
                            duration: 4000,
                            style: {
                                border: '1px solid #f87171',
                                padding: '16px',
                                color: '#991b1b',
                                backgroundColor: '#fef2f2',
                            },
                        },
                    );
                }
            },
            onFinish: () => {
                reset('password');
            },
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
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

    return (
        <>
            <Head title="Login" />

            {/* Main container with flex centering */}
            <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
                {/* Animated Background */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    {/* Water Wave Animation */}
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
                                ],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                    </svg>

                    {/* Floating Bubbles */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-blue-400/10"
                            style={{
                                width: Math.random() * 100 + 20,
                                height: Math.random() * 100 + 20,
                                left: `${Math.random() * 100}%`,
                                bottom: `-${Math.random() * 100}px`,
                            }}
                            animate={{
                                y: [0, -1000],
                                x: [0, Math.random() * 100 - 50],
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                ease: 'linear',
                                delay: Math.random() * 5,
                            }}
                        />
                    ))}
                </div>

                {/* Back to Home Link */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-8 left-8 z-20"
                >
                    <Link
                        href="/"
                        className="group flex items-center text-gray-600 transition-colors hover:text-blue-600"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                </motion.div>

                {/* Main Content - Centered */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md px-4 py-8"
                >
                    {/* Logo */}
                    <motion.div
                        variants={itemVariants}
                        className="mb-8 text-center"
                    >
                        <Link href="/">
                            <div className="relative inline-block">
                                <div className="mx-auto flex h-20 w-20 rotate-6 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl">
                                    <Droplets className="h-10 w-10 text-white" />
                                </div>
                                <motion.div
                                    className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.3, 0.6, 0.3],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />
                            </div>
                        </Link>
                        <motion.h2
                            variants={itemVariants}
                            className="mt-6 text-3xl font-bold text-gray-900"
                        >
                            Welcome Back
                        </motion.h2>
                        <motion.p
                            variants={itemVariants}
                            className="mt-2 text-sm text-gray-600"
                        >
                            Sign in to access your CONSUMO dashboard
                        </motion.p>
                    </motion.div>

                    {/* Status Message - Hidden but kept for reference */}
                    {status && (
                        <motion.div
                            variants={itemVariants}
                            className="mb-4 hidden rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-600"
                        >
                            {status}
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <motion.form
                        variants={itemVariants}
                        onSubmit={submit}
                        className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg"
                    >
                        {/* Email Field */}
                        <div className="mb-6">
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-300 bg-white/50 py-3 pr-3 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="you@example.com"
                                    required
                                    autoFocus
                                />
                            </div>
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 text-sm text-red-600"
                                >
                                    {errors.email}
                                </motion.p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="mb-6">
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-300 bg-white/50 py-3 pr-10 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 text-sm text-red-600"
                                >
                                    {errors.password}
                                </motion.p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        {/* <div className="mb-6 flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    Remember me
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div> */}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="group relative w-full overflow-hidden"
                            disabled={processing}
                        >
                            <motion.span
                                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 transition-opacity group-hover:opacity-100"
                                animate={
                                    processing ? { x: ['-100%', '100%'] } : {}
                                }
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span className="relative">
                                {processing ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                        className="inline-block"
                                    >
                                        <Droplets className="h-5 w-5" />
                                    </motion.div>
                                ) : (
                                    'Sign In'
                                )}
                            </span>
                        </Button>


                    </motion.form>

                    {/* Footer */}
                    <motion.p
                        variants={itemVariants}
                        className="mt-8 text-center text-xs text-gray-500"
                    >
                        © {new Date().getFullYear()} CONSUMO. All rights
                        reserved.
                    </motion.p>
                </motion.div>
            </div>
        </>
    );
};

export default Login;
