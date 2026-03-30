// resources/js/Pages/Consumer/Edit.tsx

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    User,
    Phone,
    MapPin,
    Home,
    Building2,
    Landmark,
    Activity,
    CreditCard,
    Ruler,
} from 'lucide-react';
import DashboardLayout from '@/Pages/Layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface Consumer {
    id?: number;
    custcode: string;
    account_number: string;
    name: string;
    mobile_number: string;
    address: string | null;
    meter_number: string;
    connection_type: 'residential' | 'commercial' | 'institutional';
    status: 'active' | 'inactive';
}

interface Props {
    consumer: Consumer;
    errors?: any;
}

export default function ConsumersEdit({ consumer, errors }: Props) {
    const [formData, setFormData] = useState({
        custcode: consumer.custcode,
        account_number: consumer.account_number,
        name: consumer.name,
        mobile_number: consumer.mobile_number,
        address: consumer.address || '',
        meter_number: consumer.meter_number,
        connection_type: consumer.connection_type,
        status: consumer.status,
    });

    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const loadingToast = toast.loading('Updating consumer...');

        router.put(`/consumers/${consumer.custcode}`, formData, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Consumer updated successfully!', {
                    icon: '🎉',
                    duration: 3000,
                });
                router.visit('/consumers');
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                console.error('Update errors:', errors);
                Object.values(errors).forEach((error: any) => {
                    toast.error(error, {
                        icon: '❌',
                        duration: 4000,
                    });
                });
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

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
        <DashboardLayout>
            <Head title={`Edit ${consumer.name}`} />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-3xl"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Link
                        href="/consumers"
                        className="mb-4 inline-flex items-center text-gray-600 transition-colors hover:text-blue-600"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Consumers
                    </Link>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Edit Consumer
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Update consumer information
                        </p>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.form
                    variants={itemVariants}
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                    {/* Customer Code */}
                    <div>
                        <label
                            htmlFor="custcode"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Customer Code *
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                id="custcode"
                                value={formData.custcode}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="00001"
                            />
                        </div>
                        {errors?.custcode && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.custcode}
                            </p>
                        )}
                    </div>

                    {/* Account Number */}
                    <div>
                        <label
                            htmlFor="account_number"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Account Number *
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                id="account_number"
                                value={formData.account_number}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="XXXX-XX-XXX"
                            />
                        </div>
                        {errors?.account_number && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.account_number}
                            </p>
                        )}
                    </div>

                    {/* Meter Number */}
                    <div>
                        <label
                            htmlFor="meter_number"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Meter Number *
                        </label>
                        <div className="relative">
                            <Ruler className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                id="meter_number"
                                value={formData.meter_number}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="MTR001"
                            />
                        </div>
                        {errors?.meter_number && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.meter_number}
                            </p>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Full Name *
                        </label>
                        <div className="relative">
                            <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                            />
                        </div>
                        {errors?.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                        <label
                            htmlFor="mobile_number"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Mobile Number *
                        </label>
                        <div className="relative">
                            <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                id="mobile_number"
                                value={formData.mobile_number}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="09171234567"
                            />
                        </div>
                        {errors?.mobile_number && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.mobile_number}
                            </p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label
                            htmlFor="address"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Address
                        </label>
                        <div className="relative">
                            <MapPin className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <textarea
                                id="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter complete address"
                            />
                        </div>
                        {errors?.address && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    {/* Connection Type */}
                    <div>
                        <label
                            htmlFor="connection_type"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Connection Type *
                        </label>
                        <div className="relative">
                            <div className="absolute top-1/2 left-3 -translate-y-1/2 transform">
                                {formData.connection_type === 'residential' && (
                                    <Home className="h-5 w-5 text-gray-400" />
                                )}
                                {formData.connection_type === 'commercial' && (
                                    <Building2 className="h-5 w-5 text-gray-400" />
                                )}
                                {formData.connection_type ===
                                    'institutional' && (
                                    <Landmark className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                            <select
                                id="connection_type"
                                value={formData.connection_type}
                                onChange={handleChange}
                                required
                                className="w-full appearance-none rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="institutional">
                                    Institutional
                                </option>
                            </select>
                        </div>
                        {errors?.connection_type && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.connection_type}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Status *
                        </label>
                        <div className="relative">
                            <Activity className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <select
                                id="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="w-full appearance-none rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        {errors?.status && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.status}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Link
                            href="/consumers"
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Updating...' : 'Update Consumer'}
                        </button>
                    </div>
                </motion.form>
            </motion.div>
        </DashboardLayout>
    );
}
