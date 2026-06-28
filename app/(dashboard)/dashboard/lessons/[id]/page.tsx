"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    ArrowLeft,
    Trash2,
    Edit,
    Calendar,
    Clock,
    Users,
    FileText,
    BarChart,
    Save,
    X,
    BookOpen,
    GraduationCap,
    Check,
} from "lucide-react";

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
            student_id: number;
            s_name: string;
        };
    }[];
};

type Student = {
    student_id: number;
    s_name: string;
};

const TIME_SLOTS = [
    { id: 1, name: "1限 (09:00~09:50)", start: "09:00:00", end: "09:50:00" },
    { id: 2, name: "2限 (10:00~10:50)", start: "10:00:00", end: "10:50:00" },
    { id: 3, name: "3限 (11:00~11:50)", start: "11:00:00", end: "11:50:00" },
    { id: 4, name: "4限 (13:00~13:50)", start: "13:00:00", end: "13:50:00" },
    { id: 5, name: "5限 (14:00~14:50)", start: "14:00:00", end: "14:50:00" },
    { id: 6, name: "6限 (15:00~15:50)", start: "15:00:00", end: "15:50:00" },
    { id: 7, name: "7限 (16:00~16:50)", start: "16:00:00", end: "16:50:00" },
    { id: 8, name: "8限 (17:00~17:50)", start: "17:00:00", end: "17:50:00" },
    { id: 9, name: "9限 (18:00~18:50)", start: "18:00:00", end: "18:50:00" },
    { id: 10, name: "10限 (19:00~19:50)", start: "19:00:00", end: "19:50:00" },
];

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const lessonId = params.id as string;

    const [lesson, setLesson] = useState<LessonData | null>(null);

    // 💡 1. ガード用のローディング状態
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editSubject, setEditSubject] = useState("韓国語");
    const [editDifficulty, setEditDifficulty] = useState("初級");
    const [editDate, setEditDate] = useState("");
    const [selectedSlotId, setSelectedSlotId] = useState(1);
    const [editMemo, setEditMemo] = useState("");

    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    // 💡 2. ログインチェックとデータ取得を統合
    useEffect(() => {
        const initPage = async () => {
            const authClient = createClient();
            const {
                data: { user },
            } = await authClient.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            if (lessonId) {
                const { data, error } = await supabase
                    .from("lessons")
                    .select(
                        `
                        *,
                        lesson_participants (
                            students (student_id, s_name)
                        )
                    `,
                    )
                    .eq("lesson_id", lessonId)
                    .single();

                if (data) {
                    const currentData = data as unknown as LessonData;
                    setLesson(currentData);
                    setEditSubject(currentData.subject || "韓国語");
                    setEditDifficulty(currentData.difficulty_level || "初級");
                    setEditDate(currentData.lesson_date);
                    setEditMemo(currentData.lessons_memo || "");

                    const slot = TIME_SLOTS.find(
                        (s) => s.start === currentData.start_time,
                    );
                    if (slot) setSelectedSlotId(slot.id);

                    const participantIds =
                        (currentData.lesson_participants
                            ?.map((lp) => lp.students?.student_id)
                            .filter(Boolean) as number[]) || [];
                    setSelectedStudentIds(participantIds);
                }
            }

            const { data: studentList } = await supabase
                .from("students")
                .select("student_id, s_name")
                .eq("status", "在籍中");
            if (studentList) setStudents(studentList as Student[]);

            setIsPageLoading(false); // ガード解除
        };
        initPage();
    }, [lessonId, router, supabase]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const currentSlot = TIME_SLOTS.find(
                (s) => s.id === Number(selectedSlotId),
            );
            const { error: lessonError } = await supabase
                .from("lessons")
                .update({
                    subject: editSubject,
                    difficulty_level: editDifficulty,
                    lesson_date: editDate,
                    start_time: currentSlot!.start,
                    end_time: currentSlot!.end,
                    lessons_memo: editMemo,
                })
                .eq("lesson_id", lessonId);

            if (lessonError) throw lessonError;

            await supabase
                .from("lesson_participants")
                .delete()
                .eq("lesson_id", lessonId);

            if (selectedStudentIds.length > 0) {
                await supabase.from("lesson_participants").insert(
                    selectedStudentIds.map((sid) => ({
                        lesson_id: Number(lessonId),
                        student_id: sid,
                    })),
                );
            }

            alert("更新しました！");
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            alert("保存に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("削除しますか？")) return;
        const { error } = await supabase
            .from("lessons")
            .delete()
            .eq("lesson_id", lessonId);
        if (!error) {
            router.push("/dashboard");
            router.refresh();
        }
    };

    // 💡 3. ローディング壁
    if (isPageLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
                読み込み中...
            </div>
        );
    }

    if (!lesson)
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                データが見つかりません
            </div>
        );

    const participantNames = lesson.lesson_participants
        ?.map((lp) => lp.students?.s_name)
        .filter(Boolean)
        .join(", ");

    return (
        // ... (以下、表示用のHTMLはそのままお使いください)
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" /> ダッシュボードに戻る
                    </button>
                    {!isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-xs transition-all text-sm cursor-pointer"
                            >
                                <Edit className="w-4 h-4" /> 編集
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-100 text-red-600 hover:bg-red-50 font-bold rounded-xl shadow-xs transition-all text-sm cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" /> 削除
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 font-bold rounded-xl shadow-xs transition-all text-sm cursor-pointer"
                        >
                            <X className="w-4 h-4" /> キャンセル
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                    <div
                        className={`h-3 ${lesson.subject === "中国語" ? "bg-orange-400" : lesson.subject === "韓国語" ? "bg-emerald-400" : "bg-blue-400"}`}
                    />
                    <div className="p-8">
                        {!isEditing ? (
                            // (表示モードのHTML...以前の通りでOKです)
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className={`px-3 py-1 text-sm font-black rounded-lg ${lesson.subject === "中国語" ? "bg-orange-100 text-orange-700" : lesson.subject === "韓国語" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
                                        >
                                            {lesson.subject}
                                        </span>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg flex items-center gap-1.5">
                                            <BarChart className="w-4 h-4" />{" "}
                                            {lesson.difficulty_level}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 mt-4">
                                        {lesson.subject}レッスン
                                    </h1>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-sm font-bold text-slate-400">
                                            実施日
                                        </div>
                                        <div className="text-lg font-black text-slate-700">
                                            {lesson.lesson_date}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-400">
                                            時間
                                        </div>
                                        <div className="text-lg font-black text-slate-700">
                                            {lesson.start_time.substring(0, 5)}{" "}
                                            〜 {lesson.end_time.substring(0, 5)}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl text-slate-700 font-bold">
                                    {participantNames || "予約生徒なし"}
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl text-slate-700 whitespace-pre-wrap">
                                    {lesson.lessons_memo || "メモなし"}
                                </div>
                            </div>
                        ) : (
                            // (編集モードのHTML...以前の通りでOKです)
                            <form onSubmit={handleSave} className="space-y-6">
                                <label className="text-sm font-bold text-slate-700">
                                    科目名
                                </label>
                                <select
                                    value={editSubject}
                                    onChange={(e) =>
                                        setEditSubject(e.target.value)
                                    }
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-bold"
                                >
                                    {["韓国語", "中国語", "その他"].map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                <label className="text-sm font-bold text-slate-700">
                                    時間枠
                                </label>
                                <select
                                    value={selectedSlotId}
                                    onChange={(e) =>
                                        setSelectedSlotId(
                                            Number(e.target.value),
                                        )
                                    }
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-bold"
                                >
                                    {TIME_SLOTS.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                <label className="text-sm font-bold text-slate-700">
                                    レッスンメモ
                                </label>
                                <textarea
                                    value={editMemo}
                                    onChange={(e) =>
                                        setEditMemo(e.target.value)
                                    }
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-bold"
                                    rows={4}
                                />
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-blue-600 text-white font-black py-4 rounded-xl cursor-pointer"
                                >
                                    {isSaving ? "保存中..." : "変更を保存する"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
