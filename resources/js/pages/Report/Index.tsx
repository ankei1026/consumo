import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import {
    RefreshCw,
    Filter,
    User,
    Calendar,
    Droplet,
    CheckCircle2,
    Bot,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    AlertTriangle,
    AlertCircle,
    Clock,
    FileText,
    Image,
    XCircle,
    Save,
} from 'lucide-react';
import DashboardLayout from '@/pages/Layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface Report {
    id: number;
    custcode: string;
    content: string;
    image: string | null;
    created_at: string;
    updated_at: string;
    has_ai_analysis?: boolean;
    is_fallback_analysis?: boolean;
    status?: string;
    status_label?: string;
    resolved_at?: string | null;
    resolution_notes?: string | null;
    admin_feedback?: string | null;
    consumer: {
        name: string;
        account_number: string;
        meter_number: string;
    } | null;
    water_consumption: {
        id: number;
        consumption: number;
        formatted_consumption: string;
        billing_period: string;
        start_date: string;
        end_date: string;
    } | null;
    ai_response: {
        id: number;
        leak_detected: boolean;
        leak_type: string;
        severity: string;
        priority: string;
        image_analysis: string;
        recommendation: string;
        summary: string;
        text_consistency: {
            matches: boolean;
            explanation: string;
        };
        consumption_analysis: {
            has_spike: boolean;
            spike_percentage: number;
            current_consumption: number;
            average_consumption: number;
            analysis: string;
        };
        trend_analysis: any;
        analyzed_at: string;
        is_fallback?: boolean;
    } | null;
}

