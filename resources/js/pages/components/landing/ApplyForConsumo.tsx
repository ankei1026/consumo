// ApplyForConsumo.tsx
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
    Droplets,
    Mail,
    User,
    Phone,
    MapPin,
    CheckCircle,
    Loader2,
    AlertCircle,
    Home,
    Building2,
    Landmark,
} from 'lucide-react';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { router } from '@inertiajs/react';

interface FormData {
    name: string;
    mobile_number: string;
    address: string;
    connection_type: string;
}

interface FormErrors {
    name?: string;
    mobile_number?: string;
    address?: string;
    connection_type?: string;
}

const ApplyForConsumo = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        mobile_number: '',
        address: '',
        connection_type: '',
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    const connectionTypes = [
        {
            value: 'residential',
            label: 'Residential',
            icon: Home,
            description: 'For households',
            rate: '₱50/m³',
        },
        {
            value: 'commercial',
            label: 'Commercial',
            icon: Building2,
            description: 'For businesses',
            rate: '₱80/m³',
        },
        {
            value: 'institutional',
            label: 'Institutional',
            icon: Landmark,
            description: 'For government/offices',
            rate: '₱65/m³',
        },
    ];

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.name.trim()) {
            errors.name = 'Full name is required';
        } else if (formData.name.length < 3) {
            errors.name = 'Name must be at least 3 characters';
        }

        if (!formData.mobile_number.trim()) {
            errors.mobile_number = 'Phone number is required';
        } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.mobile_number)) {
            errors.mobile_number = 'Please enter a valid phone number';
        }

        if (!formData.address.trim()) {
            errors.address = 'Address is required';
        }

        if (!formData.connection_type) {
            errors.connection_type = 'Please select a connection type';
        }

        setFormErrors(errors);

        // Show toast for validation errors
        if (Object.keys(errors).length > 0) {
            toast.error('Please fill in all required fields correctly', {
                icon: '⚠️',
                duration: 4000,
            });
        }

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Submitting your application...');

        // Map connection type to match the expected values in the backend
        const connectionTypeMap: Record<string, string> = {
            residential: 'residential',
            commercial: 'commercial',
            institutional: 'institutional',
        };

        const submitData = {
            name: formData.name,
            mobile_number: formData.mobile_number,
            address: formData.address,
            connection_type:
                connectionTypeMap[formData.connection_type] ||
                formData.connection_type,
        };

        // Use Inertia router to post to the endpoint
        router.post('/consumo-application', submitData, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                setIsSuccess(true);
                resetForm();
                toast.success(
                    'Application submitted successfully! Our team will review it and contact you soon.',
                    {
                        icon: '🎉',
                        duration: 5000,
                    },
                );

                // Reset success message after 5 seconds
                setTimeout(() => setIsSuccess(false), 5000);
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                console.error('Submission errors:', errors);

                // Handle different error formats
                let errorMessage =
                    'Failed to submit application. Please try again.';

                if (typeof errors === 'object') {
                    if (errors.message) {
                        errorMessage = errors.message;
                    } else if (errors.error) {
                        errorMessage = errors.error;
                    } else {
                        // Extract first error message from validation errors
                        const firstError = Object.values(errors)[0];
                        if (firstError) {
                            errorMessage = Array.isArray(firstError)
                                ? firstError[0]
                                : firstError;
                        }
                    }
                }

                setError(errorMessage);
                toast.error(errorMessage, {
                    icon: '❌',
                    duration: 4000,
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            mobile_number: '',
            address: '',
            connection_type: '',
        });
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for the field being edited
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleConnectionTypeSelect = (type: string) => {
        setFormData((prev) => ({ ...prev, connection_type: type }));
        if (formErrors.connection_type) {
            setFormErrors((prev) => ({ ...prev, connection_type: undefined }));
        }
        // Show toast when connection type is selected
        const selectedType = connectionTypes.find((t) => t.value === type);
    };

    const getConnectionTypeDetails = () => {
        const selected = connectionTypes.find(
            (t) => t.value === formData.connection_type,
        );
        return selected || connectionTypes[0];
    };

    return (
        <motion.section
            ref={sectionRef}
            id="apply"
            className="relative overflow-hidden py-24 sm:py-32"
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
        >
            {/* Background Water Effect */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-cyan-50/50" />
                <svg
                    className="absolute bottom-0 w-full"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        fill="#0284c7"
                        fillOpacity="0.05"
                        d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        animate={{
                            d: [
                                'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
                                'M0,256L48,245.3C96,235,192,213,288,202.7C384,192,480,192,576,208C672,224,768,256,864,256C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
                            ],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </svg>
            </div>

            {/* Floating Orbs */}
            <motion.div
                className="absolute top-20 right-10 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"
                animate={{
                    y: [0, -30, 0],
                    x: [0, 20, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl"
                animate={{
                    y: [0, 30, 0],
                    x: [0, -20, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* Left Column - Info Section */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <div>
                            <motion.div
                                className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Droplets className="h-5 w-5" />
                                <span className="text-sm font-semibold">
                                    Apply Now
                                </span>
                            </motion.div>

                            <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                                Join the{' '}
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Consumo
                                </span>{' '}
                                Community
                            </h2>

                            <p className="mb-6 text-lg text-gray-600">
                                Start your journey with smart water management.
                                Apply for a new connection and get real-time
                                insights about your water consumption.
                            </p>
                        </div>

                        {/* Benefits List */}
                        <div className="space-y-4">
                            {[
                                'Billing-based water consumption tracking',
                                'AI-powered multimodal leak detection',
                                'Digital billing and payments',
                                'Customer support',
                            ].map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={
                                        isInView ? { opacity: 1, x: 0 } : {}
                                    }
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-gray-700">
                                        {benefit}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        <p className="text-md mt-4 text-gray-500">
                            Once your application is submitted, our team will
                            review it and contact you.
                        </p>
                    </motion.div>

                    {/* Right Column - Form Section */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-blue-100 bg-white/80 p-8 shadow-xl backdrop-blur-sm"
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="mb-6 text-2xl font-bold text-gray-900">
                            Apply for Water Connection
                        </h3>

                        {isSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4"
                            >
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <p className="text-green-700">
                                    Application submitted successfully! We'll
                                    contact you.
                                </p>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
                            >
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <p className="text-red-700">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Full Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                                            formErrors.name
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="Juan Dela Cruz"
                                    />
                                </div>
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <input
                                        type="tel"
                                        name="mobile_number"
                                        value={formData.mobile_number}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                                            formErrors.mobile_number
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="09234726521"
                                    />
                                </div>
                                {formErrors.mobile_number && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {formErrors.mobile_number}
                                    </p>
                                )}
                            </div>

                            {/* Connection Type */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Connection Type *
                                </label>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {connectionTypes.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected =
                                            formData.connection_type ===
                                            type.value;
                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() =>
                                                    handleConnectionTypeSelect(
                                                        type.value,
                                                    )
                                                }
                                                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                                                    isSelected
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <Icon
                                                    className={`mb-2 h-8 w-8 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}
                                                />
                                                <span className="text-sm font-medium">
                                                    {type.label}
                                                </span>
                                                <span className="mt-1 text-xs text-gray-500">
                                                    {type.description}
                                                </span>
                                                <span className="mt-1 text-xs font-semibold text-blue-600">
                                                    {type.rate}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {formErrors.connection_type && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {formErrors.connection_type}
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Service Address *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className={`w-full rounded-lg border py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                                            formErrors.address
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="Enter your complete address"
                                    />
                                </div>
                                {formErrors.address && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {formErrors.address}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={isSubmitting}
                                className="group relative w-full overflow-hidden"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 inline-block h-5 w-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Apply Now
                                        <motion.span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                                            →
                                        </motion.span>
                                    </>
                                )}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};

export default ApplyForConsumo;
