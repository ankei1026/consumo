// resources/js/Pages/Dashboard/Index.tsx

import { motion } from 'framer-motion';
import {
    Droplets,
    FileText,
    Users,
    AlertCircle,
    TrendingUp,
    Clock,
    Megaphone,
    Wrench,
    AlertTriangle,
    CheckCircle,
    Circle,
    ChevronRight,
    Calendar,
    MapPin,
    Bell,
    Volume2,
    Home,
    Building2,
    Landmark,
    TrendingDown,
} from 'lucide-react';
import DashboardLayout from '@/pages/Layouts/DashboardLayout';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface PublicAdvisory {
    id: number;
    title: string;
    description: string;
    type: 'emergency' | 'maintenance' | 'general';
    status: 'done' | 'on-going' | 'upcoming';
    affected_areas?: string[];
    scheduled_date?: string;
    created_at: string;
    formatted_date: string;
    type_color: string;
    status_color: string;
}

interface RecentConsumption {
    id: number;
    consumer_name: string;
    consumer_code: string;
    consumption: number;
    start_date: string;
    end_date: string;
    meter_number: string;
    formatted_period: string;
}

interface DashboardProps {
    consumers?: number;
    publicAdvisories?: PublicAdvisory[];
    totalConsumption?: number;
    monthlyData?: number[];
    typeData?: {
        residential: number;
        commercial: number;
        institutional: number;
    };
    recentConsumptions?: RecentConsumption[];
    percentageChange?: number;
    currentYear?: number;
}

