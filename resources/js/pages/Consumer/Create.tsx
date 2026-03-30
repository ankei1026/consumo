// resources/js/Pages/Consumer/Create.tsx

import { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    User,
    Phone,
    Home,
    Building2,
    Landmark,
    MapPin,
    Ruler,
    CreditCard,
    Upload,
    X,
    AlertCircle,
    FileSpreadsheet,
    CheckCircle,
    Loader2,
    FileText,
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

interface Props {
    errors?: any;
}

export default function ConsumersCreate({ errors }: Props) {
    const [formData, setFormData] = useState({
        custcode: '',
        account_number: '',
        name: '',
        mobile_number: '',
        address: '',
        meter_number: '',
        connection_type: 'residential',
    });

    const [processing, setProcessing] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const loadingToast = toast.loading('Creating consumer...');

        router.post('/consumers', formData, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Consumer created successfully!', {
                    icon: '🎉',
                    duration: 3000,
                });
                router.visit('/consumers');
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                Object.values(errors).forEach((error: any) => {
                    toast.error(error, {
                        icon: '❌',
                        duration: 4000,
                    });
                });
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

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
        if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
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

        const loadingToast = toast.loading('Importing consumers...');

        router.post('/consumers/import', formData, {
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
                                <CheckCircle className="h-5 w-5 text-blue-500" />
                            ),
                            duration: 5000,
                        },
                    );
                    setShowImportModal(false);
                    resetForm();
                    router.visit('/consumers');
                }, 500);
            },
            onError: (errors) => {
                clearInterval(interval);
                toast.dismiss(loadingToast);
                setImporting(false);
                setUploadProgress(0);
                if (errors.error) {
                    toast.error(errors.error);
                } else {
                    toast.error(
                        'Import failed. Please check your CSV file format.',
                    );
                }
            },
            onFinish: () => {
                setImporting(false);
            },
        });
    };

    const resetForm = () => {
        setCsvFile(null);
        setUploadProgress(0);
        setImporting(false);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
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

    const connectionTypes = [
        {
            value: 'residential',
            label: 'Residential',
            icon: Home,
            description: 'For households',
        },
        {
            value: 'commercial',
            label: 'Commercial',
            icon: Building2,
            description: 'For businesses',
        },
        {
            value: 'institutional',
            label: 'Institutional',
            icon: Landmark,
            description: 'For government/offices',
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Create Consumer" />

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
                                href="/consumers"
                                className="mb-4 inline-flex items-center text-gray-600 hover:text-blue-600"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Consumers
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Add New Consumer
                            </h1>
                            <p className="text-gray-600">
                                Enter consumer details manually or import via
                                CSV
                            </p>
                        </div>

                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                    {/* Customer Code */}
                    <div>
                        <label
                            htmlFor="custcode"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Customer Code *
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                id="custcode"
                                value={formData.custcode}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="000001"
                            />
                        </div>
                        {errors?.custcode && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.custcode}
                            </p>
                        )}
                    </div>

                    {/* Account Number */}
                    <div>
                        <label
                            htmlFor="account_number"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Account Number *
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                id="account_number"
                                value={formData.account_number}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="XXXX-XX-XXX"
                            />
                        </div>
                        {errors?.account_number && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.account_number}
                            </p>
                        )}
                    </div>

                    {/* Meter Number */}
                    <div>
                        <label
                            htmlFor="meter_number"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Meter Number *
                        </label>
                        <div className="relative">
                            <Ruler className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                id="meter_number"
                                value={formData.meter_number}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="XXXXXXXX"
                            />
                        </div>
                        {errors?.meter_number && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.meter_number}
                            </p>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Full Name *
                        </label>
                        <div className="relative">
                            <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="Juan Dela Cruz"
                            />
                        </div>
                        {errors?.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                        <label
                            htmlFor="mobile_number"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Mobile Number *
                        </label>
                        <div className="relative">
                            <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                id="mobile_number"
                                value={formData.mobile_number}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="09171234567"
                            />
                        </div>
                        {errors?.mobile_number && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.mobile_number}
                            </p>
                        )}
                    </div>

                    {/* Connection Type */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Connection Type *
                        </label>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {connectionTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected =
                                    formData.connection_type === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                connection_type: type.value,
                                            })
                                        }
                                        className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon
                                            className={`mb-2 h-8 w-8 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}
                                        />
                                        <span className="text-sm font-medium">
                                            {type.label}
                                        </span>
                                        <span className="mt-1 text-xs text-gray-500">
                                            {type.description}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors?.connection_type && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.connection_type}
                            </p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label
                            htmlFor="address"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Address
                        </label>
                        <div className="relative">
                            <MapPin className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <textarea
                                id="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="123 Main St, Barangay, City"
                            />
                        </div>
                        {errors?.address && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Link
                            href="/consumers"
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Consumer'}
                        </button>
                    </div>
                </motion.form>
            </motion.div>

            {/* Import Dialog */}
            <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                            Import Consumers
                        </DialogTitle>
                        <DialogDescription>
                            Select a CSV file to import consumer data.
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
                                            resetForm();
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
                                Required columns: custcode, account_number,
                                name, mobile_number, meter_number, connection_type
                            </span>
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
                            This will create new consumer records.
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
