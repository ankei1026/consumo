import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Droplets,
    User,
    Calendar,
    Ruler,
    TrendingUp,
    AlertCircle,
    Search,
    X,
    ChevronRight,
    Phone,
    MapPin,
    Info,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Upload,
    FileSpreadsheet,
    FileText,
    CheckCircle,
    Loader2,
} from 'lucide-react';
import DashboardLayout from '@/Pages/Layouts/DashboardLayout';
import toast from 'react-hot-toast';

// Import shadcn components
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Consumer {
    custcode: string;
    name: string;
    address: string;
    connection_type: string;
    mobile_number?: string;
    account_number?: string;
    meter_number?: string;
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

interface LastReadingData {
    current_reading: number;
    end_date: string;
    start_date: string;
}

interface Props {
    consumers: Consumer[];
    errors?: any;
}

export default function WaterConsumptionCreate({ consumers, errors }: Props) {
    const [formData, setFormData] = useState({
        custcode: '',
        current_reading: '',
        previous_reading: '',
        consumption: '',
        start_date: '',
        end_date: '',
    });

    const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(
        null,
    );
    const [processing, setProcessing] = useState(false);
    const [autoCalculated, setAutoCalculated] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [isLoadingReading, setIsLoadingReading] = useState(false);
    const [noPreviousReading, setNoPreviousReading] = useState(false);
    const [lastReadingData, setLastReadingData] =
        useState<LastReadingData | null>(null);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>(
        [],
    );
    const [selectedMonthDisplay, setSelectedMonthDisplay] =
        useState<string>('');
    const [currentYearIndex, setCurrentYearIndex] = useState(0);
    const [yearsList, setYearsList] = useState<number[]>([]);

    // Import related states
    const [showImportModal, setShowImportModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Refs for click outside detection
    const monthPickerRef = useRef<HTMLDivElement>(null);
    const monthButtonRef = useRef<HTMLButtonElement>(null);

    // Filter consumers based on search and type
    const filteredConsumers = consumers.filter((consumer) => {
        const matchesSearch =
            consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consumer.custcode
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (consumer.mobile_number &&
                consumer.mobile_number.includes(searchTerm));

        const matchesType =
            selectedType === 'all' || consumer.connection_type === selectedType;

        return matchesSearch && matchesType;
    });

    // Get unique connection types for filter
    const connectionTypes = [
        'all',
        ...new Set(consumers.map((c) => c.connection_type)),
    ];

    // Format date for display
    const formatDateForDisplay = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Format short date for month picker
    const formatShortDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Group months by year and get unique years
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

    // Click outside handler
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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMonthPicker]);

    // Reset import form
    const resetImportForm = () => {
        setCsvFile(null);
        setUploadProgress(0);
        setImporting(false);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle file selection
    const handleFileSelect = (selectedFile: File) => {
        setCsvFile(selectedFile);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (
            droppedFile &&
            (droppedFile.type === 'text/csv' ||
                droppedFile.name.endsWith('.csv'))
        ) {
            handleFileSelect(droppedFile);
        } else {
            toast.error('Please upload a valid CSV file');
        }
    };

    const handleImportClick = () => {
        if (!csvFile) {
            toast.error('Please select a CSV file');
            return;
        }
        setShowConfirmDialog(true);
    };

    const confirmImport = () => {
        setShowConfirmDialog(false);
        setImporting(true);

        const formData = new FormData();
        formData.append('csv_file', csvFile);

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        const loadingToast = toast.loading(
            'Importing water consumption records...',
        );

        router.post('/water-consumptions/import', formData, {
            onSuccess: (response) => {
                clearInterval(interval);
                setUploadProgress(100);
                toast.dismiss(loadingToast);
                setTimeout(() => {
                    toast.success(
                        response.props.flash?.success ||
                            'Import completed successfully!',
                        {
                            icon: (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ),
                            duration: 5000,
                        },
                    );
                    setShowImportModal(false);
                    resetImportForm();
                    router.visit('/water-consumptions');
                }, 500);
            },
            onError: (errors) => {
                clearInterval(interval);
                toast.dismiss(loadingToast);
                setImporting(false);
                setUploadProgress(0);
                if (errors.error) {
                    toast.error(errors.error, {
                        duration: 8000,
                    });
                } else {
                    toast.error(
                        'Import failed. Please check your CSV file format.',
                        {
                            duration: 5000,
                        },
                    );
                }
            },
            onFinish: () => {
                setImporting(false);
            },
        });
    };

    const downloadTemplate = () => {
        window.location.href = '/water-consumptions/import-template';
        toast.success('Downloading template...');
    };

    // Function to fetch last reading and available months
    const fetchLastReading = async (custcode: string) => {
        setIsLoadingReading(true);

        try {
            const response = await fetch(
                `/water-consumptions/last-reading/${custcode}`,
            );
            const data = await response.json();

            // Set available months
            if (data.availableMonths && Array.isArray(data.availableMonths)) {
                setAvailableMonths(data.availableMonths);

                // Set default month from server
                if (data.defaultMonth) {
                    const defaultMonth = data.defaultMonth;
                    setSelectedMonthDisplay(defaultMonth.display);
                    setFormData((prev) => ({
                        ...prev,
                        start_date: defaultMonth.start_date,
                        end_date: defaultMonth.end_date,
                    }));
                }
            }

            if (
                data.lastReading &&
                data.lastReading.current_reading !== undefined
            ) {
                // Has previous reading
                setLastReadingData(data.lastReading);
                setFormData((prev) => ({
                    ...prev,
                    previous_reading:
                        data.lastReading.current_reading.toString(),
                }));
                setAutoCalculated(true);
                setNoPreviousReading(false);

                toast.success(
                    `Previous reading loaded: ${data.lastReading.current_reading} m³`,
                    {
                        icon: '📊',
                        duration: 3000,
                    },
                );
            } else {
                // No previous reading
                setLastReadingData(null);
                setFormData((prev) => ({
                    ...prev,
                    previous_reading: '0',
                }));
                setAutoCalculated(false);
                setNoPreviousReading(true);

                toast.info(
                    'First reading for this consumer. Starting from 0.',
                    {
                        icon: 'ℹ️',
                        duration: 3000,
                    },
                );
            }
        } catch (error) {
            console.error('Error fetching last reading:', error);
            setFormData((prev) => ({
                ...prev,
                previous_reading: '0',
            }));
            setNoPreviousReading(true);
            toast.error('Failed to load previous reading. Starting from 0.');
        } finally {
            setIsLoadingReading(false);
        }
    };

    // Handle month selection
    const handleMonthSelect = (month: AvailableMonth) => {
        // Display the month name and year (the billing month)
        setSelectedMonthDisplay(month.display);

        // Set the dates - start_date is the 2nd of selected month
        // end_date is the 2nd of next month (already provided by the API)
        setFormData((prev) => ({
            ...prev,
            start_date: month.start_date,
            end_date: month.end_date,
        }));

        setShowMonthPicker(false);

        // Show confirmation toast with proper period format
        toast.success(
            `Selected: ${month.display} - Reading period: ${formatShortDate(month.start_date)} → ${formatShortDate(month.end_date)}`,
            {
                icon: '📅',
                duration: 3000,
            },
        );
    };

    useEffect(() => {
        if (formData.custcode && selectedConsumer) {
            fetchLastReading(formData.custcode);
        }
    }, [formData.custcode, selectedConsumer]);

    useEffect(() => {
        // Auto-calculate consumption
        const current = parseFloat(formData.current_reading);
        const previous = parseFloat(formData.previous_reading);

        if (!isNaN(current) && !isNaN(previous)) {
            if (current >= previous) {
                const consumption = current - previous;
                setFormData((prev) => ({
                    ...prev,
                    consumption: consumption.toString(),
                }));
            } else if (current < previous && current !== 0 && previous !== 0) {
                toast.error(
                    'Current reading cannot be less than previous reading',
                );
                setFormData((prev) => ({
                    ...prev,
                    consumption: '',
                }));
            }
        }
    }, [formData.current_reading, formData.previous_reading]);

    const handleSelectConsumer = (consumer: Consumer) => {
        setSelectedConsumer(consumer);
        // Reset form data when selecting new consumer
        setFormData({
            custcode: consumer.custcode,
            current_reading: '',
            previous_reading: '',
            consumption: '',
            start_date: '',
            end_date: '',
        });
        setAutoCalculated(false);
        setNoPreviousReading(false);
        setLastReadingData(null);
        setAvailableMonths([]);
        setSelectedMonthDisplay('');
        setIsModalOpen(false);
        setSearchTerm('');
        setCurrentYearIndex(0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!selectedConsumer) {
            toast.error('Please select a consumer');
            return;
        }

        if (!formData.current_reading) {
            toast.error('Please enter current reading');
            return;
        }

        if (!formData.start_date) {
            toast.error('Please select reading month');
            return;
        }

        if (!formData.end_date) {
            toast.error('Please select end date');
            return;
        }

        const current = parseFloat(formData.current_reading);
        const previous = parseFloat(formData.previous_reading);

        if (current < previous) {
            toast.error('Current reading cannot be less than previous reading');
            return;
        }

        if (!formData.consumption || parseFloat(formData.consumption) < 0) {
            toast.error('Please enter valid readings to calculate consumption');
            return;
        }

        setProcessing(true);
        const loadingToast = toast.loading(
            'Creating water consumption record...',
        );

        router.post('/water-consumptions', formData, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success(
                    'Water consumption record created successfully!',
                    {
                        icon: '🎉',
                        duration: 3000,
                    },
                );
                router.visit('/water-consumptions');
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                if (errors && typeof errors === 'object') {
                    Object.values(errors).forEach((error: any) => {
                        if (typeof error === 'string') {
                            toast.error(error, {
                                icon: '❌',
                                duration: 4000,
                            });
                        }
                    });
                } else {
                    toast.error('Failed to create water consumption record', {
                        icon: '❌',
                        duration: 4000,
                    });
                }
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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

    // Create a map of available months for quick lookup
    const availableMonthsMap = new Map();
    availableMonths.forEach((month) => {
        availableMonthsMap.set(`${month.year}-${month.month}`, month);
    });

    return (
        <DashboardLayout>
            <Head title="Create Water Consumption Record" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-3xl"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link
                                href="/water-consumptions"
                                className="mb-4 inline-flex items-center text-gray-600 hover:text-blue-600"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Records
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Add Water Consumption Record
                            </h1>
                            <p className="text-gray-600">
                                Record monthly water consumption readings or
                                import via CSV
                            </p>
                        </div>

                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                        </button>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.form
                    variants={itemVariants}
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl bg-white p-6 shadow-sm"
                >
                    {/* Consumer Selection */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Select Consumer *
                        </label>

                        {!selectedConsumer ? (
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-700">
                                                Click to select a consumer
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Search from {consumers.length}{' '}
                                                consumers
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-blue-600" />
                                            <h3 className="font-semibold text-blue-900">
                                                {selectedConsumer.name}
                                            </h3>
                                            <span className="rounded-full bg-blue-200 px-2 py-0.5 text-xs text-blue-700">
                                                {
                                                    selectedConsumer.connection_type
                                                }
                                            </span>
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm text-blue-700">
                                                <span className="font-medium">
                                                    custcode:
                                                </span>{' '}
                                                {selectedConsumer.custcode}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedConsumer(null);
                                            setFormData({
                                                custcode: '',
                                                current_reading: '',
                                                previous_reading: '',
                                                consumption: '',
                                                start_date: '',
                                                end_date: '',
                                            });
                                            setAutoCalculated(false);
                                            setNoPreviousReading(false);
                                            setLastReadingData(null);
                                            setAvailableMonths([]);
                                            setSelectedMonthDisplay('');
                                        }}
                                        className="rounded-lg p-1 text-blue-600 hover:bg-blue-100"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        {errors?.custcode && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.custcode}
                            </p>
                        )}
                    </div>

                    {/* Loading State */}
                    {isLoadingReading && selectedConsumer && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-lg bg-blue-50 p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                <p className="text-sm text-blue-700">
                                    Loading previous reading...
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Reading Month Selection - Yearly View */}
                    <div className="relative">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Select Reading Month *
                        </label>
                        <div className="relative">
                            <button
                                ref={monthButtonRef}
                                type="button"
                                onClick={() =>
                                    availableMonths.length > 0 &&
                                    setShowMonthPicker(!showMonthPicker)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-10 pl-10 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                disabled={availableMonths.length === 0}
                            >
                                <Calendar className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <span className="block truncate text-gray-700">
                                    {selectedMonthDisplay ||
                                        (availableMonths.length > 0
                                            ? 'Select reading month'
                                            : 'Loading months...')}
                                </span>
                                <ChevronDown className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            </button>
                        </div>

                        {/* Yearly Month Picker Dropdown */}
                        {showMonthPicker &&
                            availableMonths.length > 0 &&
                            yearsList.length > 0 && (
                                <div
                                    ref={monthPickerRef}
                                    className="absolute right-0 left-0 z-20 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg"
                                >
                                    {/* Year Navigation */}
                                    <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 p-3">
                                        <button
                                            type="button"
                                            onClick={goToPreviousYear}
                                            disabled={currentYearIndex === 0}
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
                                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>

                                    {/* Months Grid */}
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
                                                        formData.start_date ===
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
                                                                        `${monthName} ${currentYear} is not available for reading`,
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

                                        {/* Legend */}
                                        <div className="mt-4 flex items-center justify-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <div className="h-3 w-3 rounded border border-gray-300 bg-white"></div>
                                                <span>Available</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="h-3 w-3 rounded bg-blue-600"></div>
                                                <span>Selected</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="h-3 w-3 rounded border border-gray-200 bg-gray-100"></div>
                                                <span>Not Available</span>
                                            </div>
                                        </div>

                                        {/* Example note */}
                                        <div className="mt-3 rounded bg-blue-50 p-2 text-center">
                                            <p className="text-xs text-blue-700">
                                                📅 Example: For January billing,
                                                reading period is Jan 2 → Feb 2
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        <p className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                            <CalendarDays className="h-3 w-3" />
                            Example: January billing → Jan 2 → Feb 2
                        </p>
                        {errors?.start_date && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.start_date}
                            </p>
                        )}
                    </div>

                    {/* Previous Reading Info */}
                    {autoCalculated &&
                        !isLoadingReading &&
                        selectedConsumer &&
                        lastReadingData && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg bg-green-50 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-1 h-5 w-5 text-green-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-800">
                                            Previous reading loaded successfully
                                        </p>
                                        <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                            <div>
                                                <p className="text-xs text-green-700">
                                                    Previous Reading
                                                </p>
                                                <p className="font-semibold text-green-900">
                                                    {
                                                        lastReadingData.current_reading
                                                    }{' '}
                                                    m³
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-green-700">
                                                    Previous Period
                                                </p>
                                                <p className="text-xs text-green-800">
                                                    {formatShortDate(
                                                        lastReadingData.start_date,
                                                    )}{' '}
                                                    →{' '}
                                                    {formatShortDate(
                                                        lastReadingData.end_date,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    {/* No Previous Reading Info */}
                    {noPreviousReading &&
                        !isLoadingReading &&
                        selectedConsumer && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg bg-yellow-50 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <Info className="mt-1 h-5 w-5 text-yellow-600" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">
                                            First Reading for this Consumer
                                        </p>
                                        <p className="mt-1 text-xs text-yellow-700">
                                            No previous reading found. Previous
                                            reading has been set to 0
                                            automatically.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    {/* Readings Section */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Previous Reading */}
                        <div>
                            <label
                                htmlFor="previous_reading"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Previous Reading (m³) *
                            </label>
                            <div className="relative">
                                <Ruler className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="number"
                                    id="previous_reading"
                                    name="previous_reading"
                                    value={formData.previous_reading}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    readOnly={autoCalculated}
                                    className={`w-full rounded-lg border py-2.5 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                                        autoCalculated
                                            ? 'cursor-not-allowed bg-gray-50 text-gray-600'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="0.00"
                                />
                            </div>
                            {!autoCalculated && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Enter previous reading manually
                                </p>
                            )}
                            {errors?.previous_reading && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.previous_reading}
                                </p>
                            )}
                        </div>

                        {/* Current Reading */}
                        <div>
                            <label
                                htmlFor="current_reading"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Current Reading (m³) *
                            </label>
                            <div className="relative">
                                <Ruler className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="number"
                                    id="current_reading"
                                    name="current_reading"
                                    value={formData.current_reading}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    className="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            {errors?.current_reading && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.current_reading}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Consumption */}
                    <div>
                        <label
                            htmlFor="consumption"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Consumption (m³) *
                        </label>
                        <div className="relative">
                            <TrendingUp className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="number"
                                id="consumption"
                                name="consumption"
                                value={formData.consumption}
                                readOnly
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pr-4 pl-10 text-gray-600"
                                placeholder="Auto-calculated"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Consumption is automatically calculated (Current -
                            Previous)
                        </p>
                        {errors?.consumption && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.consumption}
                            </p>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Link
                            href="/water-consumptions"
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={
                                processing ||
                                !selectedConsumer ||
                                !formData.start_date
                            }
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </motion.form>
            </motion.div>

            {/* Consumer Selection Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="border-b border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Select Consumer
                                    </h2>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, code, or mobile number..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 flex gap-2 overflow-x-auto">
                                    {connectionTypes.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() =>
                                                setSelectedType(type)
                                            }
                                            className={`rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition ${
                                                selectedType === type
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {type === 'all'
                                                ? 'All Types'
                                                : type.charAt(0).toUpperCase() +
                                                  type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-4">
                                {filteredConsumers.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <User className="mx-auto h-12 w-12 text-gray-300" />
                                        <p className="mt-2 text-gray-500">
                                            No consumers found
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Try adjusting your search
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredConsumers.map((consumer) => (
                                            <motion.button
                                                key={consumer.custcode}
                                                whileHover={{ scale: 1.01 }}
                                                onClick={() =>
                                                    handleSelectConsumer(
                                                        consumer,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <span className="font-semibold text-gray-900">
                                                                {consumer.name}
                                                            </span>
                                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                                                {
                                                                    consumer.custcode
                                                                }
                                                            </span>
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-xs ${
                                                                    consumer.connection_type ===
                                                                    'residential'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : consumer.connection_type ===
                                                                            'commercial'
                                                                          ? 'bg-blue-100 text-blue-700'
                                                                          : 'bg-purple-100 text-purple-700'
                                                                }`}
                                                            >
                                                                {
                                                                    consumer.connection_type
                                                                }
                                                            </span>
                                                        </div>

                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 p-4">
                                <p className="text-center text-sm text-gray-500">
                                    {filteredConsumers.length} consumer
                                    {filteredConsumers.length !== 1
                                        ? 's'
                                        : ''}{' '}
                                    found
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Import Dialog */}
            <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                            Import Water Consumption Records
                        </DialogTitle>
                        <DialogDescription>
                            Select a CSV file to import water consumption data.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Enhanced File Upload Area */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
                                isDragging
                                    ? 'border-blue-500 bg-blue-50'
                                    : csvFile
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileInput}
                                className="hidden"
                            />

                            {!csvFile ? (
                                <div className="space-y-3">
                                    <div className="flex justify-center">
                                        <div className="rounded-full bg-white p-3 shadow-sm">
                                            <Upload className="h-10 w-10 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Drag and drop your CSV file here
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            or click to browse
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-2 text-xs text-gray-400">
                                        <span>CSV only</span>
                                        <span>•</span>
                                        <span>Max 2MB</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-blue-100 p-2">
                                            <FileText className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">
                                                {csvFile.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(csvFile.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            resetImportForm();
                                        }}
                                        className="rounded-full p-1 transition-colors hover:bg-gray-200"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Requirements Info */}
                        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>
                                Required columns: custcode, previous_reading,
                                current_reading, start_date, end_date
                            </span>
                        </div>

                        {/* Template Download */}
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={downloadTemplate}
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                            >
                                <FileSpreadsheet className="mr-1 h-4 w-4" />
                                Download CSV Template
                            </button>
                        </div>

                        {importing && (
                            <div className="space-y-2">
                                <Progress
                                    value={uploadProgress}
                                    className="h-2"
                                />
                                <p className="text-center text-sm text-gray-600">
                                    Importing... {uploadProgress}%
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <button
                            onClick={() => setShowImportModal(false)}
                            disabled={importing}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleImportClick}
                            disabled={!csvFile || importing}
                            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import CSV
                                </>
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation AlertDialog */}
            <AlertDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Import</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to import "{csvFile?.name}"?
                            This will create new water consumption records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={importing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmImport}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Yes, Import
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
