"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    ArrowLeft,
    TrendingUp,
    Wallet,
    Calendar,
    Plus,
    Filter,
    Save,
    Trash2,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import Header from "@/components/Header"; // 💡 共通ヘッダー

type PaymentData = {
    payment_id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    notes: string;
};

type LessonHistory = {
    lesson_date: string;
    subject: string;
};

export default function StudentAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const studentId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [studentName, setStudentName] = useState("");
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [lessonData, setLessonData] = useState<any[]>([]);

    const [editingPayments, setEditingPayments] = useState<
        Record<number, PaymentData>
    >({});
    const [isSavingRows, setIsSavingRows] = useState<Record<number, boolean>>(
        {},
    );

    const [selectedYear, setSelectedYear] = useState<string>(
        new Date().getFullYear().toString(),
    );

    const fetchAnalyticsData = React.useCallback(async () => {
        try {
            const { data: studentData } = await supabase
                .from("students")
                .select(
                    `
                    s_name,
                    lesson_participants (
                        lessons (
                            lesson_id,
                            lesson_date,
                            subject
                        )
                    )
                `,
                )
                .eq("student_id", studentId)
                .single();

            if (studentData) {
                setStudentName(studentData.s_name);

                const lessons = (studentData.lesson_participants || [])
                    .map((lp: any) => lp.lessons)
                    .filter(Boolean) as LessonHistory[];

                const monthlyCounts: Record<string, number> = {};
                lessons.forEach((l) => {
                    const month = l.lesson_date.substring(0, 7);
                    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
                });

                const sortedMonths = Object.keys(monthlyCounts).sort();
                let cumulative = 0;
                const chartData = sortedMonths.map((month) => {
                    cumulative += monthlyCounts[month];
                    return {
                        month: month.replace("-", "/"),
                        月間消化数: monthlyCounts[month],
                        累計消化数: cumulative,
                    };
                });

                setLessonData(chartData);
            }

            const { data: paymentData } = await supabase
                .from("payments")
                .select("*")
                .eq("student_id", studentId)
                .order("payment_date", { ascending: false });

            if (paymentData) {
                setPayments(paymentData);

                const initialEditing: Record<number, PaymentData> = {};
                paymentData.forEach((p) => {
                    initialEditing[p.payment_id] = { ...p };
                });
                setEditingPayments(initialEditing);
            }
        } catch (error) {
            console.error("データ取得エラー", error);
        } finally {
            setIsLoading(false);
        }
    }, [studentId, supabase]);

    useEffect(() => {
        const initPage = async () => {
            const authClient = createClient();
            const {
                data: { user },
            } = await authClient.auth.getUser();
            if (!user) {
                router.replace("/login");
                return;
            }
            if (studentId) {
                await fetchAnalyticsData();
            }
        };

        initPage();
    }, [studentId, router, fetchAnalyticsData]);

    const filteredPayments = payments.filter((p) =>
        p.payment_date.startsWith(selectedYear),
    );
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    const handleInputChange = (
        id: number,
        field: keyof PaymentData,
        value: any,
    ) => {
        setEditingPayments((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const handleSaveRow = async (id: number) => {
        const rowData = editingPayments[id];
        if (!rowData) return;

        setIsSavingRows((prev) => ({ ...prev, [id]: true }));

        const { error } = await supabase
            .from("payments")
            .update({
                payment_date: rowData.payment_date,
                amount: Number(rowData.amount),
                payment_method: rowData.payment_method,
                notes: rowData.notes,
            })
            .eq("payment_id", id);

        setIsSavingRows((prev) => ({ ...prev, [id]: false }));

        if (error) {
            alert("保存に失敗しました: " + error.message);
        } else {
            alert("入金情報を更新しました！");
            fetchAnalyticsData();
        }
    };

    const handleDeleteRow = async (id: number) => {
        const confirmDelete = window.confirm(
            "この入金履歴を削除してもよろしいですか？",
        );
        if (!confirmDelete) return;

        setIsLoading(true);
        const { error } = await supabase
            .from("payments")
            .delete()
            .eq("payment_id", id);

        if (error) {
            alert("削除に失敗しました: " + error.message);
            setIsLoading(false);
        } else {
            alert("入金履歴を削除しました。");
            fetchAnalyticsData();
        }
    };

    const handleAddNewRow = async () => {
        setIsLoading(true);
        const { error } = await supabase.from("payments").insert([
            {
                student_id: Number(studentId),
                amount: 0,
                payment_date: new Date().toISOString().split("T")[0],
                payment_method: "月謝",
                notes: "",
            },
        ]);

        if (error) {
            alert("新しい行の作成に失敗しました: " + error.message);
            setIsLoading(false);
        } else {
            await fetchAnalyticsData();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">
                読み込み中...
            </div>
        );
    }

    const availableYears = Array.from(
        new Set(payments.map((p) => p.payment_date.substring(0, 4))),
    )
        .sort()
        .reverse();
    if (!availableYears.includes(new Date().getFullYear().toString())) {
        availableYears.unshift(new Date().getFullYear().toString());
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* 💡 共通ヘッダーを配置 */}
            <Header />

            {/* 💡 ページコンテンツ全体を main で囲み、パディングを設定 */}
            <main className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push(`/students/${studentId}`)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        生徒詳細に戻る
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/60 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">
                            {studentName}
                        </h1>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                            累計データ・入金履歴
                        </p>
                    </div>
                </div>

                {/* 📊 グラフエリア（折れ線グラフ） */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200/60 space-y-6">
                    <h2 className="text-lg font-black text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        月別・累計 授業消化推移
                    </h2>

                    <div className="w-full h-80">
                        {lessonData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={lessonData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{
                                            fontSize: 12,
                                            fill: "#64748b",
                                            fontWeight: "bold",
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{
                                            fontSize: 12,
                                            fill: "#64748b",
                                            fontWeight: "bold",
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "none",
                                            boxShadow:
                                                "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="累計消化数"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-xl">
                                授業の参加履歴がありません。
                            </div>
                        )}
                    </div>
                </div>

                {/* 💰 入金履歴エリア（そのまま入力・編集できる帳簿スタイル） */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-black text-slate-700 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-500" />
                            入金履歴・元帳
                        </h2>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                                <Filter className="w-3.5 h-3.5 text-slate-400" />
                                <select
                                    value={selectedYear}
                                    onChange={(e) =>
                                        setSelectedYear(e.target.value)
                                    }
                                    className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                                >
                                    {availableYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}年度
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleAddNewRow}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> 行を追加する
                            </button>
                        </div>
                    </div>

                    {/* テーブル */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed min-w-200">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-black">
                                    <th className="p-4 pl-6 w-44">入金日</th>
                                    <th className="p-4 w-36">入金金額 (円)</th>
                                    <th className="p-4 w-36">種別</th>
                                    <th className="p-4">契約内容・備考メモ</th>
                                    <th className="p-4 w-24 text-center">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => {
                                        const id = payment.payment_id;
                                        const row =
                                            editingPayments[id] || payment;

                                        return (
                                            <tr
                                                key={id}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                {/* 入金日インプット */}
                                                <td className="p-2 pl-6">
                                                    <input
                                                        type="date"
                                                        value={row.payment_date}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                id,
                                                                "payment_date",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-indigo-500 cursor-pointer"
                                                    />
                                                </td>
                                                {/* 金額インプット */}
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={
                                                            row.amount === 0
                                                                ? ""
                                                                : row.amount
                                                        }
                                                        placeholder="金額"
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                id,
                                                                "amount",
                                                                e.target
                                                                    .value ===
                                                                    ""
                                                                    ? 0
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-emerald-700 focus:outline-indigo-500"
                                                    />
                                                </td>
                                                {/* 種別セレクト */}
                                                <td className="p-2">
                                                    <select
                                                        value={
                                                            row.payment_method ||
                                                            "月謝"
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                id,
                                                                "payment_method",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-indigo-500 cursor-pointer"
                                                    >
                                                        <option value="月謝">
                                                            月謝
                                                        </option>
                                                        <option value="入会金">
                                                            入会金
                                                        </option>
                                                        <option value="テキスト代">
                                                            テキスト代
                                                        </option>
                                                        <option value="その他">
                                                            その他
                                                        </option>
                                                    </select>
                                                </td>
                                                {/* 備考・契約内容メモ */}
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={row.notes || ""}
                                                        placeholder="例：週2回コース契約分、新規入会パッケージなど"
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                id,
                                                                "notes",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 focus:outline-indigo-500"
                                                    />
                                                </td>
                                                {/* 保存・削除ボタン */}
                                                <td className="p-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                handleSaveRow(
                                                                    id,
                                                                )
                                                            }
                                                            disabled={
                                                                isSavingRows[id]
                                                            }
                                                            title="この行を保存"
                                                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-md transition-all cursor-pointer disabled:opacity-50"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteRow(
                                                                    id,
                                                                )
                                                            }
                                                            title="この行を削除"
                                                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-all cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-8 text-center text-sm font-bold text-slate-400"
                                        >
                                            {selectedYear}
                                            年の入金履歴はありません。「行を追加する」から登録してください。
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {/* 集計行 */}
                            {filteredPayments.length > 0 && (
                                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                    <tr>
                                        <td className="p-4 pl-6 text-sm font-black text-slate-700 text-right">
                                            {selectedYear}年 合計 :
                                        </td>
                                        <td className="p-4 text-base font-black text-emerald-600">
                                            ¥ {totalAmount.toLocaleString()}
                                        </td>
                                        <td colSpan={3}></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
