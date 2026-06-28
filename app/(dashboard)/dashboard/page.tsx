"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Filter,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Users,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type LessonData = {
    lesson_id: number;
    lesson_date: string;
    start_time: string;
    end_time: string;
    subject: string;
    difficulty_level: string;
    capacity: number;
    lessons_memo: string;
    lesson_participants?: {
        students?: {
            s_name: string;
        };
    }[];
};

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();
    const [currentDate, setCurrentDate] = useState(new Date("2026-06-23"));
    const [lessons, setLessons] = useState<LessonData[]>([]);

    // 💡 【新設】画面のチラつき（フラッシュ）を防ぐため、最初は「読み込み中(true)」にしておきます
    const [isLoading, setIsLoading] = useState(true);

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
            if (error instanceof Error) {
                alert("ログアウトに失敗しました: " + error.message);
            } else {
                alert("予期せぬエラーが発生しました。");
            }
        }
    };

    // 💡 ログインチェックのプログラム（一時的にデバッグモードにします）
    useEffect(() => {
        const checkLogin = async () => {
            const authClient = createClient();
            const {
                data: { user },
            } = await authClient.auth.getUser();

            if (!user) {
                router.push("/login");
            } else {
                setIsLoading(false);
            }
        };
        checkLogin();
    }, [router]);

    const getSubjectColor = (subject: string) => {
        switch (subject) {
            case "中国語":
                return "bg-orange-50/80 border-orange-500 text-orange-700 hover:bg-orange-100/60";
            case "韓国語":
                return "bg-emerald-50/80 border-emerald-500 text-emerald-700 hover:bg-emerald-100/60";
            default:
                return "bg-blue-50/80 border-blue-500 text-blue-700 hover:bg-blue-100/60";
        }
    };

    const getMonday = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    const startOfWeek = getMonday(currentDate);

    const weekDays = Array.from({ length: 7 }).map((_, index) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + index);
        const dayLabels = ["月", "火", "水", "木", "金", "土", "日"];
        return {
            name: dayLabels[index],
            dateString: `${dayDate.getMonth() + 1}/${dayDate.getDate()}`,
            fullDate: dayDate.toISOString().split("T")[0],
        };
    });

    const displayMonth = `${startOfWeek.getFullYear()}年 ${startOfWeek.getMonth() + 1}月`;

    const handlePrevWeek = () => {
        const next = new Date(currentDate);
        next.setDate(currentDate.getDate() - 7);
        setCurrentDate(next);
    };
    const handleNextWeek = () => {
        const next = new Date(currentDate);
        next.setDate(currentDate.getDate() + 7);
        setCurrentDate(next);
    };

    const timeSlots = [
        { id: 1, name: "1限", time: "09:00~09:50", start: "09:00:00" },
        { id: 2, name: "2限", time: "10:00~10:50", start: "10:00:00" },
        { id: 3, name: "3限", time: "11:00~11:50", start: "11:00:00" },
        { id: 4, name: "4限", time: "13:00~13:50", start: "13:00:00" },
        { id: 5, name: "5限", time: "14:00~14:50", start: "14:00:00" },
        { id: 6, name: "6限", time: "15:00~15:50", start: "15:00:00" },
        { id: 7, name: "7限", time: "16:00~16:50", start: "16:00:00" },
        { id: 8, name: "8限", time: "17:00~17:50", start: "17:00:00" },
        { id: 9, name: "9限", time: "18:00~18:50", start: "18:00:00" },
        { id: 10, name: "10限", time: "19:00~19:50", start: "19:00:00" },
    ];

    // 授業スケジュールの取得
    useEffect(() => {
        // 💡 ログインチェックが終わるまでは、無駄なデータ取得をしないようにガードをかけます
        if (isLoading) return;

        const fetchLessons = async () => {
            const { data, error } = await supabase.from("lessons").select(`
                    *,
                    lesson_participants (
                        students (
                            s_name
                        )
                    )
                `);
            if (error) {
                console.error("データの取得に失敗しました:", error);
            } else if (data) {
                setLessons(data as unknown as LessonData[]);
            }
        };
        fetchLessons();
    }, [startOfWeek, isLoading]); // 💡 isLoading が終わったらデータを取るように変更

    const handleCreateLesson = (dateStr: string, slotId: number) => {
        router.push(`/dashboard/new?date=${dateStr}&slot=${slotId}`);
    };

    // 💡 【ここが今回の主役！】
    // ログインチェックが完了するまでの間は、下のカレンダー画面を絶対に表示させず、このLoading画面でストップさせます。
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
                読み込み中...
            </div>
        );
    }

    // 💡 isLoadingが「false（ログイン確認OK）」になった時だけ、ここから下の本来の画面がレンダリングされます
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3 shadow-xs">
                <div className="max-w-(screen-2xl) mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-linear-to-br from-[#ff3b30] via-[#ff6b2b] to-[#ff9500] rounded-xl flex items-center justify-center shadow-md shadow-orange-500/10">
                            <span className="text-xl font-black text-white drop-shadow-xs">
                                S
                            </span>
                        </div>
                        <div>
                            <h1 className="text-base font-black tracking-wider text-slate-800 leading-none">
                                SCHOOL-SCHEDULE
                            </h1>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                                授業スケジュール管理
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/students")}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-black bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm active:scale-[0.98] cursor-pointer "
                        >
                            <Users className="w-4 h-4" />
                            生徒一覧を見る
                        </button>

                        <button
                            onClick={handleLogOut}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-lg transition-all active:scale-[0.98] cursor-pointer "
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            ログアウト
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-(screen-2xl) mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/60">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-800">
                            週間スケジュールビュー
                        </h2>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                            時間枠をクリックしてクイックに授業枠を作成・予約できます。
                        </p>
                    </div>
                    <button
                        onClick={() =>
                            handleCreateLesson(weekDays[0].fullDate, 1)
                        }
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md active:scale-[0.98] text-sm self-start sm:self-center cursor-pointer "
                    >
                        <Plus className="w-4 h-4" />
                        スケジュールを作成
                    </button>
                </div>

                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-xs border border-slate-200/60">
                    <div className="flex items-center gap-4">
                        <span className="text-lg font-black text-slate-700">
                            {displayMonth}
                        </span>
                        <div className="flex bg-slate-100 p-1 rounded-lg gap-0.5">
                            <button
                                onClick={handlePrevWeek}
                                className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-all cursor-pointer "
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-3 py-1 bg-white rounded-md text-xs font-bold text-slate-700 shadow-xs cursor-pointer "
                            >
                                今週
                            </button>
                            <button
                                onClick={handleNextWeek}
                                className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-all cursor-pointer "
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-x-auto">
                    <div className="min-w-250">
                        <div className="grid grid-cols-8 bg-slate-50 border-b border-slate-200 text-center font-black text-xs py-3 text-slate-500 uppercase tracking-widest divide-x divide-slate-100">
                            <div className="flex items-center justify-center gap-1.5">
                                <Filter className="w-3.5 h-3.5" /> 時間枠
                            </div>
                            {weekDays.map((day) => (
                                <div
                                    key={day.name}
                                    className="font-sans text-slate-700 py-1"
                                >
                                    <div className="text-slate-800 text-sm font-black">
                                        {day.name}曜日
                                    </div>
                                    <div className="text-slate-400 text-[11px] font-bold mt-0.5">
                                        {day.dateString}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="divide-y divide-slate-200/80">
                            {timeSlots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className="grid grid-cols-8 min-h-25 divide-x divide-slate-200/80 group"
                                >
                                    <div className="p-4 bg-slate-50/50 flex flex-col items-center justify-center border-slate-200/60 group-hover:bg-slate-50 transition-colors">
                                        <div className="font-black text-slate-700 text-sm">
                                            {slot.name}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 mt-1">
                                            {slot.time}
                                        </div>
                                    </div>

                                    {weekDays.map((day) => {
                                        const lesson = lessons.find(
                                            (l) =>
                                                l.lesson_date ===
                                                    day.fullDate &&
                                                l.start_time === slot.start,
                                        );

                                        const participantNames =
                                            lesson?.lesson_participants
                                                ?.map(
                                                    (lp) => lp.students?.s_name,
                                                )
                                                .filter(Boolean)
                                                .join(", ");

                                        return (
                                            <div
                                                key={day.name}
                                                className="p-1 align-top block h-full"
                                            >
                                                {lesson ? (
                                                    <div
                                                        onClick={() =>
                                                            router.push(
                                                                `/dashboard/lessons/${lesson.lesson_id}`,
                                                            )
                                                        }
                                                        className={`h-full p-2.5 border-l-4 rounded-xl text-xs flex flex-col shadow-xs transition-all cursor-pointer hover:scale-[1.02] ${getSubjectColor(lesson.subject)}`}
                                                    >
                                                        <div className="flex items-start justify-between mb-1.5">
                                                            <span className="inline-block px-1.5 py-0.5 bg-white font-black rounded-md border border-current/30 leading-none">
                                                                {lesson.subject}
                                                            </span>
                                                            {lesson.difficulty_level && (
                                                                <span className="text-[10px] font-bold opacity-80 mt-0.5">
                                                                    {
                                                                        lesson.difficulty_level
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="text-[10px] font-black opacity-70 mb-2 font-sans tracking-wider">
                                                            {lesson.start_time.substring(
                                                                0,
                                                                5,
                                                            )}{" "}
                                                            -{" "}
                                                            {lesson.end_time.substring(
                                                                0,
                                                                5,
                                                            )}
                                                        </div>

                                                        <div className="text-slate-800 font-bold tracking-tight leading-relaxed mt-auto pt-2 border-t border-current/20">
                                                            {participantNames ? (
                                                                participantNames
                                                            ) : (
                                                                <span className="opacity-50 font-normal">
                                                                    予約なし
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() =>
                                                            handleCreateLesson(
                                                                day.fullDate,
                                                                slot.id,
                                                            )
                                                        }
                                                        className="w-full h-full min-h-20 rounded-xl border border-dashed border-transparent hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer group/cell"
                                                    >
                                                        <Plus className="w-5 h-5 text-slate-300 opacity-0 group-hover/cell:opacity-100 transition-opacity" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
