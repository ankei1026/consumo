// resources/js/Pages/Consumer/Index.tsx

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    ChevronDown,
    Filter,
    Activity,
    Home,
    Building2,
    Landmark,
    Ruler,
    ToggleLeft,
    ToggleRight,
    Loader2,
} from 'lucide-react';
import DashboardLayout from '@/Pages/Layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface Consumer {
    custcode: string;
    account_number: string;
    name: string;
    mobile_number: string;
    meter_number: string;
    connection_type: 'residential' | 'commercial' | 'institutional';
    status: 'active' | 'inactive';
    address: string | null;
    created_at: string;
}

interface Props {
    consumers: {
        data: Consumer[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
}

export default function ConsumersIndex({ consumers }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedConsumers, setSelectedConsumers] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

    const consumersData = consumers?.data || [];
    const pagination = consumers || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        links: [],
    };

    const handleDelete = (custcode: string) => {
        if (confirm('Are you sure you want to delete this consumer?')) {
            const loadingToast = toast.loading('Deleting consumer...');

            router.delete(`/consumers/${custcode}`, {
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success('Consumer deleted successfully');
                },
                onError: () => {
                    toast.dismiss(loadingToast);
                    toast.error('Failed to delete consumer');
                },
            });
        }
    };

    const handleStatusToggle = (consumer: Consumer) => {
        const newStatus = consumer.status === 'active' ? 'inactive' : 'active';
        const loadingToast = toast.loading(
            `Updating status to ${newStatus}...`,
        );

        setTogglingStatus(consumer.custcode);

        // Send only the status field for update
        router.put(
            `/consumers/${consumer.custcode}`,
            { status: newStatus },
            {
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success(`Consumer status updated to ${newStatus}`, {
                        icon: newStatus === 'active' ? '✅' : '⭕',
                        duration: 3000,
                    });
                    // Refresh the page to reflect changes
                    router.reload();
                },
                onError: (errors) => {
                    toast.dismiss(loadingToast);
                    toast.error('Failed to update consumer status', {
                        icon: '❌',
                        duration: 4000,
                    });
                    console.error('Status update error:', errors);
                },
                onFinish: () => {
                    setTogglingStatus(null);
                },
            },
        );
    };

    const getConnectionTypeIcon = (type: string) => {
        switch (type) {
            case 'residential':
                return <Home className="h-3 w-3" />;
            case 'commercial':
                return <Building2 className="h-3 w-3" />;
            case 'institutional':
                return <Landmark className="h-3 w-3" />;
            default:
                return <Home className="h-3 w-3" />;
        }
    };

    const getConnectionTypeColor = (type: string) => {
        switch (type) {
            case 'residential':
                return 'bg-green-100 text-green-800';
            case 'commercial':
                return 'bg-blue-100 text-blue-800';
            case 'institutional':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    // Filter consumers based on search term and filters
    const filteredConsumers = consumersData.filter((consumer) => {
        const matchesSearch =
            consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consumer.account_number
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            consumer.mobile_number?.includes(searchTerm) ||
            consumer.meter_number
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            consumer.custcode?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || consumer.status === statusFilter;
        const matchesType =
            typeFilter === 'all' || consumer.connection_type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

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

    if (!consumers) {
        return (
            <DashboardLayout>
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">
                            Loading consumers...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Head title="Consumers" />

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
                            Consumers
                        </h1>
                        <p className="text-gray-600">
                            Manage all registered consumers
                        </p>
                    </div>
                    <Link
                        href="/consumers/create"
                        className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Consumer
                    </Link>
                </motion.div>

                {/* Filters and Search */}
                <motion.div
                    variants={itemVariants}
                    className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by customer code, name, account, meter, or mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Filter Row */}
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="institutional">Institutional</option>
                        </select>

                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setTypeFilter('all');
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </motion.div>

                {/* Consumers Table */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                    {filteredConsumers.length === 0 ? (
                        <div className="py-12 text-center">
                            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">
                                No consumers found
                            </h3>
                            <p className="mb-4 text-gray-600">
                                Get started by adding your first consumer.
                            </p>
                            <Link
                                href="/consumers/create"
                                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Consumer
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Account No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Meter No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredConsumers.map((consumer) => (
                                        <tr
                                            key={consumer.custcode}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-mono text-sm text-gray-600">
                                                {consumer.account_number}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {consumer.name}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-gray-600">
                                                {consumer.meter_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getConnectionTypeColor(consumer.connection_type)}`}
                                                >
                                                    {getConnectionTypeIcon(
                                                        consumer.connection_type,
                                                    )}
                                                    {consumer.connection_type
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        consumer.connection_type.slice(
                                                            1,
                                                        )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(consumer.status)}`}
                                                    >
                                                        {consumer.status}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleStatusToggle(
                                                                consumer,
                                                            )
                                                        }
                                                        disabled={
                                                            togglingStatus ===
                                                            consumer.custcode
                                                        }
                                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
                                                        style={{
                                                            backgroundColor:
                                                                consumer.status ===
                                                                'active'
                                                                    ? '#10B981'
                                                                    : '#EF4444',
                                                        }}
                                                    >
                                                        <span className="sr-only">
                                                            Toggle{' '}
                                                            {consumer.status}
                                                        </span>
                                                        <span
                                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                consumer.status ===
                                                                'active'
                                                                    ? 'translate-x-5'
                                                                    : 'translate-x-0'
                                                            }`}
                                                        />
                                                        {togglingStatus ===
                                                            consumer.custcode && (
                                                            <Loader2 className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-spin text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(
                                                    consumer.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        href={`/consumers/${consumer.custcode}`}
                                                        className="rounded p-1 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/consumers/${consumer.custcode}/edit`}
                                                        className="rounded p-1 text-green-600 hover:bg-green-50"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                consumer.custcode,
                                                            )
                                                        }
                                                        className="rounded p-1 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.last_page > 1 &&
                        filteredConsumers.length > 0 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing{' '}
                                        {(pagination.current_page - 1) *
                                            pagination.per_page +
                                            1}{' '}
                                        to{' '}
                                        {Math.min(
                                            pagination.current_page *
                                                pagination.per_page,
                                            pagination.total,
                                        )}{' '}
                                        of {pagination.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {pagination.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    router.get(link.url)
                                                }
                                                disabled={
                                                    !link.url || link.active
                                                }
                                                className={`rounded px-3 py-1 ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                          ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                          : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
}
