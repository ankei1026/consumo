import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Phone,
    Calendar,
    CreditCard,
    MapPin,
    Home,
    Building2,
    Landmark,
    Activity,
    Loader2,
    AlertTriangle,
    X,
} from 'lucide-react';
import DashboardLayout from '@/Pages/Layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface Consumer {
    custcode: string;
    account_number: string;
    name: string;
    mobile_number: string | null;
    address: string | null;
    meter_number: string;
    connection_type: 'residential' | 'commercial' | 'institutional';
    status: 'active' | 'inactive';
    created_at: string;
}

interface Props {
    consumer: Consumer;
}

export default function ConsumersShow({ consumer }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        // Custom toast confirmation
        toast(
            (t) => (
                <div className="flex flex-col gap-3 p-2">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="rounded-full bg-red-100 p-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                                Delete Consumer
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Are you sure you want to delete{' '}
                                <span className="font-medium">
                                    {consumer.name}
                                </span>
                                ?
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                This action cannot be undone. This will
                                permanently delete the consumer record.
                            </p>
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                performDelete();
                            }}
                            className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                        >
                            <Trash2 className="h-3 w-3" />
                            Delete
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 5000,
                position: 'top-center',
                style: {
                    background: 'white',
                    padding: '0',
                    borderRadius: '12px',
                    boxShadow:
                        '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    maxWidth: '400px',
                },
            },
        );
    };

    const performDelete = () => {
        setIsDeleting(true);
        const loadingToast = toast.loading('Deleting consumer...', {
            duration: 3000,
        });

        router.delete(`/consumers/${consumer.custcode}`, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Consumer deleted successfully!', {
                    icon: '🗑️',
                    duration: 4000,
                });
                router.visit('/consumers');
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                toast.error('Failed to delete consumer. Please try again.', {
                    icon: '❌',
                    duration: 4000,
                });
                console.error('Delete error:', errors);
                setIsDeleting(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const getConnectionTypeIcon = (type: string) => {
        switch (type) {
            case 'residential':
                return <Home className="h-5 w-5" />;
            case 'commercial':
                return <Building2 className="h-5 w-5" />;
            case 'institutional':
                return <Landmark className="h-5 w-5" />;
            default:
                return <Home className="h-5 w-5" />;
        }
    };

    const getConnectionTypeColor = (type: string) => {
        switch (type) {
            case 'residential':
                return 'bg-green-50 text-green-600';
            case 'commercial':
                return 'bg-blue-50 text-blue-600';
            case 'institutional':
                return 'bg-purple-50 text-purple-600';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-50 text-green-600'
            : 'bg-red-50 text-red-600';
    };

    // Helper function to display "Not set" for null values
    const formatFieldValue = (value: string | null, placeholder: string = 'Not set') => {
        if (!value || value.trim() === '') {
            return <span className="italic text-gray-400">{placeholder}</span>;
        }
        return <span className="font-medium text-gray-900">{value}</span>;
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <DashboardLayout>
            <Head title={`Consumer - ${consumer.name}`} />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-3xl"
            >
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/consumers"
                        className="mb-4 inline-flex items-center text-gray-600 transition-colors hover:text-blue-600"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Consumers
                    </Link>
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {consumer.name}
                            </h1>
                            <p className="mt-1 flex items-center text-gray-600">
                                <CreditCard className="mr-1 h-4 w-4" />
                                Account: {consumer.account_number}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Customer Code: {consumer.custcode}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Link
                                href={`/consumers/${consumer.custcode}/edit`}
                                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Consumer Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                    <div className="p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Consumer Information
                        </h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="rounded-lg bg-blue-50 p-2">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Full Name
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {consumer.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="rounded-lg bg-green-50 p-2">
                                        <Phone className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Mobile Number
                                        </p>
                                        {formatFieldValue(consumer.mobile_number)}
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="rounded-lg bg-indigo-50 p-2">
                                        <MapPin className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Address
                                        </p>
                                        {formatFieldValue(consumer.address)}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="rounded-lg bg-purple-50 p-2">
                                        <CreditCard className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Account Number
                                        </p>
                                        <p className="font-mono font-medium text-gray-900">
                                            {consumer.account_number}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="rounded-lg bg-cyan-50 p-2">
                                        <div className="flex h-5 w-5 items-center justify-center font-mono text-xs text-cyan-600">
                                            #
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Meter Number
                                        </p>
                                        <p className="font-mono font-medium text-gray-900">
                                            {consumer.meter_number}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div
                                        className={`rounded-lg p-2 ${getConnectionTypeColor(
                                            consumer.connection_type,
                                        )}`}
                                    >
                                        {getConnectionTypeIcon(
                                            consumer.connection_type,
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Connection Type
                                        </p>
                                        <p className="font-medium text-gray-900 capitalize">
                                            {consumer.connection_type}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div
                                        className={`rounded-lg p-2 ${getStatusColor(
                                            consumer.status,
                                        )}`}
                                    >
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Status
                                        </p>
                                        <p
                                            className={`font-medium capitalize ${consumer.status === 'active' ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {consumer.status}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="rounded-lg bg-amber-50 p-2">
                                        <Calendar className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Member Since
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(
                                                consumer.created_at,
                                            ).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info Card */}
                    <div className="border-t border-gray-100 bg-gray-50 p-6">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Customer ID: {consumer.custcode}</span>
                            <span>
                                Registered:{' '}
                                {new Date(
                                    consumer.created_at,
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
}
