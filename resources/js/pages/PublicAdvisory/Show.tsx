// resources/js/Pages/PublicAdvisory/Show.tsx
import { Head, Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, Calendar, AlertCircle, Wrench, Info } from "lucide-react";
import DashboardLayout from "@/Pages/Layouts/DashboardLayout";
import toast from "react-hot-toast";

interface Advisory {
    id: number;
    title: string;
    description: string;
    type: 'general' | 'emergency' | 'maintenance';
    created_at: string;
    formatted_date: string;
    type_color: string;
}

interface Props {
    advisory: Advisory;
}

export default function PublicAdvisoryShow({ advisory }: Props) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this advisory?')) {
            router.delete(`/public-advisories/${advisory.id}`, {
                onSuccess: () => {
                    toast.success('Advisory deleted successfully');
                    router.visit('/public-advisories');
                },
            });
        }
    };

    const getTypeIcon = () => {
        switch(advisory.type) {
            case 'emergency':
                return <AlertCircle className="w-6 h-6 text-red-600" />;
            case 'maintenance':
                return <Wrench className="w-6 h-6 text-yellow-600" />;
            default:
                return <Info className="w-6 h-6 text-blue-600" />;
        }
    };

    const getTypeBgColor = () => {
        switch(advisory.type) {
            case 'emergency':
                return 'bg-red-50';
            case 'maintenance':
                return 'bg-yellow-50';
            default:
                return 'bg-blue-50';
        }
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
            <Head title={advisory.title} />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/public-advisories"
                        className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Advisories
                    </Link>
                </div>

                {/* Advisory Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Type Header */}
                    <div className={`h-2 bg-${advisory.type_color}-500`}></div>

                    <div className="p-8">
                        {/* Title and Actions */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 ${getTypeBgColor()} rounded-xl`}>
                                    {getTypeIcon()}
                                </div>
                                <div>
                                    <span className={`text-sm font-medium px-3 py-1 rounded-full bg-${advisory.type_color}-100 text-${advisory.type_color}-800`}>
                                        {advisory.type.charAt(0).toUpperCase() + advisory.type.slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Link
                                    href={`/public-advisories/${advisory.id}/edit`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center text-gray-500 mb-6">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Posted on {advisory.formatted_date}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {advisory.title}
                        </h1>

                        {/* Description */}
                        <div className="prose max-w-none">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {advisory.description}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
