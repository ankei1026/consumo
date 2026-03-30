// Pages/WaterConsumption/Index.tsx (Corrected)

import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Droplets,
    Calendar,
    TrendingUp,
    Users,
    FileDown,
    Filter,
    ChevronDown,
    Loader2,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    X,
} from 'lucide-react';
import DashboardLayout from '@/Pages/Layouts/DashboardLayout';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';

interface WaterConsumption {
    id: number;
    custcode: string;
    current_reading: number;
    previous_reading: number;
    consumption: number;
    start_date: string;
    end_date: string;
    created_at: string;
    consumer?: {
        name: string;
        address: string;
        connection_type: string;
    };
}

interface AvailableMonth {
    year: number;
    month: number;
    month_name: string;
    start_date: string;
    end_date: string;
    display: string;
    period: string;
}

interface Props {
    waterConsumptions: {
        data: WaterConsumption[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search: string;
        date_from?: string;
        date_to?: string;
        connection_type?: string;
    };
    availableMonths?: AvailableMonth[];
}

export default function WaterConsumptionIndex({
    waterConsumptions,
    filters,
    availableMonths = [],
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedMonth, setSelectedMonth] = useState<AvailableMonth | null>(
        null,
    );
    const [typeFilter, setTypeFilter] = useState<string>(
        filters.connection_type || 'all',
    );
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [currentYearIndex, setCurrentYearIndex] = useState(0);
    const [yearsList, setYearsList] = useState<number[]>([]);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    // Refs for click outside detection
    const monthPickerRef = useRef<HTMLDivElement>(null);
    const monthButtonRef = useRef<HTMLButtonElement>(null);
    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const typeButtonRef = useRef<HTMLButtonElement>(null);

    // Debounced search function
    const debouncedSearch = useRef(
        debounce(
            (search: string, type: string, month: AvailableMonth | null) => {
                router.get(
                    '/water-consumptions',
                    {
                        search: search,
                        start_date: month?.start_date || '',
                        end_date: month?.end_date || '',
                        connection_type: type,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );
            },
            500,
        ),
    ).current;

    // Auto-apply filters when any filter changes
    useEffect(() => {
        debouncedSearch(searchTerm, typeFilter, selectedMonth);

        // Cleanup
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm, typeFilter, selectedMonth]);

    // Get unique years from available months
    useEffect(() => {
        if (availableMonths.length > 0) {
            const uniqueYears = [
                ...new Set(availableMonths.map((m) => m.year)),
            ].sort((a, b) => a - b);
            setYearsList(uniqueYears);
            setCurrentYearIndex(0);
        }
    }, [availableMonths]);

    // Get current year display
    const getCurrentYear = () => {
        return yearsList[currentYearIndex] || null;
    };

    // Navigation handlers
    const goToPreviousYear = () => {
        if (currentYearIndex > 0) {
            setCurrentYearIndex(currentYearIndex - 1);
        }
    };

    const goToNextYear = () => {
        if (currentYearIndex < yearsList.length - 1) {
            setCurrentYearIndex(currentYearIndex + 1);
        }
    };

    // Click outside handler for month picker
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showMonthPicker &&
                monthPickerRef.current &&
                !monthPickerRef.current.contains(event.target as Node) &&
                monthButtonRef.current &&
                !monthButtonRef.current.contains(event.target as Node)
            ) {
                setShowMonthPicker(false);
            }
            if (
                showTypeDropdown &&
                typeDropdownRef.current &&
                !typeDropdownRef.current.contains(event.target as Node) &&
                typeButtonRef.current &&
                !typeButtonRef.current.contains(event.target as Node)
            ) {
                setShowTypeDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMonthPicker, showTypeDropdown]);

    // Format date for display
    const formatShortDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Calculate stats
    const totalRecords = waterConsumptions.total;
    const totalConsumption = waterConsumptions.data.reduce(
        (sum, item) => sum + item.consumption,
        0,
    );
    const averageConsumption =
        waterConsumptions.data.length > 0
            ? Math.round(totalConsumption / waterConsumptions.data.length)
            : 0;
    const activeConsumers = waterConsumptions.data.filter(
        (item, index, self) =>
            self.findIndex((t) => t.custcode === item.custcode) === index,
    ).length;

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

