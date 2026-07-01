"use client";

import { useRouter } from "next/navigation";
import { LogOut, Users, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Header() {
    const router = useRouter();
    const supabase = createClient();

    // 💡 ログアウト処理
    const handleLogOut = async () => {
        const confirmLogout = window.confirm("本当にログアウトしますか？");
        if (!confirmLogout) return;

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            alert("ログアウトしました。トップ画面に戻ります。");
            router.push("/");
            router.refresh();
        } catch (error) {
            alert("ログアウトに失敗しました。");
        }
    };

    // 💡 スケジュール作成画面へ飛ぶ処理（ヘッダー専用）
    const handleCreateLesson = () => {
        // 「今日」の日付を計算する
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`; // 例: "2026-07-01"

        // 今日の1限(slot=1)をデフォルトにして新規作成画面へ飛ぶ
        router.push(`/dashboard/new?date=${dateStr}&slot=1`);
    };

    return (
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-350 mx-auto flex items-center justify-between px-6 py-3">
                {/* 左側：ロゴとタイトル */}
                <div
                    // 💡 タイトルをクリックしたらダッシュボードに戻るようにすると便利です
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <div className="w-9 h-9 bg-linear-to-br from-[#ff3b30] via-[#ff6b2b] to-[#ff9500] rounded-xl flex items-center justify-center shadow-md shadow-orange-500/10">
                        <span className="text-xl font-black text-white">S</span>
                    </div>
                    <div>
                        <h1 className="text-base font-black tracking-wider text-slate-800 leading-none">
                            SCHOOL-SCHEDULE
                        </h1>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                            授業スケジュール管理
                        </span>
                    </div>
                </div>

                {/* 右側：ボタン群 */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCreateLesson}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        スケジュールを作成
                    </button>

                    <button
                        onClick={() => router.push("/students")}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <Users className="w-4 h-4" />
                        生徒一覧
                    </button>

                    <button
                        onClick={handleLogOut}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        ログアウト
                    </button>
                </div>
            </div>
        </header>
    );
}
