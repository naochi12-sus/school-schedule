// app/register/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client"; // Supabaseクライアントの読み込み

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 1. Supabase Authでユーザーを作成
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    school_name: schoolName, // メタデータとしてスクール名を保存
                },
            },
        });

        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }

        // 2. 登録成功後、ダッシュボードへ移動
        router.push("/dashboard");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-[#ff3b30] via-[#ff6b2b] to-[#ff9500] flex flex-col justify-center py-12 px-6 lg:px-8 text-black selection:bg-black/10 selection:text-black">
            <div className="sm:mx-auto w-full max-w-md text-center">
                <div className="w-21 h-21 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto mb-6 border border-white/20">
                    <span className="text-4xl font-black italic tracking-tighter bg-linear-to-br from-[#ff3b30] to-[#ff6b2b] bg-clip-text text-transparent">
                        キ
                    </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-black">
                    管理者アカウントの作成
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto w-full max-w-100">
                <div className="bg-white/90 backdrop-blur-sm py-10 px-8 shadow-2xl rounded-2xl border border-white/50">
                    <form className="space-y-5" onSubmit={handleRegister}>
                        <div>
                            <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
                                スクール名
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="キタノリスピー"
                                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                                onChange={(e) => setSchoolName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
                                メールアドレス
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="admin@example.com"
                                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
                                パスワード
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="6文字以上"
                                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="w-full py-3.5 mt-4 rounded-xl text-sm font-black text-white bg-black hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
                        >
                            {loading ? "処理中..." : "アカウントを作成"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
                        すでにアカウントをお持ちですか？{" "}
                        <Link
                            href="/login"
                            className="font-bold text-[#ff4f18] hover:underline"
                        >
                            ログインはこちら
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
