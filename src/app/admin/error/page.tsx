"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, { title: string; message: string }> = {
        Configuration: {
            title: "Configuration Error",
            message: "There is a problem with the server configuration.",
        },
        AccessDenied: {
            title: "Access Denied",
            message:
                "You do not have permission to access this resource. Please contact an administrator if you believe this is an error.",
        },
        Verification: {
            title: "Verification Error",
            message: "The verification link has expired or has already been used.",
        },
        OAuthSignin: {
            title: "Sign In Error",
            message: "Could not start the sign in process. Please try again.",
        },
        OAuthCallback: {
            title: "Authentication Error",
            message: "Could not complete the authentication. Please try again.",
        },
        OAuthCreateAccount: {
            title: "Account Creation Error",
            message: "Could not create your account. Please try again.",
        },
        EmailCreateAccount: {
            title: "Account Creation Error",
            message: "Could not create your account with this email.",
        },
        Callback: {
            title: "Callback Error",
            message: "There was an error during the authentication callback.",
        },
        OAuthAccountNotLinked: {
            title: "Account Not Linked",
            message:
                "This account is already linked to another user. Please sign in with a different account.",
        },
        EmailSignin: {
            title: "Email Sign In Error",
            message: "Could not send the sign in email. Please try again.",
        },
        CredentialsSignin: {
            title: "Sign In Failed",
            message: "The credentials you provided are invalid.",
        },
        SessionRequired: {
            title: "Session Required",
            message: "Please sign in to access this page.",
        },
        Default: {
            title: "Authentication Error",
            message: "An unexpected error occurred during authentication.",
        },
    };

    const errorInfo = error
        ? errorMessages[error] || errorMessages.Default
        : errorMessages.Default;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <motion.div
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md border border-red-200/30 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Error Icon */}
                <motion.div
                    className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <svg
                        className="w-10 h-10 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </motion.div>

                {/* Error Title */}
                <motion.h1
                    className="text-2xl font-bold text-gray-800 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {errorInfo.title}
                </motion.h1>

                {/* Error Message */}
                <motion.p
                    className="text-gray-600 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {errorInfo.message}
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Link
                        href="/admin/signin"
                        className="px-6 py-3 bg-[var(--color-green)] text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Go Home
                    </Link>
                </motion.div>

                {/* Error Code */}
                {error && (
                    <motion.p
                        className="mt-6 text-xs text-gray-400 font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        Error Code: {error}
                    </motion.p>
                )}
            </motion.div>
        </div>
    );
}

export default function AdminErrorPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            }
        >
            <ErrorContent />
        </Suspense>
    );
}
