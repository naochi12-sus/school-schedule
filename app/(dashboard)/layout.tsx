"use client";

import "../globals.css";

import React, { useState } from "react";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { href: "/dashboard", label: "スケジュール", icon: "📅" },
        { href: "/students", label: "生徒・回数管理", icon: "👥" },
        { href: "/settings", label: "システム設定", icon: "⚙️" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-lg font-bold text-indigo-600">
                                語学スクール管理
                            </h1>
                        </div>
                        <nav className="hidden md:flex space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                        <div className="hidden md:flex items-center space-x-4">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                                スタッフ用
                            </span>
                        </div>
                        <div className="flex md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-2xl p-2"
                            >
                                {isOpen ? "✕" : "☰"}
                            </button>
                        </div>
                    </div>
                </div>
                {isOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full left-0 p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center space-x-3 block px-4 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </header>
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
