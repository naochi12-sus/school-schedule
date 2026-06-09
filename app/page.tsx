// app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 text-slate-800">
            {/* ヘッダー */}
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20">
                        L
                    </div>
                    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                        Language School
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <Link
                        href="/login"
                        className="text-sm font-semibold text-slate-600 hover:text-red-500 transition"
                    >
                        ログイン
                    </Link>
                    <Link
                        href="/register"
                        className="text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 px-4 py-2 rounded-lg shadow-md shadow-orange-500/10 transition"
                    >
                        無料登録
                    </Link>
                </div>
            </header>

            {/* ヒーローセクション */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
                <div className="inline-flex items-center space-x-2 bg-orange-500/10 text-orange-600 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
                    <span>✨ 授業スケジュール・受講管理システム</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight sm:leading-none">
                    語学スクールの運営を、
                    <br />
                    <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                        もっとスマートに、円滑に。
                    </span>
                </h1>

                <p className="mt-6 text-base sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    講師スケジュール、受講生の情報、レッスンの予約状況をひと目で把握。
                    一歩進んだスクールマネジメントを、美しいデザインとともに始めましょう。
                </p>

                {/* アクションボタン */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/register"
                        className="w-full sm:w-auto text-base font-bold text-white bg-gradient-to-r from-red-500 via-orange-500 to-orange-600 hover:opacity-95 px-8 py-4 rounded-xl shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 transition text-center"
                    >
                        管理システムを始める（無料）
                    </Link>
                    <Link
                        href="/login"
                        className="w-full sm:w-auto text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-8 py-4 rounded-xl shadow-sm transform hover:-translate-y-0.5 transition text-center"
                    >
                        管理者ログイン
                    </Link>
                </div>

                {/* 装飾用のダミー画面イメージ */}
                <div className="mt-16 border border-slate-200/80 bg-white/50 p-3 rounded-2xl shadow-2xl max-w-4xl mx-auto backdrop-blur-sm">
                    <div className="bg-slate-950 rounded-xl aspect-[16/9] flex items-center justify-center p-8 text-slate-400 border border-slate-800">
                        <div className="space-y-2 text-center">
                            <p className="text-sm font-mono text-orange-400">
                                ⚡ Smart Dashboard Preview
                            </p>
                            <p className="text-xs text-slate-500">
                                ログイン後、ここに一元管理された週間スケジュールが表示されます
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
