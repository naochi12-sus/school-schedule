// app/login/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // モック動作：スケジュール画面へ
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800 relative overflow-hidden">
            {/* 背景のグラデーションのボケ */}
            <div className="absolute top-0 right-0 -w-64 h-64 bg-orange-300/20 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -w-64 h-64 bg-red-300/20 rounded-full filter blur-3xl pointer-events-none"></div>

            <div className="sm:mx-auto w-full max-w-md z-10">
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-linear-to-br from-[#ff3b30] via-[#ff6b2b] to-[#ff9500] rounded-full flex items-center justify-center shadow-xl shadow-orange-500/20 mb-8 border border-white/10">
                        <span className="text-4xl font-black tracking-tighter text-white drop-shadow-sm">
                            S
                        </span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-black tracking-tight text-slate-950">
                    ログイン
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto w-full max-w-md z-10">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200/60">
                    <form className="space-y-6" onSubmit={handleLoginSubmit}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-bold text-slate-700"
                            >
                                メールアドレス
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="admin@example.com"
                                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-bold text-slate-700"
                            >
                                パスワード
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded-md"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-slate-600 font-medium"
                                >
                                    ログイン状態を維持
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform active:scale-[0.98] transition"
                            >
                                ログインする
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
                        >
                            ← トップページへ戻る
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
