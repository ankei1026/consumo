// resources/js/Pages/CustomerSupport/Show.tsx
import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
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
    Save,
    Bot,
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
    admin_feedback: string | null;
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
    // Debug: Log the ticket data
    useEffect(() => {
        console.log('Ticket data received:', ticket);
        console.log('Admin response value:', ticket.admin_response);
        console.log('Admin feedback value:', ticket.admin_feedback);
        console.log('Status:', ticket.status);
    }, [ticket]);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [isEditingResponse, setIsEditingResponse] = useState(false);
    const [response, setResponse] = useState(ticket.admin_response || '');
    const [selectedStatus, setSelectedStatus] = useState(ticket.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [adminFeedback, setAdminFeedback] = useState(ticket.admin_feedback || '');
    const [isSendingFeedback, setIsSendingFeedback] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Also log when response state changes
    useEffect(() => {
        console.log('Response state updated:', response);
    }, [response]);

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return format(new Date(date), 'MMMM dd, yyyy h:mm a');
    };

    const openImagePreview = (imageUrl: string) => {
        setPreviewImage(imageUrl);
        setPreviewOpen(true);
    };

    // Handle admin feedback submit
    const handleSendFeedback = () => {
        setIsSendingFeedback(true);
        router.patch(
            `/customer-support/${ticket.id}`,
            { admin_feedback: adminFeedback },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Admin feedback updated successfully');
                    setIsSendingFeedback(false);
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
        router.patch(
            `/customer-support/${ticket.id}`,
            { status: selectedStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Ticket status updated successfully');
                    router.reload({ preserveScroll: true });
                },
                onError: (errors) => {
                    console.error('Update error:', errors);
                    toast.error('Failed to update ticket status');
                },
                onFinish: () => {
                    setIsUpdating(false);
                },
            },
        );
    };

    // Handle admin response update
    const handleUpdateResponse = () => {
        if (!response.trim()) {
            toast.error('Please enter a response');
            return;
        }

        setIsUpdating(true);
        router.patch(
            `/customer-support/${ticket.id}`,
            { admin_response: response },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Admin response updated successfully');
                    setIsEditingResponse(false);
                    router.reload({ preserveScroll: true });
                },
                onError: (errors) => {
                    console.error('Response error:', errors);
                    toast.error('Failed to update response');
                },
                onFinish: () => {
                    setIsUpdating(false);
                },
            },
        );
    };

    // Handle delete ticket
    const handleDeleteTicket = () => {
        if (confirm('Are you sure you want to delete this ticket?')) {
            setIsDeleting(true);
            router.delete(`/customer-support/${ticket.id}`, {
                onSuccess: () => {
                    toast.success('Ticket deleted successfully');
                    router.visit('/customer-support');
                },
                onError: () => {
                    toast.error('Failed to delete ticket');
                    setIsDeleting(false);
                },
            });
        }
    };

    const StatusIcon = statusConfig[selectedStatus]?.icon || Clock;
    const SubjectIcon = subjectConfig[ticket.subject]?.icon || HelpCircle;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header with back button and delete button */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/customer-support"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Customer Support
                    </Link>
                    <button
                        onClick={handleDeleteTicket}
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
                                Delete Ticket
                            </>
                        )}
                    </button>
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

                            {/* Right column: Message, Admin Response, and Admin Feedback */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* Message */}
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

                                {/* Admin Response Section */}
                                <div>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                        <MessageSquare className="h-5 w-5 text-blue-500" />
                                        Admin Feedback
                                    </h2>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        {isEditingResponse ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-700 focus:ring focus:ring-gray-200"
                                                    rows={4}
                                                    value={response}
                                                    onChange={e => setResponse(e.target.value)}
                                                    placeholder="Type your response here..."
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleUpdateResponse}
                                                        disabled={isUpdating}
                                                        className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                                    >
                                                        {isUpdating ? (
                                                            <>
                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="h-4 w-4" />
                                                                Save Response
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingResponse(false);
                                                            setResponse(ticket.admin_response || '');
                                                        }}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {ticket.admin_feedback ? (
                                                    <div>
                                                        <p className="whitespace-pre-line text-gray-700">
                                                            {ticket.admin_feedback}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-gray-500 italic mb-3">
                                                            No admin feedback yet.
                                                        </p>

                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

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
                                                    selectedStatus === ticket.status
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

                                    </div>
                                </div>

                                {/* Admin Feedback Section */}
                                <div>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                        <Bot className="h-5 w-5 text-blue-500" />
                                        Admin Feedback
                                    </h2>
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <textarea
                                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-700 focus:ring focus:ring-blue-200"
                                            rows={3}
                                            value={adminFeedback}
                                            onChange={e => setAdminFeedback(e.target.value)}
                                            placeholder="Add admin feedback or internal notes here..."
                                        />
                                        <button
                                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
                                                    <Send className="h-4 w-4" />
                                                    Send Feedback
                                                </>
                                            )}
                                        </button>
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
