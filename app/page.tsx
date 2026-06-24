"use client";

import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-[#ff3b30] via-[#ff6b2b] to-[#ff9500] flex flex-col items-center justify-center text-white px-6 font-sans">
            {/* ロゴエリア */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/10 mb-8 border border-white/20">
                <span className="text-4xl font-black tracking-tighter bg-linear-to-br from-[#ff3b30] to-[#ff6b2b] bg-clip-text text-transparent">
                    S
                </span>
            </div>

            {/* タイトル */}
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-center text-white drop-shadow-md">
                SCHOOL-SCHEDULE
            </h1>
            <p className="text-lg font-bold tracking-wider text-center max-w-sm mb-12 opacity-90">
                授業スケジュール管理システム
            </p>

            {/* アクションボタンエリア */}
            {/* 🎉 変更点: 横並びのレイアウトをスッキリさせ、ボタン1つが中央に綺麗に収まるように幅を調整しました */}
            <div className="w-full max-w-60">
                {/* ログインボタンのみ */}
                <Link
                    href="/login"
                    className="w-full bg-white text-[#ff4f18] font-black py-4 px-4 rounded-2xl flex items-center justify-center transition-all hover:bg-orange-50 shadow-lg active:scale-[0.98]"
                >
                    ログイン
                </Link>
            </div>

            {/* フッター */}
            <div className="mt-12 text-white/60 text-xs font-bold tracking-widest uppercase">
                © 2026 School-Schedule
            </div>
        </div>
    );
}
