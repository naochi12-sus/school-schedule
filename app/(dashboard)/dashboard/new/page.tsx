"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Calendar,
    Clock,
    BookOpen,
    GraduationCap,
    FileText,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function NewLessonPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    // 🎉 変更: データベースが受け取れるように、時間の後ろに秒数（:00）をすべて追加しました
    const timeSlots = [
        {
            id: 1,
            name: "1限 (09:00~09:50)",
            start: "09:00:00",
            end: "09:50:00",
        },
        {
            id: 2,
            name: "2限 (10:00~10:50)",
            start: "10:00:00",
            end: "10:50:00",
        },
        {
            id: 3,
            name: "3限 (11:00~11:50)",
            start: "11:00:00",
            end: "11:50:00",
        },
        {
            id: 4,
            name: "4限 (13:00~13:50)",
            start: "13:00:00",
            end: "13:50:00",
        },
        {
            id: 5,
            name: "5限 (14:00~14:50)",
            start: "14:00:00",
            end: "14:50:00",
        },
        {
            id: 6,
            name: "6限 (15:00~15:50)",
            start: "15:00:00",
            end: "15:50:00",
        },
        {
            id: 7,
            name: "7限 (16:00~16:50)",
            start: "16:00:00",
            end: "16:50:00",
        },
        {
            id: 8,
            name: "8限 (17:00~17:50)",
            start: "17:00:00",
            end: "17:50:00",
        },
        {
            id: 9,
            name: "9限 (18:00~18:50)",
            start: "18:00:00",
            end: "18:50:00",
        },
        {
            id: 10,
            name: "10限 (19:00~19:50)",
            start: "19:00:00",
            end: "19:50:00",
        },
    ];

    const [lessonDate, setLessonDate] = useState("");
    const [selectedSlotId, setSelectedSlotId] = useState(1);
    const [subject, setSubject] = useState("韓国語");
    const [difficulty, setDifficulty] = useState("初級");
    const [memo, setMemo] = useState("");

    useEffect(() => {
        const dateParam = searchParams.get("date");
        const slotParam = searchParams.get("slot");

        if (dateParam) {
            setLessonDate(dateParam);
        } else {
            setLessonDate(new Date().toISOString().split("T")[0]);
        }

        if (slotParam) {
            setSelectedSlotId(Number(slotParam));
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (memo.length > 2000) {
                alert("レッスンメモは2000文字以内で入力してください。");
                return;
            }

            const currentSlot = timeSlots.find(
                (slot) => slot.id === Number(selectedSlotId),
            );
            if (!currentSlot) throw new Error("時間枠の指定が不正です。");

            // Supabaseの「lessons」テーブルにデータを保存
            const { error } = await supabase.from("lessons").insert([
                {
                    lesson_date: lessonDate,
                    start_time: currentSlot.start,
                    end_time: currentSlot.end,
                    subject: subject,
                    difficulty_level: difficulty,
                    lessons_memo: memo.trim() || "",
                    capacity: 8,
                },
            ]);

            if (error) throw error;

            alert("データベースへのスケジュール登録が成功しました！");

            router.push("/dashboard");
            router.refresh();
            // 🎉 変更: anyを消して、本物のエラー型かどうかを判定する安全な形に直しました
        } catch (error) {
            // 💡 ここから新しくなります！
            let errorMessage = "予期せぬエラーが発生しました。";

            if (error instanceof Error) {
                // 普通のエラー（Next.jsなどのエラー）のとき
                errorMessage = error.message;
            } else if (
                error &&
                typeof error === "object" &&
                "message" in error
            ) {
                // Supabase特有の、ちょっと特殊なデータ形式のエラーのとき
                errorMessage = String((error as { message: unknown }).message);
            }

            alert("登録に失敗しました: " + errorMessage);
            // 💡 ここまでが新しくなった部分です！
        } finally {
            // 🎉 setLoading(false) は、消さずにここにしっかりと残します！
            setLoading(false);
        }
    };

    const inputStyle =
        "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all";
    const labelStyle =
        "flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase mb-2 tracking-wider";

    return (
        <div className="p-6 max-w-2xl mx-auto font-sans text-slate-800">
            <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors mb-4 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                スケジュールに戻る
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/60 mb-6">
                <h2 className="text-2xl font-black tracking-tight text-slate-800">
                    新規授業枠の作成
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                    選択された日時・時間枠が自動入力されています。
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200/60 space-y-6"
            >
                {/* 日付 */}
                <div>
                    <label className={labelStyle}>
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> 日付
                    </label>
                    <input
                        type="date"
                        required
                        className={inputStyle}
                        value={lessonDate}
                        onChange={(e) => setLessonDate(e.target.value)}
                    />
                </div>

                {/* 時間枠 */}
                <div>
                    <label className={labelStyle}>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />{" "}
                        時間枠（時限目）
                    </label>
                    <select
                        className={inputStyle}
                        value={selectedSlotId}
                        onChange={(e) =>
                            setSelectedSlotId(Number(e.target.value))
                        }
                    >
                        {timeSlots.map((slot) => (
                            <option key={slot.id} value={slot.id}>
                                {slot.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 科目 */}
                <div>
                    <label className={labelStyle}>
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" /> 科目
                    </label>
                    <select
                        className={inputStyle}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    >
                        <option value="韓国語">韓国語</option>
                        <option value="中国語">中国語</option>
                    </select>
                </div>

                {/* 難易度 */}
                <div>
                    <label className={labelStyle}>
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />{" "}
                        難易度（レベル）
                    </label>
                    <select
                        className={inputStyle}
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="入門">入門</option>
                        <option value="初級">初級</option>
                        <option value="中級">中級</option>
                        <option value="上級">上級</option>
                    </select>
                </div>

                {/* レッスンメモ */}
                <div>
                    <label className={labelStyle}>
                        <FileText className="w-3.5 h-3.5 text-slate-400" />{" "}
                        レッスンメモ（任意・2000文字以内）
                    </label>
                    <textarea
                        rows={4}
                        placeholder="授業内容（任意）"
                        className={`${inputStyle} resize-none`}
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                    />
                    <div className="text-right text-[10px] font-bold text-slate-400 mt-1">
                        {memo.length} / 2000 文字
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                    <Save className="w-4 h-4" />
                    {loading ? "登録処理中..." : "スケジュールを保存する"}
                </button>
            </form>
        </div>
    );
}