interface PaginatedReports {
    data: Report[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface ReportIndexProps {
    reports: PaginatedReports;
    filters: {
        leak_detected: string;
        severity: string;
        status: string;
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

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
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
        icon: CheckCircle2,
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

export default function ReportIndex({
    reports,
    filters: initialFilters,
}: ReportIndexProps) {
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        leak_detected: initialFilters?.leak_detected || '',
        severity: initialFilters?.severity || '',
        status: initialFilters?.status || '',
    });
    const [retryingReports, setRetryingReports] = useState<Set<number>>(new Set());
    const [adminFeedback, setAdminFeedback] = useState<Record<number, string>>({});
    const [isSendingFeedback, setIsSendingFeedback] = useState<Record<number, boolean>>({});
    const [selectedStatus, setSelectedStatus] = useState<Record<number, string>>({});
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<number, boolean>>({});

    // Initialize state for reports
    useEffect(() => {
        if (reports?.data) {
            const initialStatus: Record<number, string> = {};
            const initialFeedback: Record<number, string> = {};
            reports.data.forEach(report => {
                initialStatus[report.id] = report.status || 'pending';
                initialFeedback[report.id] = report.admin_feedback || '';
            });
            setSelectedStatus(initialStatus);
            setAdminFeedback(initialFeedback);
        }
    }, [reports]);

    // Real-time filter effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get('/reports', filters, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filters.leak_detected, filters.severity, filters.status]);

    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
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

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            leak_detected: '',
            severity: '',
            status: '',
        });
    };

    const retryAnalysis = async (reportId: number) => {
        if (retryingReports.has(reportId)) return;

        setRetryingReports((prev) => new Set(prev).add(reportId));

        router.post(
            `/reports/${reportId}/retry-analysis`,
            {},
            {
                preserveState: true,
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
                    setRetryingReports((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(reportId);
                        return newSet;
                    });
                },
            },
        );
    };

    const handleSendFeedback = (reportId: number) => {
        setIsSendingFeedback(prev => ({ ...prev, [reportId]: true }));
        router.put(
            `/reports/${reportId}/status`,
            { admin_feedback: adminFeedback[reportId] || '' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Admin feedback updated successfully');
                    setIsSendingFeedback(prev => ({ ...prev, [reportId]: false }));
                    router.reload({ preserveScroll: true });
                },
                onError: () => {
                    toast.error('Failed to update feedback');
                    setIsSendingFeedback(prev => ({ ...prev, [reportId]: false }));
                },
            },
        );
    };

    const handleUpdateStatus = (reportId: number) => {
        setIsUpdatingStatus(prev => ({ ...prev, [reportId]: true }));
        router.put(
            `/reports/${reportId}/status`,
            {
                status: selectedStatus[reportId] || 'pending',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Report status updated successfully');
                    router.reload({ preserveScroll: true });
                },
                onError: (errors) => {
                    console.error('Update error:', errors);
                    toast.error('Failed to update report status');
                },
                onFinish: () => {
                    setIsUpdatingStatus(prev => ({ ...prev, [reportId]: false }));
                },
            },
        );
    };

    const openModal = (imageSrc: string) => {
        setModalImage(imageSrc);
    };

    const closeModal = () => {
        setModalImage(null);
    };

    const hasActiveFilters = filters.leak_detected !== '' || filters.severity !== '' || filters.status !== '';

    // Add null check for reports
    if (!reports || !reports.data) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-600">Loading reports...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        {
            name: 'Total Reports',
            value: reports.total?.toString() || '0',
            icon: FileText,
            change: 'All time',
            color: 'blue',
        },
        {
            name: 'Leaks Detected',
            value: reports.data.filter((r) => r.ai_response?.leak_detected).length.toString(),
            icon: Droplet,
            change: 'Critical issues',
            color: 'blue',
        },
        {
            name: 'Failed Analysis',
            value: reports.data.filter((r) => !r.ai_response || r.ai_response?.is_fallback).length.toString(),
            icon: Bot,
            change: 'Needs retry',
            color: 'blue',
        },
        {
            name: 'Resolved Issues',
            value: reports.data.filter((r) => r.status === 'resolved').length.toString(),
            icon: CheckCircle2,
            change: 'Completed',
            color: 'blue',
        },
    ];

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.visit(url, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Water Leak Reports</h2>
                        <p className="text-gray-600">AI-powered analysis of reported water issues</p>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.name} className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="relative z-10">
                                <div className="mb-4 max-w-fit rounded-lg bg-blue-100 p-3">
                                    <stat.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                <p className="text-sm text-gray-600">{stat.name}</p>
                                <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Filters */}
                <motion.div variants={itemVariants} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900">Filter Reports</h3>
                            {hasActiveFilters && (
                                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Active</span>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Leak Detected</label>
                            <select
                                name="leak_detected"
                                value={filters.leak_detected}
                                onChange={handleFilterChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">All</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Severity</label>
                            <select
                                name="severity"
                                value={filters.severity}
                                onChange={handleFilterChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">All</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="ongoing">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                hasActiveFilters
                                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                            }`}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </motion.div>

                {/* Reports List */}
                <div className="space-y-4">
                    {reports.data.map((report, index) => {
                        const severityConfig = report.ai_response ? getSeverityConfig(report.ai_response.severity) : null;
                        const priorityConfig = report.ai_response ? getPriorityConfig(report.ai_response.priority) : null;
                        const SeverityIcon = severityConfig?.icon || AlertCircle;
                        const isFallback = report.ai_response?.is_fallback || false;
                        const hasFailedAnalysis = !report.ai_response || isFallback;
                        const reportStatus = report.status || 'pending';
                        const StatusIcon = statusConfig[reportStatus]?.icon || Clock;

                        return (
                            <motion.div
                                key={report.id}
                                variants={itemVariants}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-gray-900">Report #{report.id}</h3>
                                                {report.ai_response?.leak_detected && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                                        <Droplet className="h-3 w-3" /> Leak
                                                    </span>
                                                )}
                                                {isFallback && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                                        <Bot className="h-3 w-3" /> Fallback Analysis
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <User className="h-3 w-3" /> {report.consumer?.name || 'N/A'}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> {formatDate(report.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[reportStatus]?.bgColor} ${statusConfig[reportStatus]?.color}`}>
                                                <StatusIcon className="h-3 w-3" /> {statusConfig[reportStatus]?.label || reportStatus}
                                            </span>

                                            {report.ai_response && !isFallback && (
                                                <>
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${severityConfig?.bg} ${severityConfig?.text}`}>
                                                        <SeverityIcon className="h-3 w-3" /> {report.ai_response.severity?.toUpperCase()}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${priorityConfig?.bg} ${priorityConfig?.text}`}>
                                                        <Clock className="h-3 w-3" /> {report.ai_response.priority?.toUpperCase()}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${report.ai_response.leak_detected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                        {report.ai_response.leak_detected ? <Droplet className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                                        {report.ai_response.leak_detected ? 'Leak Detected' : 'No Leak'}
                                                    </span>
                                                </>
                                            )}
                                            {!report.ai_response && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                                                    <AlertCircle className="h-3 w-3" /> Analysis Failed
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Grid */}
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Left Column */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium tracking-wider text-gray-500 uppercase">Description</label>
                                                <p className="rounded-lg bg-gray-50 p-3 text-gray-700">{report.content}</p>
                                            </div>

                                            {report.water_consumption && (
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium tracking-wider text-gray-500 uppercase">Water Consumption</label>
                                                    <div className="rounded-lg bg-gray-50 p-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700">{report.water_consumption.formatted_consumption}</span>
                                                            <span className="text-xs text-blue-600">{report.water_consumption.billing_period}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {report.image && (
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium tracking-wider text-gray-500 uppercase">Attached Image</label>
                                                    <div className="relative overflow-hidden rounded-lg border bg-gray-50">
                                                        <img
                                                            src={report.image}
                                                            alt="Report"
                                                            className="max-h-full w-full cursor-pointer object-cover transition hover:opacity-90"
                                                            onClick={() => openModal(report.image!)}
                                                        />
                                                        <button
                                                            onClick={() => openModal(report.image!)}
                                                            className="absolute right-2 bottom-2 rounded-lg bg-black/50 p-1.5 text-white transition hover:bg-black/70"
                                                        >
                                                            <Image className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column */}
                                        {report.ai_response ? (
                                            <div className="space-y-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Bot className="h-5 w-5 text-blue-600" />
                                                        <h4 className="font-semibold text-gray-900">AI Analysis</h4>
                                                        {isFallback && <span className="text-xs text-orange-600">(Fallback Mode)</span>}
                                                    </div>
                                                    {hasFailedAnalysis && !retryingReports.has(report.id) && (
                                                        <button onClick={() => retryAnalysis(report.id)} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700">
                                                            <RefreshCw className="h-3 w-3" /> Retry Analysis
                                                        </button>
                                                    )}
                                                    {retryingReports.has(report.id) && (
                                                        <button disabled className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg bg-gray-400 px-3 py-1.5 text-xs font-medium text-white">
                                                            <RefreshCw className="h-3 w-3 animate-spin" /> Retrying...
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="rounded-lg bg-white p-3">
                                                    <div className="text-sm whitespace-pre-line text-gray-700">{report.ai_response.summary || 'No summary available'}</div>
                                                </div>

                                                {report.ai_response.image_analysis && (
                                                    <div>
                                                        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Image Analysis</span>
                                                        <div className="mt-1 rounded-lg bg-white p-3">
                                                            <p className="text-sm text-gray-700">{report.ai_response.image_analysis}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {report.ai_response.recommendation && (
                                                    <div className={`rounded-lg p-3 ${isFallback ? 'bg-orange-100' : 'bg-blue-100'}`}>
                                                        <span className={`text-xs font-semibold tracking-wider uppercase ${isFallback ? 'text-orange-700' : 'text-blue-700'}`}>Recommendation</span>
                                                        <p className={`mt-1 text-sm ${isFallback ? 'text-orange-800' : 'text-blue-800'}`}>{report.ai_response.recommendation}</p>
                                                    </div>
                                                )}

                                                {report.admin_feedback && (
                                                    <div className={`rounded-lg p-3 ${isFallback ? 'bg-orange-100' : 'bg-blue-100'}`}>
                                                        <span className={`text-xs font-semibold tracking-wider uppercase ${isFallback ? 'text-orange-700' : 'text-blue-700'}`}>Admin Feedback</span>
                                                        <p className={`mt-1 text-sm ${isFallback ? 'text-orange-800' : 'text-blue-800'}`}>{report.admin_feedback}</p>
                                                    </div>
                                                )}

                                                <div className="pt-2 text-right text-xs text-gray-400">
                                                    Analyzed: {formatDateShort(report.ai_response.analyzed_at)}
                                                    {isFallback && <span className="ml-2 text-orange-500">(Fallback Analysis)</span>}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-lg bg-red-50 p-6 text-center">
                                                <AlertCircle className="mb-3 h-12 w-12 text-red-500" />
                                                <p className="text-sm font-medium text-red-800">Failed to analyze by AI</p>
                                                <p className="mt-1 text-xs text-red-600">The AI analysis service was unable to process this report.</p>
                                                <button onClick={() => retryAnalysis(report.id)} disabled={retryingReports.has(report.id)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                                                    <RefreshCw className={`h-4 w-4 ${retryingReports.has(report.id) ? 'animate-spin' : ''}`} />
                                                    {retryingReports.has(report.id) ? 'Retrying...' : 'Retry Analysis'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin Feedback and Actions */}
                                    <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">


                                        {/* Action Buttons */}
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/reports/${report.id}`} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                                                <Eye className="h-4 w-4" /> View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {reports.data.length === 0 && (
                        <motion.div variants={itemVariants} className="rounded-xl border border-gray-100 bg-white p-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">No reports found</h3>
                            <p className="text-sm text-gray-500">There are no reports available at the moment.</p>
                        </motion.div>
                    )}
                </div>

                {/* Pagination */}
                {reports.data.length > 0 && reports.last_page > 1 && (
                    <motion.div variants={itemVariants} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                        <button
                            onClick={() => handlePageChange(reports.prev_page_url)}
                            disabled={!reports.prev_page_url}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" /> Previous
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                Page {reports.current_page} of {reports.last_page}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({reports.total} total reports)
                            </span>
                        </div>
                        <button
                            onClick={() => handlePageChange(reports.next_page_url)}
                            disabled={!reports.next_page_url}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* Image Modal */}
            {modalImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75" onClick={closeModal}>
                    <div className="relative max-h-full max-w-4xl p-4">
                        <img src={modalImage} alt="Full size" className="max-h-[90vh] w-auto max-w-full rounded-lg object-contain" />
                        <button onClick={closeModal} className="absolute -top-10 right-0 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
