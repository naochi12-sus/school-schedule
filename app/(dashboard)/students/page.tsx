"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    ArrowLeft,
    Plus,
    Users,
    Mail,
    Calendar,
    CreditCard,
    ChevronRight,
} from "lucide-react";

type StudentData = {
    student_id: number;
    s_name: string;
    s_email: string;
    status: string;
    monthly_quota: number;
    date_of_joining: string;
    amount: number;
};

export default function StudentsListPage() {
    const router = useRouter();
    const supabase = createClient();

    const [students, setStudents] = useState<StudentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 💡 ログインチェックとデータ取得を1つの処理にまとめました
    useEffect(() => {
        const initPage = async () => {
            // 💡 1. まずは鉄壁ガード（ログインチェック）
            const authClient = createClient();
            const {
                data: { user },
            } = await authClient.auth.getUser();

            if (!user) {
                router.push("/login");
                return; // 未ログインならここで処理を完全にストップさせます
            }

            // 💡 2. ログインしていることが確認できたら、生徒データを取ってきます
            const { data, error } = await supabase
                .from("students")
                .select("*")
                .order("student_id", { ascending: true });

            if (error) {
                console.error("データ取得エラー:", error);
            } else if (data) {
                setStudents(data as StudentData[]);
            }

            // 💡 3. すべての準備が整ったら、ローディングの壁を解除（false）します
            setIsLoading(false);
        };

        initPage();
    }, [router, supabase]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "在籍中":
                return (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-lg border border-emerald-200/50">
                        在籍中
                    </span>
                );
            case "休会中":
                return (
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-black rounded-lg border border-orange-200/50">
                        休会中
                    </span>
                );
            case "退会":
                return (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-black rounded-lg border border-slate-200/50">
                        退会
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-lg border border-blue-200/50">
                        {status}
                    </span>
                );
        }
    };

    // 💡 【ここが鉄壁ガードの壁】
    // ログインチェックとデータ取得が終わるまで、画面全体を読み込み中にします
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
                読み込み中...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-6">
            <div className="max-w-(screen-xl) mx-auto space-y-6">
                {/* 上部エリア */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors mb-4 cursor-pointer "
                        >
                            <ArrowLeft className="w-5 h-5" />
                            スケジュール一覧に戻る
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white shadow-sm border border-slate-200 rounded-xl text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                                    生徒一覧
                                </h1>
                                <p className="text-sm font-bold text-slate-400 mt-0.5">
                                    クリックすると詳細を確認できます。
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/students/new")}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer "
                    >
                        <Plus className="w-5 h-5" />
                        新規生徒登録
                    </button>
                </div>

                {/* テーブルエリア */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                    {/* 💡 データが0件のときの表示だけ残しています（ローディングは上の壁で処理済み） */}
                    {students.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <div className="text-slate-400 font-bold">
                                まだ生徒が登録されていません。
                            </div>
                            <button
                                onClick={() => router.push("/students/new")}
                                className="text-blue-600 font-bold underline hover:text-blue-700"
                            >
                                最初の生徒を登録する
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest font-black">
                                        <th className="p-4 pl-6">生徒名</th>
                                        <th className="p-4">ステータス</th>
                                        <th className="p-4 pr-6 text-right">
                                            詳細
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {students.map((student) => (
                                        <tr
                                            key={student.student_id}
                                            onClick={() =>
                                                router.push(
                                                    `/students/${student.student_id}`,
                                                )
                                            }
                                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                        >
                                            <td className="p-4 pl-6">
                                                <div className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                                                    {student.s_name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold mt-1">
                                                    ID: {student.student_id}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(student.status)}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <ChevronRight className="w-4 h-4 text-slate-300 inline group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
