// resources/js/Pages/Report/Show.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Droplet,
    CheckCircle2,
    Bot,
    Eye,
    Copy,
    X,
    Calendar,
    User,
    Home,
    Phone,
    MapPin,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    AlertCircle,
    Clock,
    Zap,
    FileText,
    RefreshCw,
    XCircle,
    CheckCircle,
    Edit2,
    Save,
} from 'lucide-react';
import DashboardLayout from '@/pages/Layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface ReportShowProps {
    report: {
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
        ai_response: {
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
        } | null;
    };
}

const getSeverityConfig = (severity: string) => {
    const configs = {
        critical: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-200',
            icon: AlertTriangle,
        },
        high: {
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            border: 'border-orange-200',
            icon: AlertCircle,
        },
        medium: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-200',
            icon: Clock,
        },
        low: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-200',
            icon: CheckCircle2,
        },
    };
    return configs[severity as keyof typeof configs] || configs.low;
};

const getPriorityConfig = (priority: string) => {
    const configs = {
        immediate: { bg: 'bg-red-600', text: 'text-white' },
        urgent: { bg: 'bg-orange-500', text: 'text-white' },
        scheduled: { bg: 'bg-blue-500', text: 'text-white' },
        monitor: { bg: 'bg-green-500', text: 'text-white' },
    };
    return configs[priority as keyof typeof configs] || configs.monitor;
};

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
    const [selectedStatus, setSelectedStatus] = useState(
        report.status || 'pending',
    );
    const [resolutionNotes, setResolutionNotes] = useState(
        report.resolution_notes || '',
    );
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(
        report.status || 'pending',
    );

    // Sync with props when report changes
    useEffect(() => {
        setCurrentStatus(report.status || 'pending');
        setSelectedStatus(report.status || 'pending');
        setResolutionNotes(report.resolution_notes || '');
    }, [report]);

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
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const copyToClipboard = () => {
        const summary = report.ai_response?.summary || 'No summary available';
        navigator.clipboard
            .writeText(summary)
            .then(() => {
                toast.success('Summary copied to clipboard!');
            })
            .catch(() => {
                toast.error('Failed to copy summary');
            });
    };

    const openModal = (imageSrc: string) => {
        setModalImage(imageSrc);
    };

    const closeModal = () => {
        setModalImage(null);
    };

    const handleUpdateStatus = () => {
        if (selectedStatus === currentStatus && !resolutionNotes) {
            toast.info('No changes to update');
            return;
        }

        setIsUpdating(true);

        router.put(
            `/reports/${report.id}/status`,
            {
                status: selectedStatus,
                resolution_notes: resolutionNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Report status updated successfully');
                    // Force reload to get fresh data from server
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

    const severityConfig = report.ai_response
        ? getSeverityConfig(report.ai_response.severity)
        : null;
    const priorityConfig = report.ai_response
        ? getPriorityConfig(report.ai_response.priority)
        : null;
    const SeverityIcon = severityConfig?.icon || AlertCircle;
    const StatusIcon = statusConfig[currentStatus]?.icon || Clock;

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Back Button */}
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
                        onClick={copyToClipboard}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        <Copy className="h-4 w-4" />
                        Copy Summary
                    </button>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                    <div className="p-6 lg:p-8">
                        {/* Header */}
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                                    Report #{report.id}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                    <span className="inline-flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        {report.consumer?.name || 'N/A'}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(report.created_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {/* Status Badge */}
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[currentStatus]?.bgColor} ${statusConfig[currentStatus]?.color}`}
                                >
                                    <StatusIcon className="h-3 w-3" />
                                    {statusConfig[currentStatus]?.label ||
                                        currentStatus}
                                </span>

                                {report.ai_response && (
                                    <>
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${severityConfig?.bg} ${severityConfig?.text}`}
                                        >
                                            <SeverityIcon className="h-3 w-3" />
                                            {report.ai_response.severity?.toUpperCase()}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${priorityConfig?.bg} ${priorityConfig?.text}`}
                                        >
                                            <Clock className="h-3 w-3" />
                                            {report.ai_response.priority?.toUpperCase()}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                                report.ai_response.leak_detected
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {report.ai_response
                                                .leak_detected ? (
                                                <Droplet className="h-3 w-3" />
                                            ) : (
                                                <CheckCircle2 className="h-3 w-3" />
                                            )}
                                            {report.ai_response.leak_detected
                                                ? 'Leak Detected'
                                                : 'No Leak'}
                                        </span>
                                    </>
                                )}
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
                                                        className={`flex items-center gap-2 rounded-xl border-[1.5px] px-4 py-2.5 text-sm font-medium transition-all ${
                                                            isActive
                                                                ? `${cfg.bgColor} ${cfg.color} border-current`
                                                                : 'border-transparent bg-gray-50 text-gray-500 hover:border-gray-200'
                                                        }`}
                                                    >
                                                        <cfg.icon className="h-4 w-4" />
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
                                                    (selectedStatus ===
                                                        currentStatus &&
                                                        !resolutionNotes)
                                                }
                                                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {isUpdating
                                                    ? 'Updating...'
                                                    : 'Update status'}
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

                                {/* AI Analysis Section */}
                                {report.ai_response ? (
                                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Bot className="h-6 w-6 text-blue-600" />
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                AI Analysis Results
                                            </h2>
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
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg bg-gray-50 p-8 text-center">
                                        <div className="mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
                                        <p className="text-sm text-gray-500">
                                            AI analysis is being processed...
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            This may take a few moments
                                        </p>
                                        <button
                                            onClick={() =>
                                                router.post(
                                                    `/reports/${report.id}/retry-analysis`,
                                                )
                                            }
                                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Retry Analysis
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