    const handleMonthSelect = (month: AvailableMonth) => {
        setSelectedMonth(month);
        setShowMonthPicker(false);

        toast.success(
            `Filtering by: ${month.display} - ${formatShortDate(month.start_date)} → ${formatShortDate(month.end_date)}`,
            {
                icon: '📅',
                duration: 2000,
            },
        );
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedMonth(null);
        setTypeFilter('all');
        setCurrentYearIndex(0);
        setShowMonthPicker(false);
        setShowTypeDropdown(false);

        // Immediate reset without debounce
        router.get('/water-consumptions', {}, { preserveState: true });

    };

    const clearMonthFilter = () => {
        setSelectedMonth(null);
    };

    const clearSearchFilter = () => {
        setSearchTerm('');
    };

    const clearTypeFilter = () => {
        setTypeFilter('all');
    };

    const handleDelete = (id: number, name: string) => {
        if (
            confirm(
                `Are you sure you want to delete water consumption record for ${name}?`,
            )
        ) {
            setDeletingId(id);
            const loadingToast = toast.loading('Deleting record...');

            router.delete(`/water-consumptions/${id}`, {
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success(
                        'Water consumption record deleted successfully',
                    );
                    setDeletingId(null);
                },
                onError: () => {
                    toast.dismiss(loadingToast);
                    toast.error('Failed to delete record');
                    setDeletingId(null);
                },
            });
        }
    };

    const getConsumptionStatus = (consumption: number) => {
        if (consumption < 10)
            return {
                color: 'text-green-800',
                bg: 'bg-green-100',
                label: 'Low',
            };
        if (consumption < 30)
            return {
                color: 'text-yellow-800',
                bg: 'bg-yellow-100',
                label: 'Normal',
            };
        if (consumption < 50)
            return {
                color: 'text-orange-800',
                bg: 'bg-orange-100',
                label: 'High',
            };
        return { color: 'text-red-800', bg: 'bg-red-100', label: 'Critical' };
    };

    const getConnectionTypeColor = (type?: string) => {
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

    const pagination = waterConsumptions;

    const formatDateRange = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const startMonth = start.toLocaleString('en-PH', { month: 'short' });
        const startDay = start.getDate();
        const endMonth = end.toLocaleString('en-PH', { month: 'short' });
        const endDay = end.getDate();

        return `${startMonth} ${startDay} → ${endMonth} ${endDay}`;
    };

    const monthsOfYear = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const availableMonthsMap = new Map();
    availableMonths.forEach((month) => {
        availableMonthsMap.set(`${month.year}-${month.month}`, month);
    });

    const hasAvailableMonths = availableMonths && availableMonths.length > 0;

    const connectionTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'residential', label: 'Residential' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'institutional', label: 'Institutional' },
    ];

    return (
        <DashboardLayout>
            <Head title="Water Consumption Records" />

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
                            Water Consumption Records
                        </h1>
                        <p className="text-gray-600">
                            Manage and monitor water consumption readings
                        </p>
                    </div>
                    <Link
                        href="/water-consumptions/create"
                        className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Reading
                    </Link>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                >
                    {/* Total Records Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="relative z-10">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <Droplets className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {totalRecords.toLocaleString()}
                            </h3>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Total Records
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Total consumption records
                            </p>
                        </div>
                    </motion.div>

                    {/* Total Consumption Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="relative z-10">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <TrendingUp className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {totalConsumption.toLocaleString()} m³
                            </h3>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Total Consumption
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Cubic meters consumed
                            </p>
                        </div>
                    </motion.div>

                    {/* Average Consumption Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="relative z-10">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {averageConsumption.toLocaleString()} m³
                            </h3>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Average Consumption
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Per reading period
                            </p>
                        </div>
                    </motion.div>

                    {/* Active Consumers Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="relative z-10">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {activeConsumers.toLocaleString()}
                            </h3>
                            <p className="mt-1 text-sm font-medium text-gray-600">
                                Active Consumers
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                With consumption records
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Filters and Search */}
                <motion.div
                    variants={itemVariants}
                    className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by consumer name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filter Row */}
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Month Picker Dropdown */}
                        <div className="relative min-w-[220px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Reading Period
                            </label>
                            <button
                                ref={monthButtonRef}
                                type="button"
                                onClick={() =>
                                    hasAvailableMonths &&
                                    setShowMonthPicker(!showMonthPicker)
                                }
                                className={`relative w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-10 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                                    !hasAvailableMonths
                                        ? 'cursor-not-allowed opacity-50'
                                        : ''
                                }`}
                                disabled={!hasAvailableMonths}
                            >
                                <Calendar className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <span className="block truncate text-gray-700">
                                    {selectedMonth?.display || 'All Periods'}
                                </span>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            </button>

                            {/* Month Picker Dropdown */}
                            {showMonthPicker &&
                                hasAvailableMonths &&
                                yearsList.length > 0 && (
                                    <div
                                        ref={monthPickerRef}
                                        className="absolute right-0 left-0 z-20 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg"
                                    >
                                        <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 p-3">
                                            <button
                                                type="button"
                                                onClick={goToPreviousYear}
                                                disabled={
                                                    currentYearIndex === 0
                                                }
                                                className={`rounded p-1 transition hover:bg-gray-200 ${
                                                    currentYearIndex === 0
                                                        ? 'cursor-not-allowed opacity-50'
                                                        : ''
                                                }`}
                                            >
                                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {getCurrentYear()}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={goToNextYear}
                                                disabled={
                                                    currentYearIndex ===
                                                    yearsList.length - 1
                                                }
                                                className={`rounded p-1 transition hover:bg-gray-200 ${
                                                    currentYearIndex ===
                                                    yearsList.length - 1
                                                        ? 'cursor-not-allowed opacity-50'
                                                        : ''
                                                }`}
                                            >
                                                <ChevronRight className="h-5 w-5 text-gray-600" />
                                            </button>
                                        </div>

                                        <div className="p-4">
                                            <div className="grid grid-cols-3 gap-3">
                                                {monthsOfYear.map(
                                                    (monthName, index) => {
                                                        const monthNumber =
                                                            index + 1;
                                                        const currentYear =
                                                            getCurrentYear();
                                                        const monthKey = `${currentYear}-${monthNumber}`;
                                                        const availableMonth =
                                                            availableMonthsMap.get(
                                                                monthKey,
                                                            );
                                                        const isAvailable =
                                                            !!availableMonth;
                                                        const isSelected =
                                                            selectedMonth?.start_date ===
                                                            availableMonth?.start_date;

                                                        return (
                                                            <button
                                                                key={monthKey}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (
                                                                        isAvailable &&
                                                                        availableMonth
                                                                    ) {
                                                                        handleMonthSelect(
                                                                            availableMonth,
                                                                        );
                                                                    } else {
                                                                        toast.error(
                                                                            `${monthName} ${currentYear} has no records`,
                                                                            {
                                                                                icon: '⚠️',
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                                disabled={
                                                                    !isAvailable
                                                                }
                                                                className={`rounded-lg p-3 text-center transition-all ${
                                                                    isAvailable
                                                                        ? 'cursor-pointer hover:shadow-md'
                                                                        : 'cursor-not-allowed bg-gray-50 opacity-40'
                                                                } ${
                                                                    isSelected
                                                                        ? 'bg-blue-600 text-white shadow-md'
                                                                        : isAvailable
                                                                          ? 'border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                                                                          : 'border border-gray-100 bg-gray-50'
                                                                }`}
                                                            >
                                                                <div className="text-sm font-medium">
                                                                    {monthName.substring(
                                                                        0,
                                                                        3,
                                                                    )}
                                                                </div>
                                                                {isAvailable &&
                                                                    availableMonth && (
                                                                        <div className="mt-1 text-[10px] leading-tight opacity-75">
                                                                            {formatShortDate(
                                                                                availableMonth.start_date,
                                                                            )}{' '}
                                                                            →{' '}
                                                                            {formatShortDate(
                                                                                availableMonth.end_date,
                                                                            )}
                                                                        </div>
                                                                    )}
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Connection Type Filter - Custom Dropdown */}
                        <div className="relative min-w-[150px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Connection Type
                            </label>
                            <button
                                ref={typeButtonRef}
                                type="button"
                                onClick={() =>
                                    setShowTypeDropdown(!showTypeDropdown)
                                }
                                className="relative w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-3 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            >
                                <span className="block truncate text-gray-700">
                                    {connectionTypes.find(
                                        (t) => t.value === typeFilter,
                                    )?.label || 'All Types'}
                                </span>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            </button>

                            {showTypeDropdown && (
                                <div
                                    ref={typeDropdownRef}
                                    className="absolute right-0 left-0 z-20 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg"
                                >
                                    {connectionTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => {
                                                setTypeFilter(type.value);
                                                setShowTypeDropdown(false);
                                            }}
                                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                                                typeFilter === type.value
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Clear All Button - FIXED */}
                        <button
                            onClick={handleResetFilters}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                        >
                            Clear Filter
                        </button>
                    </div>

                    {/* Active Filters Display */}
                    {(searchTerm ||
                        selectedMonth ||
                        (typeFilter && typeFilter !== 'all')) && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2">
                            <span className="text-xs text-gray-500">
                                Active filters:
                            </span>
                            {searchTerm && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                    Search: {searchTerm}
                                    <button
                                        onClick={clearSearchFilter}
                                        className="hover:text-blue-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {selectedMonth && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                    {selectedMonth.display}
                                    <button
                                        onClick={clearMonthFilter}
                                        className="hover:text-blue-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {typeFilter && typeFilter !== 'all' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                    Type:{' '}
                                    {
                                        connectionTypes.find(
                                            (t) => t.value === typeFilter,
                                        )?.label
                                    }
                                    <button
                                        onClick={clearTypeFilter}
                                        className="hover:text-blue-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Water Consumption Table */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                    {waterConsumptions.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Droplets className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">
                                No consumption records found
                            </h3>
                            <p className="mb-4 text-gray-600">
                                {searchTerm ||
                                selectedMonth ||
                                (typeFilter && typeFilter !== 'all')
                                    ? 'Try adjusting your filters to see more results.'
                                    : 'Get started by adding your first reading.'}
                            </p>
                            {!(
                                searchTerm ||
                                selectedMonth ||
                                (typeFilter && typeFilter !== 'all')
                            ) && (
                                <Link
                                    href="/water-consumptions/create"
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Reading
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Consumer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Previous Reading
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Current Reading
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Consumption
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Period
                                        </th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Status
                                        </th> */}
                                        <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {waterConsumptions.data.map((record) => {
                                        const status = getConsumptionStatus(
                                            record.consumption,
                                        );
                                        return (
                                            <tr
                                                key={record.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {record.consumer
                                                                ?.name ||
                                                                record.custcode}
                                                        </div>
                                                        <div className="mt-1 flex-row items-center gap-2">
                                                            <span className="text-xs text-gray-500">
                                                                custcode:{' '}
                                                                {
                                                                    record.custcode
                                                                }
                                                            </span>
                                                            {record.consumer
                                                                ?.connection_type && (
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getConnectionTypeColor(record.consumer.connection_type)}`}
                                                                >
                                                                    {
                                                                        record
                                                                            .consumer
                                                                            .connection_type
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {record.previous_reading.toLocaleString()}{' '}
                                                    m³
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {record.current_reading.toLocaleString()}{' '}
                                                    m³
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900">
                                                        {record.consumption.toLocaleString()}{' '}
                                                        m³
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {formatDateRange(
                                                                record.start_date,
                                                                record.end_date,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-400">
                                                        {new Date(
                                                            record.start_date,
                                                        ).toLocaleString(
                                                            'en-PH',
                                                            {
                                                                month: 'long',
                                                                year: 'numeric',
                                                            },
                                                        )}{' '}
                                                        reading
                                                    </div>
                                                </td>
                                                {/* <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${status.bg} ${status.color}`}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </td> */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Link
                                                            href={`/water-consumptions/${record.id}`}
                                                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/water-consumptions/${record.id}/edit`}
                                                            className="rounded p-1 text-green-600 hover:bg-green-50"
                                                            title="Edit Record"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    record.id,
                                                                    record
                                                                        .consumer
                                                                        ?.name ||
                                                                        record.custcode,
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                record.id
                                                            }
                                                            className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                            title="Delete Record"
                                                        >
                                                            {deletingId ===
                                                            record.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.last_page > 1 &&
                        waterConsumptions.data.length > 0 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
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
                                                    link.url &&
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
