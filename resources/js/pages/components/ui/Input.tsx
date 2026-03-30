// resources/js/Components/ui/Input.tsx
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", error, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    ref={ref}
                    className={`
                        w-full px-4 py-3 border rounded-xl focus:ring-2
                        focus:ring-blue-500 focus:border-transparent
                        transition-all bg-white/50
                        ${error ? "border-red-300" : "border-gray-300"}
                        ${className}
                    `}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
