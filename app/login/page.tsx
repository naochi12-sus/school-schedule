// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 本来はここでSupabaseの認証を行いますが、
        // まずは画面を確認するために、ボタンを押したらスケジュール画面へジャンプさせます
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800">
            <div className="sm:mx-auto w-full max-w-md">
                {/* スクール名見出し */}
                <h1 className="text-center text-3xl font-extrabold text-indigo-600">
                    語学スクール管理
                </h1>
                <p className="mt-2 text-center text-sm text-slate-500">
                    授業スケジュール・受講管理システム
                </p>
            </div>

            <div className="mt-8 sm:mx-auto w-full max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200">
                    {/* ログインフォーム */}
                    <form className="space-y-6" onSubmit={handleLoginSubmit}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700"
                            >
                                メールアドレス
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="admin@example.com"
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700"
                            >
                                パスワード
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                            >
                                ログイン
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
