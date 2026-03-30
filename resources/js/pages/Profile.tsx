// resources/js/Pages/Profile/Index.tsx

import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Shield,
    Key,
    Save,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import DashboardLayout from '@/Pages/Layouts/DashboardLayout';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

interface ProfileProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
    };
}

export default function ProfileIndex({ user }: ProfileProps) {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [passwordProcessing, setPasswordProcessing] = useState(false);
    const [profileErrors, setProfileErrors] = useState<any>({});
    const [passwordErrors, setPasswordErrors] = useState<any>({});

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setProfileErrors({});

        const loadingToast = toast.loading('Updating profile...');

        router.put('/profile', formData, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Profile updated successfully!');
                setProcessing(false);
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                setProfileErrors(errors);
                toast.error('Failed to update profile. Please check the form.');
                setProcessing(false);
            },
        });
    };

    const handlePasswordChange = () => {
        setPasswordProcessing(true);
        setPasswordErrors({});

        const loadingToast = toast.loading('Changing password...');

        router.put('/profile/password', passwordData, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success('Password changed successfully!');
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: '',
                });
                setPasswordProcessing(false);
                // Close dialog programmatically
                document.getElementById('close-password-dialog')?.click();
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                setPasswordErrors(errors);
                toast.error('Failed to change password. Please check your current password.');
                setPasswordProcessing(false);
            },
        });
    };

    const getRoleBadgeColor = (role: string) => {
        switch(role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'staff':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-6"
            >
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Information Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                {profileErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                {profileErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <Label>Role</Label>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                                        <Shield className="h-3 w-3 mr-1" />
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                {processing ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </form>
                    </motion.div>

                    {/* Security Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Shield className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Account Created</Label>
                                <p className="mt-1 text-sm text-gray-600">
                                    {new Date(user.created_at).toLocaleDateString('en-PH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <Key className="h-4 w-4 mr-2" />
                                        Change Password
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Change Password</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Enter your current password and choose a new password.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div>
                                            <Label htmlFor="current_password">Current Password</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="current_password"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={passwordData.current_password}
                                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {passwordErrors.current_password && (
                                                <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="new_password">New Password</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="new_password"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={passwordData.new_password}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {passwordErrors.new_password && (
                                                <p className="mt-1 text-sm text-red-600">{passwordErrors.new_password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="new_password_confirmation">Confirm New Password</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="new_password_confirmation"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={passwordData.new_password_confirmation}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel id="close-password-dialog">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handlePasswordChange}
                                            disabled={passwordProcessing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {passwordProcessing ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Changing...
                                                </>
                                            ) : (
                                                'Change Password'
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
