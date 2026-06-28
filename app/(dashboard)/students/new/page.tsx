"use client";

import React, { useState, useEffect } from "react"; // 💡 useEffectを追加
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    ArrowLeft,
    UserPlus,
    Save,
    Mail,
    Calendar,
    CreditCard,
    FileText,
} from "lucide-react";

export default function NewStudentPage() {
    const router = useRouter();
    const supabase = createClient();

    // 💡 【追加①】画面を開くときの「ガード用ローディング」を追加
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [sName, setSName] = useState("");
    const [sEmail, setSEmail] = useState("");
    const [status, setStatus] = useState("在籍中");
    const [monthlyQuota, setMonthlyQuota] = useState(4);
    const [dateOfJoining, setDateOfJoining] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [amount, setAmount] = useState<number | "">("");
    const [sContent, setSContent] = useState("");

    // 💡 【追加②】ログインチェック（鉄壁ガード）の処理を追加
    useEffect(() => {
        const checkLogin = async () => {
            const authClient = createClient();
            const {
                data: { user },
            } = await authClient.auth.getUser();

            if (!user) {
                // 未ログインならログイン画面へ強制送還
                router.push("/login");
                return;
            }

            // ログインOKなら壁を開ける（falseにする）
            setIsPageLoading(false);
        };
        checkLogin();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase.from("students").insert([
            {
                s_name: sName,
                s_email: sEmail,
                status: status,
                monthly_quota: monthlyQuota,
                date_of_joining: dateOfJoining,
                amount: amount === "" ? 0 : amount,
                s_content: sContent,
            },
        ]);

        setIsSubmitting(false);

        if (error) {
            console.error("登録エラー:", error);
            alert("登録に失敗しました。必須項目や形式を確認してください。");
        } else {
            alert("新しい生徒を登録しました！");
            router.push("/students");
            router.refresh();
        }
    };

    // 💡 【追加③】ログイン確認が終わるまでは真っ白なローディング壁を出す
    if (isPageLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
                読み込み中...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer "
                >
                    <ArrowLeft className="w-5 h-5" />
                    戻る
                </button>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                    <div className="h-3 bg-blue-500" />
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                                    新規生徒登録
                                </h1>
                                <p className="text-sm font-bold text-slate-400 mt-1">
                                    スクールに入会する生徒の情報を入力してください。
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                        生徒氏名{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={sName}
                                        onChange={(e) =>
                                            setSName(e.target.value)
                                        }
                                        placeholder="例: 田中 太郎"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                        ステータス{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all cursor-pointer "
                                    >
                                        <option value="在籍中">在籍中</option>
                                        <option value="休会中">休会中</option>
                                        <option value="退会">退会</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    メールアドレス
                                </label>
                                <input
                                    type="email"
                                    value={sEmail}
                                    onChange={(e) => setSEmail(e.target.value)}
                                    placeholder="example@school.com"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                        月間契約数 (0〜9回){" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={monthlyQuota}
                                        onChange={(e) =>
                                            setMonthlyQuota(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all"
                                    >
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
                                            (num) => (
                                                <option key={num} value={num}>
                                                    {num} 回 / 月
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        入会日{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={dateOfJoining}
                                        onChange={(e) =>
                                            setDateOfJoining(e.target.value)
                                        }
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-slate-400" />
                                    月謝金額 (円)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(
                                            e.target.value === ""
                                                ? ""
                                                : Number(e.target.value),
                                        )
                                    }
                                    placeholder="例: 10000"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    生徒メモ (任意)
                                </label>
                                <textarea
                                    value={sContent}
                                    onChange={(e) =>
                                        setSContent(e.target.value)
                                    }
                                    placeholder="生徒の目標や特記事項など..."
                                    rows={4}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer "
                            >
                                {isSubmitting ? (
                                    "登録処理中..."
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        生徒を登録する
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
