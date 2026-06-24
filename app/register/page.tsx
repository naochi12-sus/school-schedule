"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Supabaseでユーザー作成
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } },
            });

            if (error) throw error;

            // 2. 成功したら組織情報をDBへ登録
            if (data.user) {
                // 🎉 修正点: <any, any> を削除しました。
                // 最新のSupabaseクライアントでは、何も書かないことで型安全に文字列でのテーブル指定が可能です。
                const { error: dbError } = await supabase
                    .from("organizations")
                    .insert({
                        id: data.user.id,
                        name: "新規スクール（名称未設定）",
                    });

                if (dbError) throw dbError;
            }

            // 登録完了画面へ切り替え
            setIsRegistered(true);
            // 🎉 修正点: error の型を安全にチェックしてanyを完全に排除しました
        } catch (error) {
            if (error instanceof Error) {
                alert("登録に失敗しました: " + error.message);
            } else {
                alert("予期せぬエラーが発生しました。");
            }
        } finally {
            setLoading(false);
        }
    };

    // 共通の入力欄スタイル
    const inputStyle =
        "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none";
    // 共通のラベルスタイル
    const labelStyle = "block text-xs font-bold text-slate-500 uppercase mb-1";

    return (
        <div className="min-h-screen bg-linear-to-br from-[#ff3b30] via-[#ff6b2b] to-[#ff9500] flex flex-col items-center justify-center py-12 px-6">
            {/* ロゴ */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-8">
                <span className="text-4xl font-black bg-linear-to-br from-[#ff3b30] to-[#ff6b2b] bg-clip-text text-transparent">
                    S
                </span>
            </div>

            {/* フォームカード */}
            <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/50">
                {!isRegistered ? (
                    <>
                        <h2 className="text-2xl font-black text-slate-800 mb-6">
                            アカウント作成
                        </h2>

                        <form className="space-y-4" onSubmit={handleRegister}>
                            {/* お名前 */}
                            <div>
                                <label className={labelStyle}>お名前</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="山田 太郎"
                                    className={inputStyle}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            {/* メールアドレス */}
                            <div>
                                <label className={labelStyle}>
                                    メールアドレス
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="example@mail.com"
                                    className={inputStyle}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* パスワード */}
                            <div>
                                <label className={labelStyle}>パスワード</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="6文字以上"
                                    className={inputStyle}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-4 mt-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
                            >
                                {loading ? "処理中..." : "登録する"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href="/login"
                                className="text-sm font-bold text-orange-600 hover:underline"
                            >
                                ログイン画面に戻る
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="text-4xl mb-4">✉️</div>
                        <h2 className="text-2xl font-black text-slate-800 mb-4">
                            仮登録が完了しました！
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6">
                            入力されたメールアドレス（
                            <span className="font-semibold text-slate-900">
                                {email}
                            </span>
                            ）宛てに、本登録のご案内メールを送信しました。
                            <br />
                            メール内の確認リンクをクリックして、登録を完了させてください。
                        </p>

                        <button
                            onClick={() => router.push("/login")}
                            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-md"
                        >
                            ログイン画面へ進む
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
