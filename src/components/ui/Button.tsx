import { cn } from "../../lib/utils";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline";
};

export const Button = ({ className, variant = "default", ...props }: ButtonProps) => {
    return (
        <button
            className={cn(
                "px-4 py-2 rounded-lg font-medium transition",
                variant === "default"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100",
                className
            )}
            {...props}
        />
    );
};
