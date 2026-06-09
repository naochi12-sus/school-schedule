// app/register/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 登録成功したと仮定してログイン画面、またはダッシュボードへ
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 -w-64 h-64 bg-red-300/20 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -w-64 h-64 bg-orange-300/20 rounded-full filter blur-3xl pointer-events-none"></div>

            <div className="sm:mx-auto w-full max-w-md z-10">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-tr from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/20">
                        L
                    </div>
                </div>
                <h2 className="text-center text-3xl font-black tracking-tight text-slate-950">
                    アカウントの新規作成
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500">
                    すでにアカウントをお持ちですか？{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-orange-600 hover:text-red-500 transition"
                    >
                        ログインする
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto w-full max-w-md z-10">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200/60">
                    <form className="space-y-5" onSubmit={handleRegisterSubmit}>
                        <div>
                            <label
                                htmlFor="schoolName"
                                className="block text-sm font-bold text-slate-700"
                            >
                                スクール名 / 組織名
                            </label>
                            <div className="mt-1">
                                <input
                                    id="schoolName"
                                    name="schoolName"
                                    type="text"
                                    required
                                    placeholder="例: グローバル語学スクール"
                                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition"
                                />
                            </div>
                        </div>

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
                                    placeholder="6文字以上の英数字"
                                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition"
                                />
                            </div>
                        </div>

                        <div className="text-xs text-slate-500 leading-relaxed">
                            登録ボタンをクリックすることで、スクール管理システムの利用規約およびプライバシーポリシーに同意したものとみなされます。
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform active:scale-[0.98] transition"
                            >
                                無料でアカウントを作成する
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
