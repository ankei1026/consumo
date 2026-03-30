// resources/js/Pages/CustomerSupport/Index.tsx
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Search,
    Filter,
    ChevronDown,
    Eye,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Image as ImageIcon,
    CreditCard,
    X,
    ZoomIn,
    MessageSquare,
    Star,
    ThumbsUp,
    HelpCircle,
    MoreHorizontal,
    Trash2,
} from 'lucide-react';
import DashboardLayout from '@/pages/Layouts/DashboardLayout';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogClose,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface CustomerSupport {
    id: number;
    consumer_id: string;
    subject: string;
    formatted_subject: string;
    message: string;
    image: string | null;
    status: string;
    admin_response: string | null;
    created_at: string;
    consumer: {
        name: string;
        account_number: string;
        meter_number: string;
        mobile_number: string;
        address: string;
    };
}

interface Props {
    tickets: {
        data: CustomerSupport[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        status: string;
        subject: string;
        search: string;
        start_date: string;
        end_date: string;
    };
}

export default function CustomerSupportIndex({ tickets, filters }: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedSubject, setSelectedSubject] = useState(
        filters.subject || '',
    );
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const subjectColors = {
        appreciation: 'bg-amber-50 text-amber-700',
        complaint: 'bg-rose-50 text-rose-700',
        suggestion: 'bg-sky-50 text-sky-700',
        inquiry: 'bg-emerald-50 text-emerald-700',
        other: 'bg-gray-50 text-gray-600',
    };

    const subjectIcons = {
        appreciation: <Star className="h-3 w-3" />,
        complaint: <AlertCircle className="h-3 w-3" />,
        suggestion: <MessageSquare className="h-3 w-3" />,
        inquiry: <HelpCircle className="h-3 w-3" />,
        other: <MoreHorizontal className="h-3 w-3" />,
    };

