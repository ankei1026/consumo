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
    created_at: string;
    updated_at: string;
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
    canRespond?: boolean; // whether current user can add admin response
}

const statusConfig = {
    pending: {
        label: 'Pending',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    in_progress: {
        label: 'In Progress',
        icon: AlertCircle,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    resolved: {
        label: 'Resolved',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
    },
    closed: {
        label: 'Closed',
        icon: XCircle,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
    },
};

const subjectConfig = {
    appreciation: {
        label: 'Appreciation',
        icon: Star,
        color: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    complaint: {
        label: 'Complaint',
        icon: AlertCircle,
        color: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    suggestion: {
        label: 'Suggestion',
        icon: MessageSquare,
        color: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    inquiry: {
        label: 'Inquiry',
        icon: HelpCircle,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    other: {
        label: 'Other',
        icon: MoreHorizontal,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
    },
};

export default function CustomerSupportShow({
    ticket,
    canRespond = true,
}: Props) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [isEditingResponse, setIsEditingResponse] = useState(false);

    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        return format(new Date(date), 'MMMM dd, yyyy h:mm a');
    };

    const openImagePreview = (imageUrl: string) => {
        setPreviewImage(imageUrl);
        setPreviewOpen(true);
    };

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

                                {/* Status History (optional) - could be added if needed */}
                                <div className="text-right text-xs text-gray-400">
                                    Last updated:{' '}
                                    {formatDate(ticket.updated_at)}
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
