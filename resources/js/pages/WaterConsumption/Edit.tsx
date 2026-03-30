// Pages/WaterConsumption/Edit.tsx
import { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Save,
    Trash2,
    Droplets,
    User,
    Calendar,
    Ruler,
    TrendingUp,
    AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/Pages/Layouts/DashboardLayout";
import toast from "react-hot-toast";

interface WaterConsumption {
    id: number;
    custcode: string;
    current_reading: number;
    previous_reading: number;
    consumption: number;
    start_date: string;
    end_date: string;
    consumer?: {
        name: string;
        address: string;
        connection_type: string;
    };
}

interface Props {
    waterConsumption: WaterConsumption;
    errors?: any;
}

export default function WaterConsumptionEdit({ waterConsumption, errors }: Props) {
    const [formData, setFormData] = useState({
        custcode: waterConsumption.custcode,
        current_reading: waterConsumption.current_reading.toString(),
        previous_reading: waterConsumption.previous_reading.toString(),
        consumption: waterConsumption.consumption.toString(),
        start_date: waterConsumption.start_date,
        end_date: waterConsumption.end_date,
    });

    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Auto-calculate consumption when readings change
        const current = parseFloat(formData.current_reading);
        const previous = parseFloat(formData.previous_reading);

        if (!isNaN(current) && !isNaN(previous) && current >= previous) {
            const consumption = current - previous;
            setFormData((prev) => ({
                ...prev,
                consumption: consumption.toString(),
            }));
        } else if (!isNaN(current) && !isNaN(previous) && current < previous) {
            toast.error("Current reading cannot be less than previous reading");
        }
    }, [formData.current_reading, formData.previous_reading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const loadingToast = toast.loading("Updating water consumption record...");

        router.put(`/water-consumptions/${waterConsumption.id}`, formData, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success("Water consumption record updated successfully!", {
                    icon: "🎉",
                    duration: 3000,
                });
                router.visit("/water-consumptions");
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                Object.values(errors).forEach((error: any) => {
                    toast.error(error, {
                        icon: "❌",
                        duration: 4000,
                    });
                });
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this water consumption record?")) {
            router.delete(`/water-consumptions/${waterConsumption.id}`, {
                onSuccess: () => {
                    toast.success("Record deleted successfully");
                    router.visit("/water-consumptions");
                },
                onError: (errors) => {
                    toast.error("Failed to delete record");
                },
            });
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
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
                type: "spring",
                stiffness: 100,
                damping: 10,
            },
        },
    };

    return (
        <DashboardLayout>
            <Head title="Edit Water Consumption Record" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-3xl"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Link
                        href="/water-consumptions"
                        className="mb-4 inline-flex items-center text-gray-600 hover:text-blue-600"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Records
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Edit Water Consumption Record
                            </h1>
                            <p className="text-gray-600">
                                Update water consumption readings
                            </p>
                        </div>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </motion.div>

                {/* Consumer Info Card */}
                <motion.div variants={itemVariants} className="mb-6 rounded-lg bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                        <Droplets className="mt-1 h-5 w-5 text-blue-600" />
                        <div>
                            <p className="font-semibold text-blue-900">
                                {waterConsumption.consumer?.name || waterConsumption.custcode}
                            </p>
                            <p className="text-sm text-blue-700">Code: {waterConsumption.custcode}</p>
                            {waterConsumption.consumer && (
                                <>
                                    <p className="text-sm text-blue-700">Address: {waterConsumption.consumer.address}</p>
                                    <p className="text-sm text-blue-700">
                                        Connection Type: {waterConsumption.consumer.connection_type}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.form
                    variants={itemVariants}
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl bg-white p-6 shadow-sm"
                >
                    {/* Readings Section */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Previous Reading */}
                        <div>
                            <label htmlFor="previous_reading" className="mb-2 block text-sm font-medium text-gray-700">
                                Previous Reading (m³) *
                            </label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="number"
                                    id="previous_reading"
                                    name="previous_reading"
                                    value={formData.previous_reading}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            {errors?.previous_reading && (
                                <p className="mt-1 text-sm text-red-600">{errors.previous_reading}</p>
                            )}
                        </div>

                        {/* Current Reading */}
                        <div>
                            <label htmlFor="current_reading" className="mb-2 block text-sm font-medium text-gray-700">
                                Current Reading (m³) *
                            </label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="number"
                                    id="current_reading"
                                    name="current_reading"
                                    value={formData.current_reading}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            {errors?.current_reading && (
                                <p className="mt-1 text-sm text-red-600">{errors.current_reading}</p>
                            )}
                        </div>
                    </div>

                    {/* Consumption */}
                    <div>
                        <label htmlFor="consumption" className="mb-2 block text-sm font-medium text-gray-700">
                            Consumption (m³) *
                        </label>
                        <div className="relative">
                            <TrendingUp className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="number"
                                id="consumption"
                                name="consumption"
                                value={formData.consumption}
                                readOnly
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-gray-600"
                                placeholder="Auto-calculated"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Consumption is automatically calculated (Current - Previous)
                        </p>
                        {errors?.consumption && (
                            <p className="mt-1 text-sm text-red-600">{errors.consumption}</p>
                        )}
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="start_date" className="mb-2 block text-sm font-medium text-gray-700">
                                Start Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="date"
                                    id="start_date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {errors?.start_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="end_date" className="mb-2 block text-sm font-medium text-gray-700">
                                End Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {errors?.end_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Link
                            href="/water-consumptions"
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? "Updating..." : "Update Record"}
                        </button>
                    </div>
                </motion.form>
            </motion.div>
        </DashboardLayout>
    );
}
