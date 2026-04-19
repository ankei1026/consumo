import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Droplet,
    CheckCircle2,
    Bot,
    Eye,
    X,
    Calendar,
    User,
    Home,
    Phone,
    MapPin,
    Clock,
    FileText,
    RefreshCw,
    XCircle,
    CheckCircle,
    AlertCircle,
    Save,
} from 'lucide-react';
import DashboardLayout from '@/Pages/Layouts/DashboardLayout';
import toast from 'react-hot-toast';

// --- Interfaces ---
interface AiResponse {
    leak_detected: boolean;
    severity: string;
    priority: string;
    summary: string;
    image_analysis: string;
    recommendation: string;
    consumption_analysis: {
        has_spike: boolean;
        spike_percentage: number;
        current_consumption: number;
        average_consumption: number;
        analysis: string;
    };
    text_consistency?: {
        matches: boolean;
        explanation: string;
    };
    trend_analysis?: any;
    analyzed_at: string;
    is_fallback?: boolean;
}

interface ReportShowProps {
    report: {
        admin_feedback?: string | null;
        id: number;
        content: string;
        image: string | null;
        created_at: string;
        updated_at: string;
        status?: string;
        status_label?: string;
        status_color?: string;
        resolved_at?: string | null;
        resolution_notes?: string | null;
        consumer: {
            name: string;
            account_number: string;
            meter_number: string;
            address?: string;
            mobile_number?: string;
        } | null;
        water_consumption: {
            consumption: number;
            formatted_consumption: string;
            billing_period: string;
            current_reading: number;
            previous_reading: number;
        } | null;
        ai_response: AiResponse | null;
    };
}

