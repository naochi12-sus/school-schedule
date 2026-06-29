"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    ArrowLeft,
    Calendar,
    Clock,
    BookOpen,
    GraduationCap,
    FileText,
    Save,
    Users,
    Check,
} from "lucide-react";

// 生徒のデータ型
type Student = {
    student_id: number;
    s_name: string;
};

// 💡 元の NewLessonPage を NewLessonContent という名前に変更し、中身の処理を記述します
function NewLessonContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    // 💡 このフラグが false になるまで、画面全体に「読み込み中」のフタを被せます
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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

    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    useEffect(() => {
        const initPage = async () => {
            try {
                // ① ログインチェック
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    // 未ログインの場合はログイン画面へ
                    router.replace("/login");
                    // 💡 ここで処理を終了。このままページ遷移するまで「読み込み中」のフタを維持します！
                    return;
                }

                // ② URLパラメータの設定
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

                // ③ 生徒データの取得
                const { data } = await supabase
                    .from("students")
                    .select("student_id, s_name")
                    .eq("status", "在籍中")
                    .order("student_id", { ascending: false });

                if (data) setStudents(data as Student[]);

                // ④ すべての準備が終わったので、ここで初めてフタを開ける
                setIsPageLoading(false);
            } catch (error) {
                console.error("初期化エラー:", error);
                // エラーで画面が真っ白に固まるのを防ぐため、例外的にフタを開けます
                setIsPageLoading(false);
            }
        };

        initPage();
    }, [searchParams, router, supabase]);

    const toggleStudent = (id: number) => {
        setSelectedStudentIds((prev) =>
            prev.includes(id)
                ? prev.filter((sid) => sid !== id)
                : [...prev, id],
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (memo.length > 2000) {
                alert("レッスンメモは2000文字以内で入力してください。");
                setIsSaving(false);
                return;
            }

            const currentSlot = timeSlots.find(
                (slot) => slot.id === Number(selectedSlotId),
            );
            if (!currentSlot) throw new Error("時間枠の指定が不正です。");

            const { data: newLesson, error: lessonError } = await supabase
                .from("lessons")
                .insert([
                    {
                        lesson_date: lessonDate,
                        start_time: currentSlot.start,
                        end_time: currentSlot.end,
                        subject: subject,
                        difficulty_level: difficulty,
                        lessons_memo: memo.trim() || "",
                        capacity: 8,
                    },
                ])
                .select()
                .single();

            if (lessonError) throw lessonError;

            if (newLesson && selectedStudentIds.length > 0) {
                const participantsData = selectedStudentIds.map(
                    (studentId) => ({
                        lesson_id: newLesson.lesson_id,
                        student_id: studentId,
                    }),
                );

                const { error: participantsError } = await supabase
                    .from("lesson_participants")
                    .insert(participantsData);

                if (participantsError) {
                    console.error("参加者の登録エラー:", participantsError);
                    alert(
                        "授業は作成されましたが、参加者の登録に一部失敗しました。",
                    );
                }
            }

            alert("スケジュールと参加者の登録が完了しました！");
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            let errorMessage = "予期せぬエラーが発生しました。";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (
                error &&
                typeof error === "object" &&
                "message" in error
            ) {
                errorMessage = String((error as { message: unknown }).message);
            }
            alert("登録に失敗しました: " + errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // 💡 認証やデータの取得が終わるまでは、ここから下のUI（入力フォーム）は絶対に表示されません
    if (isPageLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
                読み込み中...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    スケジュールに戻る
                </button>

                <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/60">
                    <h2 className="text-2xl font-black tracking-tight text-slate-800">
                        新規授業枠の作成
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                        スケジュールの登録と同時に、参加する生徒を選んで予約できます。
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                    <div
                        className={`h-3 transition-colors duration-300 ${
                            subject === "中国語"
                                ? "bg-orange-400"
                                : subject === "韓国語"
                                  ? "bg-emerald-400"
                                  : "bg-blue-400"
                        }`}
                    />

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4 text-slate-400" />{" "}
                                    科目名 *
                                </label>
                                <select
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer"
                                >
                                    <option value="韓国語">韓国語</option>
                                    <option value="中国語">中国語</option>
                                    <option value="その他">その他</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-slate-400" />{" "}
                                    難易度（レベル） *
                                </label>
                                <select
                                    required
                                    value={difficulty}
                                    onChange={(e) =>
                                        setDifficulty(e.target.value)
                                    }
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer"
                                >
                                    <option value="入門">入門</option>
                                    <option value="初級">初級</option>
                                    <option value="中級">中級</option>
                                    <option value="上級">上級</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-slate-400" />{" "}
                                    実施日 *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={lessonDate}
                                    onChange={(e) =>
                                        setLessonDate(e.target.value)
                                    }
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-slate-400" />{" "}
                                    時間枠（時限目） *
                                </label>
                                <select
                                    value={selectedSlotId}
                                    onChange={(e) =>
                                        setSelectedSlotId(
                                            Number(e.target.value),
                                        )
                                    }
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer"
                                >
                                    {timeSlots.map((slot) => (
                                        <option key={slot.id} value={slot.id}>
                                            {slot.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-end justify-between">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-slate-400" />{" "}
                                    参加する生徒（複数選択可）
                                </label>
                                <span className="text-xs font-bold text-slate-500">
                                    選択中: {selectedStudentIds.length} 名
                                </span>
                            </div>

                            {students.length === 0 ? (
                                <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-sm font-bold text-slate-400">
                                    現在、在籍中の生徒がいません。
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-60 overflow-y-auto shadow-inner">
                                    {students.map((student) => {
                                        const isSelected =
                                            selectedStudentIds.includes(
                                                student.student_id,
                                            );
                                        return (
                                            <div
                                                key={student.student_id}
                                                onClick={() =>
                                                    toggleStudent(
                                                        student.student_id,
                                                    )
                                                }
                                                className={`flex items-center justify-between p-3 rounded-lg border-2 text-sm font-black cursor-pointer transition-all active:scale-[0.98] ${
                                                    isSelected
                                                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                }`}
                                            >
                                                <span className="truncate pr-2">
                                                    {student.s_name}
                                                </span>
                                                <div
                                                    className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
                                                        isSelected
                                                            ? "bg-blue-500 border-blue-500 text-white"
                                                            : "border-slate-300 bg-slate-100"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <Check className="w-3.5 h-3.5" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-slate-400" />{" "}
                                レッスンメモ（任意・2000文字以内）
                            </label>
                            <textarea
                                rows={4}
                                placeholder="授業内容や特記事項など..."
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 resize-none cursor-pointer"
                            />
                            <div className="text-right text-[10px] font-bold text-slate-400 mt-1">
                                {memo.length} / 2000 文字
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-4 rounded-xl transition-all shadow-md disabled:opacity-50 mt-6 cursor-pointer"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving
                                ? "登録処理中..."
                                : "スケジュールと参加者を保存する"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// 💡 エクスポートするページ本体。上で作った NewLessonContent を <Suspense> で囲みます
export default function NewLessonPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
                    読み込み中...
                </div>
            }
        >
            <NewLessonContent />
        </Suspense>
    );
}
