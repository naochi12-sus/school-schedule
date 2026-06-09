// app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-[#ff3b30] via-[#ff6b2b] to-[#ff9500] flex flex-col items-center justify-center text-white px-6 font-sans selection:bg-white/20 selection:text-white">
            {/* ロゴを模した円形アイコン (白抜き中央にブランドの頭文字) */}
            <div className="w-21 h-21 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/10 mb-8 border border-white/20">
                <span className="text-4xl font-black tracking-tighter bg-linear-to-br from-[#ff3b30] to-[#ff6b2b] bg-clip-text text-transparent">
                    S
                </span>
            </div>

            {/* タイトル */}
            <h1 className="text-black text-base md:text-5xl font-black tracking-tight mb-4 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                SCHOOL-SCHEDULE
            </h1>

            {/* サブタイトル */}
            <p className="text-black text-base md:text-lg font-bold tracking-wider text-center max-w-sm mb-12 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                授業スケジュール管理システム
            </p>

            {/* メインアクションボタン（白背景で文字を赤オレンジに抜くことで最高に引き立ちます） */}
            <Link
                href="/login"
                className="w-full max-w-[320px] bg-white hover:bg-orange-50 text-[#ff4f18] font-black py-4 px-6 rounded-2xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-xl shadow-black/10 active:scale-[0.99]"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    ></path>
                </svg>
                <span className="text-base tracking-wider">ログイン画面へ</span>
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                </svg>
            </Link>

            {/* 洗練された細い区切り線 */}
            <div className="w-full max-w-[320px] h-px bg-white/20 my-8"></div>

            {/* 新規登録案内 */}
            <p className="text-orange-50 text-xs mb-3 font-medium tracking-wide">
                新しいアカウントの作成はこちら
            </p>
            <Link
                href="/register"
                className="text-white hover:text-orange-100 font-extrabold text-sm transition-colors duration-200 flex items-center tracking-wide underline decoration-white/30 underline-offset-4"
            >
                今すぐ新規アカウントを作成する →
            </Link>
        </div>
    );
}
