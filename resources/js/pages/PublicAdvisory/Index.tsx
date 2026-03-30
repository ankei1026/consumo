// resources/js/Pages/PublicAdvisory/Index.tsx
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    AlertCircle,
    Wrench,
    Info,
    CheckCircle,
    Clock,
    Calendar,
    Filter,
    MoreVertical,
    AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '@/Pages/Layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface Advisory {
    id: number;
    title: string;
    description: string;
    type: 'general' | 'emergency' | 'maintenance';
    status: 'done' | 'on-going' | 'upcoming';
    created_at: string;
    formatted_date: string;
    type_color: string;
    status_color: string;
}

interface Props {
    advisories: {
        data: Advisory[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    currentStatus?: string;
}

export default function PublicAdvisoryIndex({
    advisories,
    currentStatus = 'all',
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState(currentStatus);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this advisory?')) {
            router.delete(`/public-advisories/${id}`, {
                onSuccess: () => {
                    toast.success('Advisory deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete advisory');
                },
            });
        }
    };

    const handleStatusFilter = (status: string) => {
        setActiveStatus(status);
        if (status === 'all') {
            router.get('/public-advisories');
        } else {
            router.get(`/public-advisories?status=${status}`);
        }
    };

    const handleStatusChange = (id: number, newStatus: string) => {
        setUpdatingId(id);
        setOpenDropdownId(null);

        const loadingToast = toast.loading(`Updating status...`);

        router.put(
            `/public-advisories/${id}`,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success(`Status updated to ${newStatus}`);
                    setUpdatingId(null);
                },
                onError: () => {
                    toast.dismiss(loadingToast);
                    toast.error('Failed to update status');
                    setUpdatingId(null);
                },
            },
        );
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'emergency':
                return <AlertTriangle className="h-4 w-4" />;
            case 'maintenance':
                return <Wrench className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done':
                return <CheckCircle className="mr-1 h-3 w-3" />;
            case 'on-going':
                return <Clock className="mr-1 h-3 w-3" />;
            case 'upcoming':
                return <Calendar className="mr-1 h-3 w-3" />;
            default:
                return null;
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'emergency':
                return {
                    border: 'border-red-500',
                    bg: 'bg-red-50',
                    badgeBg: 'bg-red-100',
                    badgeText: 'text-red-800',
                    iconColor: 'text-red-600',
                };
            case 'maintenance':
                return {
                    border: 'border-yellow-500',
                    bg: 'bg-yellow-50',
                    badgeBg: 'bg-yellow-100',
                    badgeText: 'text-yellow-800',
                    iconColor: 'text-yellow-600',
                };
            case 'general':
                return {
                    border: 'border-blue-500',
                    bg: 'bg-blue-50',
                    badgeBg: 'bg-blue-100',
                    badgeText: 'text-blue-800',
                    iconColor: 'text-blue-600',
                };
            default:
                return {
                    border: 'border-gray-500',
                    bg: 'bg-gray-50',
                    badgeBg: 'bg-gray-100',
                    badgeText: 'text-gray-800',
                    iconColor: 'text-gray-600',
                };
        }
    };

    const getStatusColorClasses = (status: string) => {
        const statusColors = {
            upcoming: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                border: 'border-yellow-200',
                hover: 'hover:bg-yellow-200',
                dot: 'bg-yellow-500',
            },
            'on-going': {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                border: 'border-blue-200',
                hover: 'hover:bg-blue-200',
                dot: 'bg-blue-500',
            },
            done: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                border: 'border-green-200',
                hover: 'hover:bg-green-200',
                dot: 'bg-green-500',
            },
        };
        return (
            statusColors[status as keyof typeof statusColors] ||
            statusColors.upcoming
        );
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

    const filteredAdvisories = advisories.data.filter(
        (advisory) =>
            advisory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            advisory.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    return (
        <DashboardLayout>
            <Head title="Public Advisories" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Header */}
                <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Public Advisories
                        </h1>
                        <p className="text-gray-600">
                            Manage announcements for consumers
                        </p>
                    </div>
                    <Link
                        href="/public-advisories/create"
                        className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Advisory
                    </Link>
                </motion.div>

                {/* Search and Filter */}
                <motion.div
                    variants={itemVariants}
                    className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search advisories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                        <svg
                            className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="mr-2 flex items-center text-sm font-medium text-gray-700">
                            <Filter className="mr-1 h-4 w-4" />
                            Filter:
                        </div>
                        <button
                            onClick={() => handleStatusFilter('all')}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                activeStatus === 'all'
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => handleStatusFilter('upcoming')}
                            className={`flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                activeStatus === 'upcoming'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                        >
                            <Calendar className="mr-1 h-3 w-3" />
                            Upcoming
                        </button>
                        <button
                            onClick={() => handleStatusFilter('on-going')}
                            className={`flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                activeStatus === 'on-going'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                        >
                            <Clock className="mr-1 h-3 w-3" />
                            On-going
                        </button>
                        <button
                            onClick={() => handleStatusFilter('done')}
                            className={`flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                activeStatus === 'done'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Done
                        </button>
                    </div>
                </motion.div>

                {/* Advisories Grid */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {filteredAdvisories.map((advisory) => {
                        const typeStyles = getTypeStyles(advisory.type);
                        const statusClasses = getStatusColorClasses(
                            advisory.status,
                        );

                        return (
                            <motion.div
                                key={advisory.id}
                                whileHover={{ scale: 1.02 }}
                                className={`overflow-hidden rounded-xl border border-gray-300 shadow-sm transition-all hover:shadow-md`}
                            >
                                <div className="p-6">
                                    {/* Header with Type and Actions */}
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className={`rounded-lg p-2 ${typeStyles.bg}`}
                                            >
                                                <div
                                                    className={
                                                        typeStyles.iconColor
                                                    }
                                                >
                                                    {getTypeIcon(advisory.type)}
                                                </div>
                                            </div>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${typeStyles.badgeBg} ${typeStyles.badgeText}`}
                                            >
                                                {advisory.type
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    advisory.type.slice(1)}
                                            </span>
                                        </div>

                                        {/* Status Update Dropdown */}
                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    setOpenDropdownId(
                                                        openDropdownId ===
                                                            advisory.id
                                                            ? null
                                                            : advisory.id,
                                                    )
                                                }
                                                className="rounded-lg p-1 hover:bg-gray-100"
                                                disabled={
                                                    updatingId === advisory.id
                                                }
                                            >
                                                {updatingId === advisory.id ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
                                                ) : (
                                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                                )}
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openDropdownId === advisory.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() =>
                                                            setOpenDropdownId(
                                                                null,
                                                            )
                                                        }
                                                    ></div>
                                                    <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        advisory.id,
                                                                        'upcoming',
                                                                    )
                                                                }
                                                                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                                                                    advisory.status ===
                                                                    'upcoming'
                                                                        ? 'bg-yellow-50 text-yellow-700'
                                                                        : 'text-gray-700'
                                                                }`}
                                                            >
                                                                <Calendar className="mr-2 h-4 w-4" />
                                                                Set as Upcoming
                                                                {advisory.status ===
                                                                    'upcoming' && (
                                                                    <CheckCircle className="ml-2 h-3 w-3 text-green-500" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        advisory.id,
                                                                        'on-going',
                                                                    )
                                                                }
                                                                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                                                                    advisory.status ===
                                                                    'on-going'
                                                                        ? 'bg-blue-50 text-blue-700'
                                                                        : 'text-gray-700'
                                                                }`}
                                                            >
                                                                <Clock className="mr-2 h-4 w-4" />
                                                                Set as On-going
                                                                {advisory.status ===
                                                                    'on-going' && (
                                                                    <CheckCircle className="ml-2 h-3 w-3 text-green-500" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        advisory.id,
                                                                        'done',
                                                                    )
                                                                }
                                                                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                                                                    advisory.status ===
                                                                    'done'
                                                                        ? 'bg-green-50 text-green-700'
                                                                        : 'text-gray-700'
                                                                }`}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Set as Done
                                                                {advisory.status ===
                                                                    'done' && (
                                                                    <CheckCircle className="ml-2 h-3 w-3 text-green-500" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                        {advisory.title}
                                    </h3>

                                    {/* Current Status Badge */}
                                    <div className="mb-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusClasses.bg} ${statusClasses.text}`}
                                        >
                                            {getStatusIcon(advisory.status)}
                                            Current:{' '}
                                            {advisory.status === 'on-going'
                                                ? 'On-going'
                                                : advisory.status
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  advisory.status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <span className="mb-2 block text-md text-gray-500">
                                        {advisory.formatted_date}
                                    </span>

                                    {/* Description */}
                                    <p className="line-clamp-3 text-lg text-gray-600">
                                        {advisory.description}
                                    </p>

                                    {/* Actions */}
                                    <div className="mt-4 flex justify-end space-x-2 border-t border-gray-100 pt-4">
                                        <Link
                                            href={`/public-advisories/${advisory.id}`}
                                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={`/public-advisories/${advisory.id}/edit`}
                                            className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(advisory.id)
                                            }
                                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {filteredAdvisories.length === 0 && (
                        <div className="col-span-3 py-12 text-center">
                            <Info className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900">
                                No advisories found
                            </h3>
                            <p className="text-gray-600">
                                {activeStatus !== 'all'
                                    ? `No ${activeStatus} advisories available.`
                                    : 'Get started by creating your first advisory.'}
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Pagination */}
                {advisories.last_page > 1 && (
                    <motion.div
                        variants={itemVariants}
                        className="mt-6 flex justify-center space-x-2"
                    >
                        {advisories.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => router.get(link.url)}
                                disabled={!link.url || link.active}
                                className={`rounded px-3 py-1 ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
                                        : link.url
                                          ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                          : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
