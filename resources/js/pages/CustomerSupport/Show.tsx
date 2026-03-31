// resources/js/Pages/CustomerSupport/Show.tsx
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Calendar,
    MessageSquare,
    Image as ImageIcon,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Star,
    ThumbsUp,
    HelpCircle,
    MoreHorizontal,
    Send,
    Edit2,
    Eye,
    X,
    RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/pages/Layouts/DashboardLayout';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface CustomerSupportTicket {
    id: number;
    consumer_id: string;
    subject: string;
    formatted_subject: string;
    message: string;
    image: string | null;
    status: string;
    admin_response: string | null;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    consumer: {
        name: string;
        account_number: string;
        meter_number: string;
        mobile_number: string;
        address: string;
        email?: string;
    };
}

interface Props {
    ticket: CustomerSupportTicket;
    canRespond?: boolean;
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
    in_progress: {
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

const subjectConfig: Record<
    string,
    { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
    appreciation: {
        label: 'Appreciation',
        icon: Star,
        color: 'text-amber-700',
        bgColor: 'bg-amber-50 border-amber-200',
    },
    complaint: {
        label: 'Complaint',
        icon: AlertCircle,
        color: 'text-rose-700',
        bgColor: 'bg-rose-50 border-rose-200',
    },
    suggestion: {
        label: 'Suggestion',
        icon: MessageSquare,
        color: 'text-sky-700',
        bgColor: 'bg-sky-50 border-sky-200',
    },
    inquiry: {
        label: 'Inquiry',
        icon: HelpCircle,
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50 border-emerald-200',
    },
    other: {
        label: 'Other',
        icon: MoreHorizontal,
        color: 'text-gray-700',
        bgColor: 'bg-gray-50 border-gray-200',
    },
};

export default function CustomerSupportShow({
    ticket,
    canRespond = true,
}: Props) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [isEditingResponse, setIsEditingResponse] = useState(false);
    const [response, setResponse] = useState(ticket.admin_response || '');
    const [selectedStatus, setSelectedStatus] = useState(ticket.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return format(new Date(date), 'MMMM dd, yyyy h:mm a');
    };

    const openImagePreview = (imageUrl: string) => {
        setPreviewImage(imageUrl);
        setPreviewOpen(true);
    };

    const handleUpdateTicket = async () => {
        if (!response.trim() && selectedStatus === ticket.status) {
            toast.error('Please add a response or change status');
            return;
        }

        setIsUpdating(true);

        try {
            router.patch(
                `/customer-support/${ticket.id}`,
                {
                    admin_response: response,
                    status: selectedStatus,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Ticket updated successfully');
                        setIsEditingResponse(false);
                    },
                    onError: (errors) => {
                        console.error('Update error:', errors);
                        toast.error('Failed to update ticket');
                    },
                    onFinish: () => {
                        setIsUpdating(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error updating ticket:', error);
            toast.error('Failed to update ticket');
            setIsUpdating(false);
        }
    };

    const StatusIcon = statusConfig[selectedStatus]?.icon || Clock;
    const SubjectIcon = subjectConfig[ticket.subject]?.icon || HelpCircle;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header with back button */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/customer-support"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Customer Support
                    </Link>
                </div>

                {/* Main Ticket Card */}
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="p-6 lg:p-8">
                        {/* Header with subject and status */}
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-6">
                            <div className="flex flex-wrap gap-2">
                                {/* Subject Badge */}
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${subjectConfig[ticket.subject]?.bgColor} ${subjectConfig[ticket.subject]?.color}`}
                                >
                                    <SubjectIcon className="h-4 w-4" />
                                    {subjectConfig[ticket.subject]?.label ||
                                        ticket.subject}
                                </span>

                                {/* Status Badge */}
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${statusConfig[selectedStatus]?.bgColor} ${statusConfig[selectedStatus]?.color}`}
                                >
                                    <StatusIcon className="h-4 w-4" />
                                    {statusConfig[selectedStatus]?.label ||
                                        selectedStatus}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(ticket.created_at)}
                                </span>
                            </div>
                        </div>

                        {/* Ticket content */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Left column: Consumer info */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                        <User className="h-5 w-5 text-blue-500" />
                                        Consumer Information
                                    </h2>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Name
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {ticket.consumer.name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Account Number
                                                </p>
                                                <p className="font-mono text-sm text-gray-900">
                                                    {
                                                        ticket.consumer
                                                            .account_number
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Meter Number
                                                </p>
                                                <p className="font-mono text-sm text-gray-900">
                                                    {
                                                        ticket.consumer
                                                            .meter_number
                                                    }
                                                </p>
                                            </div>
                                            {ticket.consumer.mobile_number && (
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Mobile Number
                                                    </p>
                                                    <p className="flex items-center gap-1 text-sm text-gray-900">
                                                        <Phone className="h-3 w-3" />
                                                        {
                                                            ticket.consumer
                                                                .mobile_number
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                            {ticket.consumer.email && (
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Email
                                                    </p>
                                                    <p className="flex items-center gap-1 text-sm text-gray-900">
                                                        <Mail className="h-3 w-3" />
                                                        {ticket.consumer.email}
                                                    </p>
                                                </div>
                                            )}
                                            {ticket.consumer.address && (
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Address
                                                    </p>
                                                    <p className="flex items-start gap-1 text-sm text-gray-900">
                                                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                                                        {
                                                            ticket.consumer
                                                                .address
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {ticket.image && (
                                    <div>
                                        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                            <ImageIcon className="h-5 w-5 text-blue-500" />
                                            Attached Image
                                        </h2>
                                        <div className="overflow-hidden rounded-lg border bg-gray-50">
                                            <img
                                                src={ticket.image}
                                                alt="Ticket attachment"
                                                className="max-h-64 w-full cursor-pointer object-contain transition hover:opacity-90"
                                                onClick={() =>
                                                    openImagePreview(
                                                        ticket.image!,
                                                    )
                                                }
                                            />
                                            <div className="p-2 text-center">
                                                <button
                                                    onClick={() =>
                                                        openImagePreview(
                                                            ticket.image!,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    View full size
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right column: Message and Admin Response */}
                            <div className="space-y-6 lg:col-span-2">
                                <div>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                        <MessageSquare className="h-5 w-5 text-blue-500" />
                                        Message
                                    </h2>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="whitespace-pre-line text-gray-700">
                                            {ticket.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Update Section */}
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
                                                    'in_progress',
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
                                                        {cfg.label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 flex items-center gap-3">
                                            <button
                                                onClick={handleUpdateTicket}
                                                disabled={
                                                    isUpdating ||
                                                    selectedStatus ===
                                                        ticket.status
                                                }
                                                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {isUpdating
                                                    ? 'Updating...'
                                                    : 'Update status'}
                                            </button>
                                        </div>

                                        {ticket.resolved_at && (
                                            <p className="mt-3 text-xs text-green-600">
                                                Resolved on:{' '}
                                                {formatDate(ticket.resolved_at)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl overflow-hidden p-0">
                    <div className="relative flex max-h-[80vh] min-h-[400px] items-center justify-center bg-black/90">
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-h-[80vh] w-auto object-contain"
                            />
                        )}
                        <button
                            onClick={() => setPreviewOpen(false)}
                            className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