export default function Dashboard({
    consumers,
    publicAdvisories = [],
    totalConsumption = 0,
    monthlyData = [],
    typeData = { residential: 0, commercial: 0, institutional: 0 },
    recentConsumptions = [],
    percentageChange = 0,
    currentYear = new Date().getFullYear(),
}: DashboardProps) {
    const [consumerCount, setConsumerCount] = useState(0);

    useEffect(() => {
        if (typeof consumers === 'number') {
            setConsumerCount(consumers);
        } else if (typeof consumers === 'string') {
            setConsumerCount(parseInt(consumers) || 0);
        } else if (Array.isArray(consumers)) {
            setConsumerCount(consumers.length);
        } else {
            setConsumerCount(0);
        }
    }, [consumers]);

    // Prepare monthly chart data
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    const chartData = months.map((month, index) => ({
        name: month,
        consumption: monthlyData[index] || 0,
    }));

    // Prepare pie chart data for consumption by type
    const pieData = [
        {
            name: 'Residential',
            value: typeData.residential,
            color: '#10B981',
            icon: Home,
        },
        {
            name: 'Commercial',
            value: typeData.commercial,
            color: '#3B82F6',
            icon: Building2,
        },
        {
            name: 'Institutional',
            value: typeData.institutional,
            color: '#8B5CF6',
            icon: Landmark,
        },
    ].filter((item) => item.value > 0);

    const stats = [
        {
            name: 'Total Records',
            value: recentConsumptions.length.toString(),
            icon: FileText,
            change: '+12%',
            color: 'blue',
        },
        {
            name: 'Active Consumers',
            value: consumerCount.toString(),
            icon: Users,
            change: '+5%',
            color: 'blue',
        },
        {
            name: 'Total Consumption',
            value: `${totalConsumption.toLocaleString()} m³`,
            icon: Droplets,
            change: `${percentageChange > 0 ? '+' : ''}${percentageChange}%`,
            color: 'blue',
            subtext: `Year ${currentYear}`,
        },
        {
            name: 'Active Advisories',
            value: publicAdvisories
                .filter((a) => a.status !== 'done')
                .length.toString(),
            icon: Megaphone,
            change:
                publicAdvisories.filter((a) => a.status !== 'done').length > 0
                    ? 'Active'
                    : 'None',
            color: 'blue',
        },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'emergency':
                return AlertTriangle;
            case 'maintenance':
                return Wrench;
            case 'general':
                return Megaphone;
            default:
                return Megaphone;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done':
                return CheckCircle;
            case 'on-going':
                return Clock;
            case 'upcoming':
                return Calendar;
            default:
                return Circle;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'on-going':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'upcoming':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
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

    // Get current advisories (only on-going and upcoming)
    const currentAdvisories = publicAdvisories
        .filter((advisory) => advisory.status !== 'done')
        .slice(0, 2);

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Welcome Section */}
                <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Dashboard Overview
                        </h2>
                        <p className="text-gray-600">
                            Monitor and manage water service records and
                            advisories
                        </p>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                >
                    {stats.map((stat) => (
                        <motion.div
                            key={stat.name}
                            whileHover={{ scale: 1.02 }}
                            className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="relative z-10">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-lg bg-blue-100 p-3">
                                        <stat.icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {stat.value}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {stat.name}
                                </p>
                                {stat.subtext && (
                                    <p className="mt-1 text-xs text-gray-400">
                                        {stat.subtext}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Charts and Public Advisories */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Chart Area - Monthly Consumption */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Monthly Water Consumption
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Total water consumption per month (
                                    {currentYear})
                                </p>
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#E5E7EB"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#6B7280"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        tick={{ fontSize: 12 }}
                                        label={{
                                            value: 'Consumption (m³)',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: {
                                                fill: '#6B7280',
                                                fontSize: 12,
                                            },
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                        }}
                                        formatter={(value: number) => [
                                            `${value.toLocaleString()} m³`,
                                            'Consumption',
                                        ]}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="consumption"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        dot={{
                                            fill: '#3B82F6',
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{ r: 6 }}
                                        name="Water Consumption (m³)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Consumption by Type - Pie Chart */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Consumption by Type
                            </h3>
                            <p className="text-sm text-gray-500">
                                Breakdown by connection type ({currentYear})
                            </p>
                        </div>
                        <div className="h-64">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name} ${(percent * 100).toFixed(0)}%`
                                            }
                                            labelLine={false}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [
                                                `${value.toLocaleString()} m³`,
                                                'Consumption',
                                            ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-gray-400">
                                        No consumption data available
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {pieData.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.name}
                                        className="text-center"
                                    >
                                        <div className="mb-1 flex justify-center">
                                            <Icon
                                                className="h-4 w-4"
                                                style={{ color: item.color }}
                                            />
                                        </div>
                                        <p className="text-xs font-medium text-gray-700">
                                            {item.name}
                                        </p>
                                        <p
                                            className="text-sm font-semibold"
                                            style={{ color: item.color }}
                                        >
                                            {item.value.toLocaleString()} m³
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Recent Records Section */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Recent Water Consumption Records
                            </h3>
                            <p className="text-sm text-gray-500">
                                Latest meter readings and consumption data
                            </p>
                        </div>
                        <Link
                            href="/water-consumptions"
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-800"
                        >
                            View All Records
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {recentConsumptions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Consumer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Meter No.
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Period
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Consumption
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentConsumptions.map((record) => (
                                        <tr
                                            key={record.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {record.consumer_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        custcode: {record.consumer_code}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                                {record.meter_number}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {record.formatted_period}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-sm font-semibold text-blue-700">
                                                    <Droplets className="h-3 w-3" />
                                                    {record.consumption} m³
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                            <div className="text-center">
                                <Droplets className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                <p className="text-gray-400">
                                    No consumption records yet
                                </p>
                                <p className="text-xs text-gray-400">
                                    Start adding water consumption records
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Public Advisories Section */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                    <div className="border-b border-gray-100 p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Megaphone className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Public Advisories
                                </h3>
                            </div>
                            <Link
                                href="/public-advisories"
                                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                View All
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="p-5">
                        {currentAdvisories.length === 0 ? (
                            <div className="py-8 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                                    <Bell className="h-6 w-6 text-blue-400" />
                                </div>
                                <p className="text-sm text-gray-500">
                                    No active advisories at the moment
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    All systems are operating normally
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {currentAdvisories.map((advisory, index) => {
                                    const TypeIcon = getTypeIcon(advisory.type);
                                    const StatusIcon = getStatusIcon(
                                        advisory.status,
                                    );

                                    return (
                                        <motion.div
                                            key={advisory.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md"
                                        >
                                            <div className="p-5">
                                                {/* Header with Type and Status */}
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="rounded-lg bg-blue-50 p-1.5">
                                                            <TypeIcon className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <span className="text-xs font-medium text-blue-600 capitalize">
                                                            {advisory.type}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(advisory.status)}`}
                                                    >
                                                        <StatusIcon className="h-3 w-3" />
                                                        <span>
                                                            {advisory.status ===
                                                            'on-going'
                                                                ? 'On-going'
                                                                : advisory.status
                                                                      .charAt(0)
                                                                      .toUpperCase() +
                                                                  advisory.status.slice(
                                                                      1,
                                                                  )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <h4 className="mb-2 text-base font-bold text-gray-900">
                                                    {advisory.title}
                                                </h4>

                                                {/* Description */}
                                                <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                                                    {advisory.description}
                                                </p>

                                                {/* Additional Info */}
                                                <div className="space-y-2">
                                                    {advisory.affected_areas &&
                                                        advisory.affected_areas
                                                            .length > 0 && (
                                                            <div className="flex items-start gap-2">
                                                                <MapPin className="mt-0.5 h-3.5 w-3.5 text-gray-400" />
                                                                <span className="text-xs text-gray-500">
                                                                    Affected:{' '}
                                                                    {advisory.affected_areas.join(
                                                                        ', ',
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}

                                                    {advisory.scheduled_date && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                Scheduled:{' '}
                                                                {new Date(
                                                                    advisory.scheduled_date,
                                                                ).toLocaleDateString(
                                                                    'en-PH',
                                                                    {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                                            Posted:{' '}
                                                            {
                                                                advisory.formatted_date
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
}
