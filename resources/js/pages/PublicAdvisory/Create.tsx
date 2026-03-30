// resources/js/Pages/PublicAdvisory/Create.tsx
import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, AlertCircle, Wrench, Info } from "lucide-react";
import DashboardLayout from "@/Pages/Layouts/DashboardLayout";
import toast from "react-hot-toast";

export default function PublicAdvisoryCreate() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "general",
    });

    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const loadingToast = toast.loading('Creating advisory...');

        router.post('/public-advisories', formData, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Advisory created successfully!');
                router.visit('/public-advisories');
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                Object.values(errors).forEach((error: any) => {
                    toast.error(error);
                });
                setProcessing(false);
            },
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'emergency':
                return <AlertCircle className="w-5 h-5" />;
            case 'maintenance':
                return <Wrench className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Create Advisory" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-3xl mx-auto"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Link
                        href="/public-advisories"
                        className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Advisories
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Advisory</h1>
                    <p className="text-gray-600">Post a public announcement for consumers</p>
                </motion.div>

                {/* Form */}
                <motion.form
                    variants={itemVariants}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6"
                >
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter advisory title"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['general', 'emergency', 'maintenance'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                                        formData.type === type
                                            ? type === 'emergency'
                                                ? 'border-red-500 bg-red-50'
                                                : type === 'maintenance'
                                                ? 'border-yellow-500 bg-yellow-50'
                                                : 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {getTypeIcon(type)}
                                    <span className="text-sm font-medium capitalize">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter detailed description..."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Link
                            href="/public-advisories"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Advisory'}
                        </button>
                    </div>
                </motion.form>
            </motion.div>
        </DashboardLayout>
    );
}
