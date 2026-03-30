// resources/js/Layouts/DashboardLayout.tsx
import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplets,
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronDown,
    BarChart3,
    MessageSquare,
    AlertCircle,
    UserCircle,
    FileWarning,
    TrendingUp,
    Droplet,
    Receipt,
    ReceiptText,
    Users2,
    MailWarning,
    DropletIcon,
    Megaphone,
    Headphones,
} from 'lucide-react';

interface Props {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const { auth, notifications } = usePage().props as any;
    const [notifOpen, setNotifOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        // Get the path without query parameters
        const getPathWithoutQuery = () => {
            const path = window.location.pathname;
            return path;
        };

        // Set initial path
        setCurrentPath(getPathWithoutQuery());

        // Listen to navigation events
        const removeListener = router.on('navigate', (event: any) => {
            // Get the new URL from the event
            const url = event.detail?.url || event.detail?.page?.url;
            if (url) {
                // Extract pathname without query parameters
                const urlObj = new URL(url, window.location.origin);
                setCurrentPath(urlObj.pathname);
            } else {
                setCurrentPath(window.location.pathname);
            }
            setSidebarOpen(false);
        });

        // Cleanup
        return () => {
            removeListener();
        };
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Consumers', href: '/consumers', icon: Users },
        {
            name: 'Water Consumptions',
            href: '/water-consumptions',
            icon: DropletIcon,
        },
        {
            name: 'Public Advisory',
            href: '/public-advisories',
            icon: Megaphone,
        },
        { name: 'Reports', href: '/reports', icon: FileText },
        {
            name: 'Customer Support',
            href: '/customer-support',
            icon: Headphones,
        },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    // Helper to determine if a nav item is active
    const isActive = (href: string) => {
        // Get current path without query parameters
        const path = currentPath || window.location.pathname;

        // For exact match
        if (path === href) {
            return true;
        }

        // For consumer routes, check if we're on any consumer subpage
        if (href === '/consumers' && path.startsWith('/consumers')) {
            return true;
        }

        // For reports routes
        if (href === '/reports' && path.startsWith('/reports')) {
            return true;
        }

        // For water consumptions routes
        if (
            href === '/water-consumptions' &&
            path.startsWith('/water-consumptions')
        ) {
            return true;
        }

        // For public advisories routes
        if (
            href === '/public-advisories' &&
            path.startsWith('/public-advisories')
        ) {
            return true;
        }

        // For analytics routes
        if (href === '/analytics' && path.startsWith('/analytics')) {
            return true;
        }

        // For customer-support routes
        if (
            href === '/customer-support' &&
            path.startsWith('/customer-support')
        ) {
            return true;
        }

        return false;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 200,
                        }}
                        className="fixed top-0 bottom-0 left-0 z-50 w-72 overflow-y-auto bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-2xl lg:hidden"
                    >
                        <MobileSidebarContent
                            navigation={navigation}
                            auth={auth}
                            onClose={() => setSidebarOpen(false)}
                            onLogout={handleLogout}
                            isActive={isActive}
                        />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar - Always visible */}
            <aside className="fixed top-0 bottom-0 left-0 z-30 hidden w-72 overflow-y-auto bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-2xl lg:block">
                <DesktopSidebarContent
                    navigation={navigation}
                    auth={auth}
                    onLogout={handleLogout}
                    isActive={isActive}
                />
            </aside>

            {/* Main Content */}
            <div className="flex min-h-screen flex-col lg:pl-72">
                {/* Top Navigation */}
                <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Left section */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
                                aria-label="Open sidebar"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="ml-4 lg:ml-0">
                                <h1 className="text-lg font-semibold text-gray-900">
                                    Welcome,{' '}
                                    {auth?.user?.name?.split(' ')[0] || 'User'}!
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Right section */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                                >
                                    <Bell className="h-5 w-5" />

                                    {notifications?.count > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                            {notifications.count}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {notifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg"
                                        >
                                            <div className="border-b p-3 font-semibold">
                                                Notifications
                                            </div>

                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications?.unread?.length >
                                                0 ? (
                                                    notifications.unread.map(
                                                        (notif: any) => (
                                                            <Link
                                                                href={
                                                                    notif.data
                                                                        .url
                                                                }
                                                            >
                                                                <div
                                                                    key={
                                                                        notif.id
                                                                    }
                                                                    onClick={() => {
                                                                        router.post(
                                                                            `/notifications/${notif.id}/read`,
                                                                            {},
                                                                            {
                                                                                onSuccess:
                                                                                    () => {
                                                                                        router.visit(
                                                                                            notif
                                                                                                .data
                                                                                                .url,
                                                                                        );
                                                                                    },
                                                                            },
                                                                        );
                                                                    }}
                                                                    className="border-b px-4 py-3 hover:bg-gray-50"
                                                                >
                                                                    <p className="text-sm font-medium">
                                                                        {
                                                                            notif
                                                                                .data
                                                                                .title
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {
                                                                            notif
                                                                                .data
                                                                                .message
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        ),
                                                    )
                                                ) : (
                                                    <p className="p-4 text-center text-sm text-gray-500">
                                                        No notifications
                                                    </p>
                                                )}
                                            </div>

                                            <div className="border-t p-2 text-center">
                                                <button
                                                    onClick={() => {
                                                        router.post(
                                                            '/notifications/mark-all-read',
                                                        );
                                                        setNotifOpen(false);
                                                    }}
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    Mark all as read
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setProfileMenuOpen(!profileMenuOpen)
                                    }
                                    className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-100"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 font-semibold text-white">
                                        {auth?.user?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || 'U'}
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </button>

                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                                        >
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() =>
                                                    setProfileMenuOpen(false)
                                                }
                                            >
                                                Your Profile
                                            </Link>
                                            <hr className="my-1 border-gray-200" />
                                            <button
                                                onClick={() => {
                                                    setProfileMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                Log out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

                {/* Footer */}
                {/* <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8 lg:pl-80">
                    <p className="text-sm text-gray-600 text-center">
                        © {new Date().getFullYear()} CONSUMO - Smart Water Reporting & Consumer Engagement System. All rights reserved.
                    </p>
                </footer> */}
            </div>
        </div>
    );
};

// Mobile Sidebar Content
const MobileSidebarContent = ({
    navigation,
    bottomNavigation,
    auth,
    onClose,
    onLogout,
    isActive,
}: any) => (
    <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-blue-500/30 px-6">
            <Link
                href="/dashboard"
                className="flex items-center space-x-3"
                onClick={onClose}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Droplets className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">CONSUMO</span>
            </Link>
            <button
                onClick={onClose}
                className="text-white/60 hover:text-white"
            >
                <X className="h-5 w-5" />
            </button>
        </div>

        <div className="border-b border-blue-500/30 p-4">
            <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <UserCircle className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                        {auth?.user?.name || 'User'}
                    </p>
                    <p className="truncate text-xs text-blue-200">
                        {auth?.user?.email || 'user@example.com'}
                    </p>
                </div>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
                {navigation.map((item: any) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center rounded-xl px-4 py-3 text-sm transition-all ${
                            isActive(item.href)
                                ? 'bg-white/20 text-white shadow-lg'
                                : 'text-blue-100 hover:bg-white/10 hover:text-white'
                        } `}
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                    </Link>
                ))}
            </div>
        </nav>

        <div className="border-t border-blue-500/30 bg-blue-800/50 p-3">
            <div className="space-y-1">

                <button
                    onClick={onLogout}
                    className="flex w-full items-center rounded-xl px-4 py-3 text-sm text-blue-100 transition-all hover:bg-red-500/20 hover:text-white"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    </div>
);

// Desktop Sidebar Content
const DesktopSidebarContent = ({
    navigation,
    bottomNavigation,
    auth,
    onLogout,
    isActive,
}: any) => (
    <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-blue-500/30 px-6">
            <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Droplets className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">CONSUMO</span>
            </Link>
        </div>

        <div className="border-b border-blue-500/30 p-4">
            <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <UserCircle className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                        {auth?.user?.name || 'User'}
                    </p>
                    <p className="truncate text-xs text-blue-200">
                        {auth?.user?.email || 'user@example.com'}
                    </p>
                </div>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
                {navigation.map((item: any) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center rounded-xl px-4 py-3 text-sm transition-all ${
                            isActive(item.href)
                                ? 'bg-white/20 text-white shadow-lg'
                                : 'text-blue-100 hover:bg-white/10 hover:text-white'
                        } `}
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                    </Link>
                ))}
            </div>
        </nav>

        <div className="border-t border-blue-500/30 bg-blue-800/50 p-3">
            <div className="space-y-1">

                <button
                    onClick={onLogout}
                    className="flex w-full items-center rounded-xl px-4 py-3 text-sm text-blue-100 transition-all hover:bg-red-500/20 hover:text-white"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    </div>
);

export default DashboardLayout;
