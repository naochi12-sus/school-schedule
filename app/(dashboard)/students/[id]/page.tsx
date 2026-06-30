"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    CreditCard,
    FileText,
    Bookmark,
    Edit,
    Save,
    X,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type StudentDetail = {
    student_id: number;
    s_name: string;
    s_email: string;
    status: string;
    monthly_quota: number;
    date_of_joining: string;
    amount: number;
    s_content: string;
    lesson_participants?: {
        lessons?: {
            lesson_id: number;
            lesson_date: string;
            start_time: string;
            subject: string;
        };
    }[];
};

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const studentId = params.id as string;

    const [student, setStudent] = useState<StudentDetail | null>(null);

    const [isPageLoading, setIsPageLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editStatus, setEditStatus] = useState("在籍中");
    const [editQuota, setEditQuota] = useState(4);
    const [editJoining, setEditJoining] = useState("");
    const [editAmount, setEditAmount] = useState<number | "">("");
    const [editContent, setEditContent] = useState("");

    // 💡 カレンダー表示用の基準月を管理するState（初期値は「今月」）
    const [displayDate, setDisplayDate] = useState(new Date());

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

            if (studentId) {
                const { data, error } = await supabase
                    .from("students")
                    .select(
                        `
                        *,
                        lesson_participants (
                            lessons (
                                lesson_id,
                                lesson_date,
                                start_time,
                                subject
                            )
                        )
                    `,
                    )
                    .eq("student_id", studentId)
                    .single();

                if (error) {
                    console.error("データ取得エラー:", error);
                    alert("生徒情報の取得に失敗しました。");
                } else if (data) {
                    const currentData = data as unknown as StudentDetail;
                    setStudent(currentData);

                    setEditName(currentData.s_name);
                    setEditEmail(currentData.s_email || "");
                    setEditStatus(currentData.status);
                    setEditQuota(currentData.monthly_quota);
                    setEditJoining(currentData.date_of_joining);
                    setEditAmount(currentData.amount || "");
                    setEditContent(currentData.s_content || "");
                }
            }

            setIsPageLoading(false);
        };

        initPage();
    }, [router, studentId, supabase]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const { error } = await supabase
            .from("students")
            .update({
                s_name: editName,
                s_email: editEmail,
                status: editStatus,
                monthly_quota: editQuota,
                date_of_joining: editJoining,
                amount: editAmount === "" ? 0 : editAmount,
                s_content: editContent,
            })
            .eq("student_id", studentId);

        setIsSaving(false);

        if (error) {
            console.error("更新エラー:", error);
            alert("保存に失敗しました。");
        } else {
            alert("生徒情報を更新しました！");
            setIsEditing(false);

            router.push("/students");
            router.refresh();
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "この生徒を削除してもよろしいですか？\n※この生徒の予約記録も一緒に削除されます。",
        );
        if (!confirmDelete) return;

        const { error } = await supabase
            .from("students")
            .delete()
            .eq("student_id", studentId);

        if (error) {
            console.error("削除エラー:", error);
            alert("削除に失敗しました。");
        } else {
            alert("生徒情報を削除しました。");
            router.push("/students");
            router.refresh();
        }
    };

    // 💡 月めくり機能の処理
    const handlePrevMonth = () => {
        setDisplayDate(
            new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1),
        );
    };

    const handleNextMonth = () => {
        setDisplayDate(
            new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1),
        );
    };

    // 💡 科目ごとの色分け設定
    const getSubjectBadgeStyle = (subject: string) => {
        if (subject === "韓国語") {
            return "bg-emerald-100 text-emerald-700 border-emerald-200/60";
        } else if (subject === "中国語") {
            return "bg-orange-100 text-orange-700 border-orange-200/60";
        } else {
            return "bg-slate-100 text-slate-600 border-slate-200/60";
        }
    };

    if (isPageLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">
                読み込み中...
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-500">
                <div className="font-bold">生徒が見つかりませんでした。</div>
                <button
                    onClick={() => router.push("/students")}
                    className="text-blue-600 underline"
                >
                    生徒一覧に戻る
                </button>
            </div>
        );
    }

    // 💡 表示している月のデータを計算
    const targetYear = displayDate.getFullYear();
    const targetMonth = displayDate.getMonth() + 1;

    const monthlyLessons =
        student.lesson_participants
            ?.filter((lp) => {
                if (!lp.lessons?.lesson_date) return false;
                const d = new Date(lp.lessons.lesson_date);
                return (
                    d.getFullYear() === targetYear &&
                    d.getMonth() + 1 === targetMonth
                );
            })
            .sort((a, b) => {
                // 日付順に並び替え
                return (
                    new Date(a.lessons!.lesson_date).getTime() -
                    new Date(b.lessons!.lesson_date).getTime()
                );
            }) || [];

    const reservedCount = monthlyLessons.length;
    const quota = student.monthly_quota;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/students")}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition- cursor-pointer "
                    >
                        <ArrowLeft className="w-5 h-5" />
                        生徒一覧に戻る
                    </button>

                    {!isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-xs transition-all text-sm cursor-pointer "
                            >
                                <Edit className="w-4 h-4" />
                                編集
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-100 text-red-600 hover:bg-red-50 font-bold rounded-xl shadow-xs transition-all text-sm cursor-pointer "
                            >
                                <Trash2 className="w-4 h-4" />
                                削除
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 font-bold rounded-xl shadow-xs transition-all text-sm cursor-pointer "
                        >
                            <X className="w-4 h-4" />
                            キャンセル
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                    <div className="h-3 bg-blue-600" />

                    <div className="p-8">
                        {!isEditing ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100/50">
                                            <User className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-black text-slate-900">
                                                {student.s_name}
                                            </h1>
                                            <p className="text-xs font-bold text-slate-400 mt-1">
                                                生徒ID: {student.student_id}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-lg shadow-sm">
                                        {student.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-blue-500/70" />{" "}
                                            メールアドレス
                                        </div>
                                        <div className="text-sm font-bold text-slate-700">
                                            {student.s_email || "未登録"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500/70" />{" "}
                                            入会日
                                        </div>
                                        <div className="text-sm font-bold text-slate-700">
                                            {student.date_of_joining}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                            <Bookmark className="w-3.5 h-3.5 text-blue-500/70" />{" "}
                                            月間契約回数
                                        </div>
                                        <div className="text-sm font-black text-slate-700">
                                            月 {student.monthly_quota} 回
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                            <CreditCard className="w-3.5 h-3.5 text-blue-500/70" />{" "}
                                            月謝設定金額
                                        </div>
                                        <div className="text-sm font-black text-slate-700">
                                            {student.amount
                                                ? `${student.amount.toLocaleString()} 円`
                                                : "0 円"}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-2">
                                    <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-blue-500/70" />{" "}
                                        生徒メモ・カルテ
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 min-h-24 whitespace-pre-wrap leading-relaxed">
                                        {student.s_content || (
                                            <span className="text-slate-300 font-normal">
                                                メモはありません。
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* 💡 予約スケジュール（月めくり式・色分け追加） */}
                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <div className="flex items-center justify-between pb-2">
                                        <button
                                            onClick={handlePrevMonth}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        <div className="text-sm font-black text-slate-700 flex items-center gap-2">
                                            {targetYear}年 {targetMonth}月
                                            <span className="text-[11px] font-bold text-slate-400 ml-1">
                                                (予約済 {reservedCount} / 設定{" "}
                                                {quota}回)
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleNextMonth}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {monthlyLessons.length > 0 ? (
                                            monthlyLessons.map((lp, index) => {
                                                const lesson = lp.lessons;
                                                if (!lesson) return null;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className={`px-2 py-0.5 border rounded text-[11px] font-black ${getSubjectBadgeStyle(lesson.subject)}`}
                                                            >
                                                                {lesson.subject}
                                                            </span>
                                                            <span className="text-slate-600 text-sm">
                                                                {
                                                                    lesson.lesson_date
                                                                }
                                                            </span>
                                                        </div>
                                                        <span className="text-slate-400 font-sans tracking-wider text-sm">
                                                            {lesson.start_time.substring(
                                                                0,
                                                                5,
                                                            )}
                                                            〜
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-xs text-slate-400 p-2 italic text-center bg-slate-50 rounded-xl border border-slate-100 py-6">
                                                この月の予約レッスンはありません。
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="border-b border-slate-100 pb-4 mb-4">
                                    <h2 className="text-lg font-black text-blue-600">
                                        生徒情報の編集
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 mt-1">
                                        内容を書き換えて、一番下の保存ボタンを押してください。
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">
                                            生徒氏名 *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editName}
                                            onChange={(e) =>
                                                setEditName(e.target.value)
                                            }
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">
                                            ステータス *
                                        </label>
                                        <select
                                            value={editStatus}
                                            onChange={(e) =>
                                                setEditStatus(e.target.value)
                                            }
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer "
                                        >
                                            <option value="在籍中">
                                                在籍中
                                            </option>
                                            <option value="休会中">
                                                休会中
                                            </option>
                                            <option value="退会">退会</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        メールアドレス
                                    </label>
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) =>
                                            setEditEmail(e.target.value)
                                        }
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">
                                            月間契約数 *
                                        </label>
                                        <select
                                            value={editQuota}
                                            onChange={(e) =>
                                                setEditQuota(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer "
                                        >
                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
                                                (num) => (
                                                    <option
                                                        key={num}
                                                        value={num}
                                                    >
                                                        {num} 回 / 月
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">
                                            入会日 *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={editJoining}
                                            onChange={(e) =>
                                                setEditJoining(e.target.value)
                                            }
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 cursor-pointer "
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">
                                        月謝金額 (円)
                                    </label>
                                    <input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) =>
                                            setEditAmount(
                                                e.target.value === ""
                                                    ? ""
                                                    : Number(e.target.value),
                                            )
                                        }
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">
                                        生徒メモ (任意)
                                    </label>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) =>
                                            setEditContent(e.target.value)
                                        }
                                        rows={4}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-4 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer "
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