const statusConfig: Record<
    string,
    { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
    pending: {
        label: 'Pending',
        icon: Clock,
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50 border-yellow-200',
    },
    ongoing: {
        label: 'In Progress',
        icon: RefreshCw,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200',
    },
    resolved: {
        label: 'Resolved',
        icon: CheckCircle,
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200',
    },
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

export default function ReportShow({ report }: ReportShowProps) {
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState(report.status || 'pending');
    const [resolutionNotes, setResolutionNotes] = useState(report.resolution_notes || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(report.status || 'pending');
    const [adminFeedback, setAdminFeedback] = useState(report.admin_feedback ?? '');
    const [isSendingFeedback, setIsSendingFeedback] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    const openModal = (image: string) => {
        setModalImage(image);
    };

    const closeModal = () => {
        setModalImage(null);
    };

    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDateShort = (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Handle admin feedback submit
    const handleSendFeedback = () => {
        setIsSendingFeedback(true);
        router.put(
            `/reports/${report.id}/status`,
            { admin_feedback: adminFeedback },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Admin feedback updated successfully');
                    setIsSendingFeedback(false);
                    // Optionally reload to show updated feedback
                    router.reload({ preserveScroll: true });
                },
                onError: (errors) => {
                    console.error('Feedback error:', errors);
                    toast.error('Failed to update feedback');
                    setIsSendingFeedback(false);
                },
            },
        );
    };

    // Handle status update
    const handleUpdateStatus = () => {
        setIsUpdating(true);
        router.put(
            `/reports/${report.id}/status`,
            {
                status: selectedStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Report status updated successfully');
                    setCurrentStatus(selectedStatus);
                    router.reload({ preserveScroll: true });
                },
                onError: (errors) => {
                    console.error('Update error:', errors);
                    toast.error('Failed to update report status');
                },
                onFinish: () => {
                    setIsUpdating(false);
                },
            },
        );
    };

    // Handle delete report
    const handleDeleteReport = () => {
        if (confirm('Are you sure you want to delete this report?')) {
            setIsDeleting(true);
            router.delete(`/reports/${report.id}`, {
                onSuccess: () => {
                    toast.success('Report deleted successfully');
                    router.visit('/reports');
                },
                onError: () => {
                    toast.error('Failed to delete report');
                    setIsDeleting(false);
                },
            });
        }
    };

    // Handle retry analysis
    const handleRetryAnalysis = () => {
        setIsRetrying(true);
        router.post(
            `/reports/${report.id}/retry-analysis`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('AI analysis retriggered successfully!');
                    setTimeout(() => {
                        router.reload({ preserveScroll: true });
                    }, 1500);
                },
                onError: (errors) => {
                    console.error('Error retrying analysis:', errors);
                    toast.error('Failed to retry analysis');
                },
                onFinish: () => {
                    setIsRetrying(false);
                },
            },
        );
    };

    // Sync with props when report changes
    useEffect(() => {
        setCurrentStatus(report.status || 'pending');
        setSelectedStatus(report.status || 'pending');
        setResolutionNotes(report.resolution_notes || '');
        setAdminFeedback(report.admin_feedback ?? '');
    }, [report]);

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Back Button and Delete Button */}
                <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-between"
                >
                    <Link
                        href="/reports"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Reports
                    </Link>
                    <button
                        onClick={handleDeleteReport}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <X className="h-4 w-4" />
                                Delete Report
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                    <div className="p-6">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Report #{report.id}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Created on {formatDate(report.created_at)}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                        statusConfig[currentStatus]?.bgColor || 'bg-gray-50'
                                    } ${
                                        statusConfig[currentStatus]?.color || 'text-gray-700'
                                    }`}
                                >
                                    {statusConfig[currentStatus]?.icon &&
                                        React.createElement(statusConfig[currentStatus].icon, {
                                            className: 'h-3 w-3',
                                        })}
                                    {statusConfig[currentStatus]?.label || currentStatus.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {/* Left Column - Report Details */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                        Description
                                    </h2>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="text-gray-700">
                                            {report.content}
                                        </p>
                                    </div>
                                </div>

                                {report.water_consumption && (
                                    <div>
                                        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                            <Droplet className="h-5 w-5 text-blue-500" />
                                            Water Consumption Details
                                        </h2>
                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Consumption
                                                    </p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {
                                                            report
                                                                .water_consumption
                                                                .formatted_consumption
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Reading Period
                                                    </p>
                                                    <p className="font-semibold">
                                                        {
                                                            report
                                                                .water_consumption
                                                                .billing_period
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Current Reading
                                                    </p>
                                                    <p className="font-semibold">
                                                        {
                                                            report
                                                                .water_consumption
                                                                .current_reading
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Previous Reading
                                                    </p>
                                                    <p className="font-semibold">
                                                        {
                                                            report
                                                                .water_consumption
                                                                .previous_reading
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {report.consumer && (
                                    <div>
                                        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                            <Home className="h-5 w-5 text-blue-500" />
                                            Consumer Information
                                        </h2>
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Name
                                                    </p>
                                                    <p className="font-medium text-gray-900">
                                                        {report.consumer.name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Account Number
                                                    </p>
                                                    <p className="font-mono text-sm text-gray-900">
                                                        {
                                                            report.consumer
                                                                .account_number
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Meter Number
                                                    </p>
                                                    <p className="font-mono text-sm text-gray-900">
                                                        {
                                                            report.consumer
                                                                .meter_number
                                                        }
                                                    </p>
                                                </div>
                                                {report.consumer
                                                    .mobile_number && (
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Mobile Number
                                                        </p>
                                                        <p className="flex items-center gap-1 text-sm text-gray-900">
                                                            <Phone className="h-3 w-3" />
                                                            {
                                                                report.consumer
                                                                    .mobile_number
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                                {report.consumer.address && (
                                                    <div className="sm:col-span-2">
                                                        <p className="text-sm text-gray-500">
                                                            Address
                                                        </p>
                                                        <p className="flex items-start gap-1 text-sm text-gray-900">
                                                            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                                                            {
                                                                report.consumer
                                                                    .address
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {report.image && (
                                    <div>
                                        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                            <Eye className="h-5 w-5 text-blue-500" />
                                            Attached Image
                                        </h2>
                                        <div className="overflow-hidden rounded-lg border bg-gray-50">
                                            <img
                                                src={report.image}
                                                alt="Report"
                                                className="max-h-96 w-full cursor-pointer object-contain transition hover:opacity-90"
                                                onClick={() =>
                                                    openModal(report.image!)
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - AI Analysis & Status */}
                            <div className="space-y-6">
                                {/* Status Update Section */}
                                <div>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                        <RefreshCw className="h-5 w-5 text-blue-500" />
                                        Update Status
                                    </h2>
                                    <div className="rounded-xl border border-gray-100 bg-white p-4">
                                        <p className="mb-3 text-sm font-medium text-gray-500">
                                            Select a status
                                        </p>

                                        <div className="flex flex-wrap gap-3">
                                            {(
                                                [
                                                    'pending',
                                                    'ongoing',
                                                    'resolved',
                                                    'rejected',
                                                ] as const
                                            ).map((s) => {
                                                const cfg = statusConfig[s];
                                                const isActive =
                                                    selectedStatus === s;
                                                return (
                                                    <button
                                                        key={s}
                                                        onClick={() =>
                                                            setSelectedStatus(s)
                                                        }
                                                        disabled={isUpdating}
                                                        className={`flex items-center gap-2 rounded-xl border-[1.5px] px-4 py-2 text-sm font-medium transition-all ${
                                                            isActive
                                                                ? `${cfg.bgColor} ${cfg.color} border-current`
                                                                : 'border-transparent bg-gray-50 text-gray-500 hover:border-gray-200'
                                                        }`}
                                                    >
                                                        {React.createElement(cfg.icon, { className: 'h-4 w-4' })}
                                                        {cfg.label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 flex items-center gap-3">
                                            <button
                                                onClick={handleUpdateStatus}
                                                disabled={
                                                    isUpdating ||
                                                    selectedStatus === currentStatus
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        Update Status
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {report.resolved_at && (
                                            <p className="mt-3 text-xs text-green-600">
                                                Resolved on:{' '}
                                                {formatDate(report.resolved_at)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Bot/AI Assistant Section */}
                                <div>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                        <Bot className="h-5 w-5 text-blue-500" />
                                         Admin Feedback
                                    </h2>
                                    <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                                        {report.admin_feedback && (
                                            <div className="mb-2">
                                                <div className="text-xs text-gray-500 mb-1">Feedback</div>
                                                <div className="rounded bg-white p-2 text-gray-700 border border-gray-200">
                                                    {report.admin_feedback || 'No admin feedback yet.'}
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Admin Feedback</div>
                                            <textarea
                                                className="w-full rounded border border-gray-300 p-2 text-gray-700 focus:ring focus:ring-blue-200"
                                                rows={3}
                                                value={adminFeedback}
                                                onChange={e => setAdminFeedback(e.target.value)}
                                                placeholder="Type admin feedback or message here..."
                                            />
                                            <button
                                                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                                onClick={handleSendFeedback}
                                                disabled={isSendingFeedback}
                                            >
                                                {isSendingFeedback ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Bot className="h-4 w-4" />
                                                        Send Feedback
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Analysis Section */}
                                {report.ai_response ? (
                                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Bot className="h-6 w-6 text-blue-600" />
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    AI Analysis Results
                                                </h2>
                                                {report.ai_response.is_fallback && (
                                                    <span className="text-xs text-orange-600">
                                                        (Fallback Mode)
                                                    </span>
                                                )}
                                            </div>
                                            {report.ai_response.is_fallback && (
                                                <button
                                                    onClick={handleRetryAnalysis}
                                                    disabled={isRetrying}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {isRetrying ? (
                                                        <>
                                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                                            Retrying...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RefreshCw className="h-3 w-3" />
                                                            Retry Analysis
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="mb-2 font-semibold text-gray-700">
                                                    Summary
                                                </h3>
                                                <div className="rounded-lg bg-white p-4">
                                                    <div className="text-sm whitespace-pre-line text-gray-700">
                                                        {
                                                            report.ai_response
                                                                .summary
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            {report.ai_response
                                                .image_analysis && (
                                                <div>
                                                    <h3 className="mb-2 font-semibold text-gray-700">
                                                        Image Analysis
                                                    </h3>
                                                    <div className="rounded-lg bg-white p-4">
                                                        <p className="text-sm text-gray-700">
                                                            {
                                                                report
                                                                    .ai_response
                                                                    .image_analysis
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {report.ai_response
                                                .recommendation && (
                                                <div>
                                                    <h3 className="mb-2 font-semibold text-gray-700">
                                                        Recommendation
                                                    </h3>
                                                    <div className="rounded-lg bg-blue-100 p-4">
                                                        <p className="text-sm text-blue-800">
                                                            {
                                                                report
                                                                    .ai_response
                                                                    .recommendation
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {report.ai_response
                                                .consumption_analysis && (
                                                <div>
                                                    <h3 className="mb-2 font-semibold text-gray-700">
                                                        Consumption Analysis
                                                    </h3>
                                                    <div className="rounded-lg bg-white p-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    Has Spike
                                                                </p>
                                                                <p
                                                                    className={`text-lg font-semibold ${report.ai_response.consumption_analysis.has_spike ? 'text-red-600' : 'text-green-600'}`}
                                                                >
                                                                    {report
                                                                        .ai_response
                                                                        .consumption_analysis
                                                                        .has_spike
                                                                        ? 'Yes'
                                                                        : 'No'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    Spike
                                                                    Percentage
                                                                </p>
                                                                <p
                                                                    className={`text-lg font-semibold ${report.ai_response.consumption_analysis.spike_percentage > 0 ? 'text-red-600' : 'text-green-600'}`}
                                                                >
                                                                    {report
                                                                        .ai_response
                                                                        .consumption_analysis
                                                                        .spike_percentage ||
                                                                        0}
                                                                    %
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    Current
                                                                    Consumption
                                                                </p>
                                                                <p className="text-lg font-semibold text-gray-900">
                                                                    {report
                                                                        .ai_response
                                                                        .consumption_analysis
                                                                        .current_consumption ||
                                                                        0}{' '}
                                                                    m³
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    Average
                                                                    Consumption
                                                                </p>
                                                                <p className="text-lg font-semibold text-gray-900">
                                                                    {report
                                                                        .ai_response
                                                                        .consumption_analysis
                                                                        .average_consumption ||
                                                                        0}{' '}
                                                                    m³
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="mt-3 text-sm text-gray-600">
                                                            {
                                                                report
                                                                    .ai_response
                                                                    .consumption_analysis
                                                                    .analysis
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {report.ai_response
                                                .text_consistency && (
                                                <div>
                                                    <h3 className="mb-2 font-semibold text-gray-700">
                                                        Text Consistency
                                                    </h3>
                                                    <div className="rounded-lg bg-white p-4">
                                                        <div className="flex items-center gap-2">
                                                            {report.ai_response
                                                                .text_consistency
                                                                .matches ? (
                                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                            )}
                                                            <span className="text-sm text-gray-700">
                                                                {report
                                                                    .ai_response
                                                                    .text_consistency
                                                                    .matches
                                                                    ? 'Matches'
                                                                    : 'Does not match'}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-600">
                                                            {
                                                                report
                                                                    .ai_response
                                                                    .text_consistency
                                                                    .explanation
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="border-t border-blue-200 pt-4 text-right text-xs text-gray-500">
                                                Analyzed:{' '}
                                                {formatDateShort(
                                                    report.ai_response
                                                        .analyzed_at,
                                                )}
                                                {report.ai_response.is_fallback && (
                                                    <span className="ml-2 text-orange-500">
                                                        (Fallback Analysis)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-100 flex-col items-center justify-center rounded-lg bg-gray-50 p-8 text-center">
                                        <div className="mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
                                        <p className="text-sm text-gray-500">
                                            AI analysis is being processed...
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            This may take a few moments
                                        </p>
                                        <button
                                            onClick={handleRetryAnalysis}
                                            disabled={isRetrying}
                                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                                            {isRetrying ? 'Retrying...' : 'Retry Analysis'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Image Modal */}
            {modalImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
                    onClick={closeModal}
                >
                    <div className="relative max-h-full max-w-4xl p-4">
                        <img
                            src={modalImage}
                            alt="Full size"
                            className="max-h-[90vh] w-auto max-w-full rounded-lg object-contain"
                        />
                        <button
                            onClick={closeModal}
                            className="absolute -top-10 right-0 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