    const handleSearch = () => {
        router.get(
            '/customer-support',
            {
                search: searchTerm,
                status: selectedStatus,
                subject: selectedSubject,
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedSubject('');
        setStartDate('');
        setEndDate('');
        router.get('/customer-support', {}, { preserveState: true });
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/customer-support',
            {
                page,
                search: searchTerm,
                status: selectedStatus,
                subject: selectedSubject,
                start_date: startDate,
                end_date: endDate,
            },
            { preserveState: true },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this ticket?')) {
            router.delete(`/customer-support/${id}`, {
                onSuccess: () => {
                    toast.success('Ticket deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete ticket');
                },
            });
        }
    };

    const openImagePreview = (imageUrl: string) => {
        setPreviewImage(imageUrl);
        setPreviewOpen(true);
    };

    const handleQuickFilter = (subject: string) => {
        setSelectedSubject(subject);
        router.get(
            '/customer-support',
            {
                search: searchTerm,
                status: selectedStatus,
                subject: subject,
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const getSubjectBadge = (subject: string) => {
        return (
            <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                    subjectColors[subject as keyof typeof subjectColors] ||
                    subjectColors.other
                }`}
            >
                {subjectIcons[subject as keyof typeof subjectIcons]}
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
            </span>
        );
    };

    const truncateText = (text: string, maxLength: number = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Customer Support
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage and respond to customer support tickets
                        </p>
                    </div>
                </div>
                <div className="rounded-lg bg-white p-5 shadow-sm">
                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Subject
                                    </label>
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) =>
                                            setSelectedSubject(e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                    >
                                        <option value="">All Subjects</option>
                                        <option value="appreciation">
                                            Appreciation
                                        </option>
                                        <option value="complaint">
                                            Complaint
                                        </option>
                                        <option value="suggestion">
                                            Suggestion
                                        </option>
                                        <option value="inquiry">Inquiry</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    onClick={handleReset}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Reset Filters
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quick Filter Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="mr-2 flex items-center text-sm font-medium text-gray-700">
                            <Filter className="mr-1 h-4 w-4" />
                            Quick filter:
                        </div>
                        <button
                            onClick={() => handleQuickFilter('')}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                !selectedSubject
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => handleQuickFilter('complaint')}
                            className={`flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                selectedSubject === 'complaint'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                        >
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Complaints
                        </button>
                        <button
                            onClick={() => handleQuickFilter('appreciation')}
                            className={`flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                selectedSubject === 'appreciation'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                        >
                            <Star className="mr-1 h-3 w-3" />
                            Appreciations
                        </button>
                        <button
                            onClick={() => handleQuickFilter('inquiry')}
                            className={`flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                selectedSubject === 'inquiry'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                        >
                            <HelpCircle className="mr-1 h-3 w-3" />
                            Inquiries
                        </button>
                        <button
                            onClick={() => handleQuickFilter('suggestion')}
                            className={`flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                selectedSubject === 'suggestion'
                                    ? 'bg-sky-500 text-white'
                                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                            }`}
                        >
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Suggestions
                        </button>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Consumer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Message
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {tickets.data.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {ticket.image ? (
                                                <button
                                                    onClick={() =>
                                                        openImagePreview(
                                                            ticket.image!,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-lg px-1 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200"
                                                >
                                                    <img
                                                        src={ticket.image}
                                                        alt=""
                                                        className="h-20 w-20 rounded-sm object-cover"
                                                    />
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    No image
                                                </span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {ticket.consumer.name}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <CreditCard className="h-3 w-3" />
                                                    {
                                                        ticket.consumer
                                                            .account_number
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getSubjectBadge(ticket.subject)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs text-sm text-gray-900">
                                                {truncateText(
                                                    ticket.message,
                                                    60,
                                                )}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {format(
                                                new Date(ticket.created_at),
                                                'MMM dd, yyyy',
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/customer-support/${ticket.id}`}
                                                    className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(ticket.id)
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
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

                    {/* Empty State */}
                    {tickets.data.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <Search className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">
                                No tickets found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search or filter criteria.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {tickets.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            tickets.current_page - 1,
                                        )
                                    }
                                    disabled={tickets.current_page === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            tickets.current_page + 1,
                                        )
                                    }
                                    disabled={
                                        tickets.current_page ===
                                        tickets.last_page
                                    }
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing{' '}
                                        <span className="font-medium">
                                            {tickets.from || 0}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium">
                                            {tickets.to || 0}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium">
                                            {tickets.total}
                                        </span>{' '}
                                        results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    tickets.current_page - 1,
                                                )
                                            }
                                            disabled={
                                                tickets.current_page === 1
                                            }
                                            className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        {Array.from(
                                            {
                                                length: Math.min(
                                                    5,
                                                    tickets.last_page,
                                                ),
                                            },
                                            (_, i) => {
                                                let page = tickets.current_page;
                                                if (tickets.last_page <= 5) {
                                                    page = i + 1;
                                                } else if (
                                                    tickets.current_page <= 3
                                                ) {
                                                    page = i + 1;
                                                } else if (
                                                    tickets.current_page >=
                                                    tickets.last_page - 2
                                                ) {
                                                    page =
                                                        tickets.last_page -
                                                        4 +
                                                        i;
                                                } else {
                                                    page =
                                                        tickets.current_page -
                                                        2 +
                                                        i;
                                                }
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() =>
                                                            handlePageChange(
                                                                page,
                                                            )
                                                        }
                                                        className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                                            tickets.current_page ===
                                                            page
                                                                ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                                                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            },
                                        )}
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    tickets.current_page + 1,
                                                )
                                            }
                                            disabled={
                                                tickets.current_page ===
                                                tickets.last_page
                                            }
                                            className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl overflow-hidden p-0">
                    <div className="relative flex min-h-[400px] max-h-[80vh] items-center justify-center bg-black/90">
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-h-[80vh] w-auto object-contain"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
