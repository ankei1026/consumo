// Pages/WaterConsumption/Show.tsx
import { Head, Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Droplets,
    User,
    Calendar,
    Ruler,
    TrendingUp,
    MapPin,
    Building2,
    CreditCard,
    Printer,
    Download,
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
    created_at: string;
    updated_at: string;
    consumer?: {
        name: string;
        address: string;
        connection_type: string;
        mobile_number: string;
        account_number?: string;
        meter_number?: string;
    };
}

interface Props {
    waterConsumption: WaterConsumption;
}

export default function WaterConsumptionShow({ waterConsumption }: Props) {
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

    const handlePrint = () => {
        window.print();
    };

    const getConsumptionStatus = (consumption: number) => {
        if (consumption < 10) return { color: "text-green-600", bg: "bg-green-100", label: "Low", icon: "🟢" };
        if (consumption < 30) return { color: "text-yellow-600", bg: "bg-yellow-100", label: "Normal", icon: "🟡" };
        if (consumption < 50) return { color: "text-orange-600", bg: "bg-orange-100", label: "High", icon: "🟠" };
        return { color: "text-red-600", bg: "bg-red-100", label: "Critical", icon: "🔴" };
    };

    const status = getConsumptionStatus(waterConsumption.consumption);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <DashboardLayout>
            <Head title={`Water Consumption - ${waterConsumption.custcode}`} />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-4xl"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <Link
                                href="/water-consumptions"
                                className="mb-4 inline-flex items-center text-gray-600 hover:text-blue-600"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Records
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Water Consumption Details
                            </h1>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={`/water-consumptions/${waterConsumption.id}/edit`}
                                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-green-700"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="grid gap-6">
                    {/* Consumer Information Card */}
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"
                    >
                        <div className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <User className="h-8 w-8" />
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            {waterConsumption.consumer?.name || waterConsumption.custcode}
                                        </h2>
                                        <p className="text-sm opacity-90">
                                            Consumer Code: {waterConsumption.custcode}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm opacity-90">Account Number</p>
                                    <p className="font-mono text-lg font-bold">
                                        {waterConsumption.consumer?.account_number || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Consumption Summary Card */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 gap-6 md:grid-cols-3"
                    >
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Consumption</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {waterConsumption.consumption.toLocaleString()} m³
                                    </p>
                                </div>
                                <TrendingUp className="h-12 w-12 text-blue-500 opacity-50" />
                            </div>
                            <div className="mt-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${status.bg} ${status.color}`}>
                                    {status.icon} {status.label} Consumption
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Billing Period</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {formatDate(waterConsumption.start_date)} - {formatDate(waterConsumption.end_date)}
                                    </p>
                                </div>
                                <Calendar className="h-12 w-12 text-green-500 opacity-50" />
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Days in Period</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {Math.ceil(
                                            (new Date(waterConsumption.end_date).getTime() -
                                                new Date(waterConsumption.start_date).getTime()) /
                                                (1000 * 3600 * 24)
                                        )}{" "}
                                        days
                                    </p>
                                </div>
                                <Droplets className="h-12 w-12 text-cyan-500 opacity-50" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Readings Details */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 gap-6 md:grid-cols-2"
                    >
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Meter Readings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-600">Previous Reading</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {waterConsumption.previous_reading.toLocaleString()} m³
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-600">Current Reading</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {waterConsumption.current_reading.toLocaleString()} m³
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-gray-600">Difference</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {waterConsumption.consumption.toLocaleString()} m³
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Consumer Details</h3>
                            <div className="space-y-3">
                                {waterConsumption.consumer && (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="mt-1 h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Address</p>
                                                <p className="text-gray-900">{waterConsumption.consumer.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Building2 className="mt-1 h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Connection Type</p>
                                                <p className="text-gray-900 capitalize">
                                                    {waterConsumption.consumer.connection_type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="mt-1 h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Meter Number</p>
                                                <p className="font-mono text-gray-900">
                                                    {waterConsumption.consumer.meter_number || "Not assigned"}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Additional Info */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-xl bg-white p-6 shadow-sm"
                    >
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Record Information</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">Created At</p>
                                <p className="text-gray-900">
                                    {new Date(waterConsumption.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Last Updated</p>
                                <p className="text-gray-900">
                                    {new Date(waterConsumption.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex justify-end gap-3 pt-4"
                    >
                        <Link
                            href="/water-consumptions"
                            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-50"
                        >
                            Close
                        </Link>
                        <Link
                            href={`/water-consumptions/${waterConsumption.id}/edit`}
                            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
                        >
                            Edit Record
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
