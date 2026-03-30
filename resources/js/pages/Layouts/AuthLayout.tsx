// resources/js/Layouts/AuthLayout.tsx
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

const AuthLayout = ({ children }: Props) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-cyan-100/50 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative w-full flex items-center justify-center px-4 py-12">
                {children}
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} CONSUMO. All rights reserved.
            </div>
        </div>
    );
};

export default AuthLayout;
