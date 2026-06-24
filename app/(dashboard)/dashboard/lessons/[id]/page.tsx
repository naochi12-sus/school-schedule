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

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const lessonId = params.id as string;

    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 編集用の入力欄の状態
    const [editSubject, setEditSubject] = useState("韓国語");
    const [editDifficulty, setEditDifficulty] = useState("初級");
    const [editDate, setEditDate] = useState("");
    const [editStart, setEditStart] = useState("");
    const [editEnd, setEditEnd] = useState("");
    const [editMemo, setEditMemo] = useState("");

    // 💡 スクールにいる全生徒リストと、選択された生徒IDの管理
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    // 授業データの取得
    const fetchLessonDetail = async () => {
        setIsLoading(true);

        const { data, error } = await supabase
            .from("lessons")
            .select(
                `
                *,
                lesson_participants (
                    students (
                        student_id,
                        s_name
                    )
                )
            `,
            )
            .eq("lesson_id", lessonId)
            .single();

        if (error) {
            console.error("エラー:", error);
            alert("データの取得に失敗しました。");
        } else if (data) {
            const currentData = data as unknown as LessonData;
            setLesson(currentData);

            // データベースの値を編集フォームの初期値としてセット
            setEditSubject(currentData.subject || "韓国語");
            setEditDifficulty(currentData.difficulty_level || "初級");
            setEditDate(currentData.lesson_date);
            setEditStart(currentData.start_time);
            setEditEnd(currentData.end_time);
            setEditMemo(currentData.lessons_memo || "");

            // 💡 現在のこの授業の「参加生徒のID」を抽出して、最初からチェックを入れておく
            const currentParticipantIds =
                (currentData.lesson_participants
                    ?.map((lp) => lp.students?.student_id)
                    .filter(Boolean) as number[]) || [];
            setSelectedStudentIds(currentParticipantIds);
        }

        setIsLoading(false);
    };

    // 初回に授業データとスクールの全生徒データを同時に持ってくる
    useEffect(() => {
        if (lessonId) {
            fetchLessonDetail();
        }

        const fetchAllStudents = async () => {
            const { data } = await supabase
                .from("students")
                .select("student_id, s_name")
                .eq("status", "在籍中")
                .order("student_id", { ascending: true });
            if (data) setStudents(data as Student[]);
        };
        fetchAllStudents();
    }, [lessonId]);

    // 生徒の選択・解除の切り替え
    const toggleStudent = (id: number) => {
        setSelectedStudentIds((prev) =>
            prev.includes(id)
                ? prev.filter((sid) => sid !== id)
                : [...prev, id],
        );
    };

    // 💡 編集内容を保存する処理（高度な一括入れ替え処理）
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // 1️⃣ まず「lessons」テーブルの基本情報を更新（UPDATE）
            const { error: lessonError } = await supabase
                .from("lessons")
                .update({
                    subject: editSubject,
                    difficulty_level: editDifficulty,
                    lesson_date: editDate,
                    start_time: editStart,
                    end_time: editEnd,
                    lessons_memo: editMemo,
                })
                .eq("lesson_id", lessonId);

            if (lessonError) throw lessonError;

            // 2️⃣ 中間テーブルの元の予約を一旦リセット（DELETE）
            const { error: deleteError } = await supabase
                .from("lesson_participants")
                .delete()
                .eq("lesson_id", lessonId);

            if (deleteError) throw deleteError;

            // 3️⃣ 新しく選び直された生徒たちを中間テーブルに再登録（INSERT）
            if (selectedStudentIds.length > 0) {
                const participantsData = selectedStudentIds.map(
                    (studentId) => ({
                        lesson_id: Number(lessonId),
                        student_id: studentId,
                    }),
                );

                const { error: insertError } = await supabase
                    .from("lesson_participants")
                    .insert(participantsData);

                if (insertError) throw insertError;
            }

            alert("授業スケジュールと参加メンバーを更新しました！");
            setIsEditing(false); // 編集モード終了
            fetchLessonDetail(); // 最新状態に画面を更新
            router.refresh();
        } catch (error) {
            console.error("更新エラー:", error);
            alert("保存に失敗しました。データの形式を確認してください。");
        }
        {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "この授業スケジュールを削除してもよろしいですか？\n※この操作は取り消せません。",
        );
        if (!confirmDelete) return;

        const { error } = await supabase
            .from("lessons")
            .delete()
            .eq("lesson_id", lessonId);

        if (error) {
            console.error("削除エラー:", error);
            alert("削除に失敗しました。");
        } else {
            alert("スケジュールを削除しました。");
            router.push("/dashboard");
            router.refresh();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
                読み込み中...
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-500">
                <div className="font-bold">データが見つかりませんでした。</div>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="text-blue-600 underline cursor-pointer"
                >
                    ダッシュボードに戻る
                </button>
            </div>
        );
    }

    const participantNames = lesson.lesson_participants
        ?.map((lp) => lp.students?.s_name)
        .filter(Boolean)
        .join(", ");

    const participantCount = lesson.lesson_participants?.length || 0;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* 戻るボタンとアクションボタン */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        ダッシュボードに戻る
                    </button>

                    {!isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-xs transition-all text-sm cursor-pointer"
                            >
                                <Edit className="w-4 h-4" />
                                編集
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-100 text-red-600 hover:bg-red-50 font-bold rounded-xl shadow-xs transition-all text-sm cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                削除
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 font-bold rounded-xl shadow-xs transition-all text-sm cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                            キャンセル
                        </button>
                    )}
                </div>

                {/* メインカード */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                    <div
                        className={`h-3 ${
                            lesson.subject === "中国語"
                                ? "bg-orange-400"
                                : lesson.subject === "韓国語"
                                  ? "bg-emerald-400"
                                  : "bg-blue-400"
                        }`}
                    />

                    <div className="p-8">
                        {!isEditing ? (
                            /* ===================================================
                               通常表示モード
                            =================================================== */
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className={`px-3 py-1 text-sm font-black rounded-lg ${
                                                lesson.subject === "中国語"
                                                    ? "bg-orange-100 text-orange-700"
                                                    : lesson.subject ===
                                                        "韓国語"
                                                      ? "bg-emerald-100 text-emerald-700"
                                                      : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {lesson.subject}
                                        </span>
                                        {lesson.difficulty_level && (
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg flex items-center gap-1.5">
                                                <BarChart className="w-4 h-4" />
                                                {lesson.difficulty_level}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-4">
                                        {lesson.subject}レッスン
                                    </h1>
                                </div>

                                <hr className="border-slate-100" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-400 mb-1">
                                                実施日
                                            </div>
                                            <div className="text-lg font-black text-slate-700">
                                                {lesson.lesson_date}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-400 mb-1">
                                                時間
                                            </div>
                                            <div className="text-lg font-black text-slate-700">
                                                {lesson.start_time.substring(
                                                    0,
                                                    5,
                                                )}{" "}
                                                〜{" "}
                                                {lesson.end_time.substring(
                                                    0,
                                                    5,
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-end justify-between mb-2">
                                            <div className="text-sm font-bold text-slate-400">
                                                参加予定の生徒
                                            </div>
                                            <div className="text-sm font-bold text-slate-500">
                                                <span className="text-lg text-slate-800">
                                                    {participantCount}
                                                </span>{" "}
                                                / {lesson.capacity} 名
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-bold leading-relaxed">
                                            {participantNames ? (
                                                participantNames
                                            ) : (
                                                <span className="text-slate-400 font-normal">
                                                    現在、予約している生徒はいません。
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-400 mb-2">
                                            レッスンメモ
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap min-h-25 leading-relaxed">
                                            {lesson.lessons_memo ? (
                                                lesson.lessons_memo
                                            ) : (
                                                <span className="text-slate-400">
                                                    メモは登録されていません。
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ===================================================
                               🟢 修正後の編集モード（生徒の選択変更に対応）
                            =================================================== */
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="border-b border-slate-100 pb-4 mb-4">
                                    <h2 className="text-lg font-black text-blue-600">
                                        スケジュールの編集
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 mt-1">
                                        内容や参加メンバーを書き換えて、一番下の保存ボタンを押してください。
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />{" "}
                                            科目名 *
                                        </label>
                                        <select
                                            required
                                            value={editSubject}
                                            onChange={(e) =>
                                                setEditSubject(e.target.value)
                                            }
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer"
                                        >
                                            <option value="韓国語">
                                                韓国語
                                            </option>
                                            <option value="中国語">
                                                中国語
                                            </option>
                                            <option value="その他">
                                                その他
                                            </option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />{" "}
                                            難易度・レベル *
                                        </label>
                                        <select
                                            required
                                            value={editDifficulty}
                                            onChange={(e) =>
                                                setEditDifficulty(
                                                    e.target.value,
                                                )
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

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">
                                            実施日 *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={editDate}
                                            onChange={(e) =>
                                                setEditDate(e.target.value)
                                            }
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">
                                            開始時間 *
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={editStart}
                                            onChange={(e) =>
                                                setEditStart(e.target.value)
                                            }
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">
                                            終了時間 *
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={editEnd}
                                            onChange={(e) =>
                                                setEditEnd(e.target.value)
                                            }
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* 💡 【定員枠から入れ替え】参加生徒の選び直しエリア */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-end justify-between">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-slate-400" />{" "}
                                            参加する生徒（複数選択可）
                                        </label>
                                        <span className="text-xs font-bold text-slate-500">
                                            選択中: {selectedStudentIds.length}{" "}
                                            名
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

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">
                                        レッスンメモ
                                    </label>
                                    <textarea
                                        value={editMemo}
                                        onChange={(e) =>
                                            setEditMemo(e.target.value)
                                        }
                                        rows={4}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 resize-none cursor-pointer"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-4 rounded-xl shadow-md disabled:opacity-50 mt-4 cursor-pointer"
                                >
                                    <Save className="w-5 h-5" />
                                    {isSaving
                                        ? "保存処理中..."
                                        : "変更を保存する"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
