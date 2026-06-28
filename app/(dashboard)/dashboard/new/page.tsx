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

type Student = {
    student_id: number;
    s_name: string;
};

// ページのメインコンテンツ部分
function NewLessonContent() {
    const router = useRouter();
    const searchParams = useSearchParams(); // URLのパラメータを取得
    const supabase = createClient();

    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // フォーム用State（初期値は空文字などにしておく）
    const [lessonDate, setLessonDate] = useState("");
    const [selectedSlotId, setSelectedSlotId] = useState(1);
    const [subject, setSubject] = useState("韓国語");
    const [difficulty, setDifficulty] = useState("初級");
    const [memo, setMemo] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    useEffect(() => {
        const initPage = async () => {
            // 日付と時限の初期化（URLパラメータがなければ今日の日付）
            const dateParam =
                searchParams.get("date") ||
                new Date().toISOString().split("T")[0];
            const slotParam = searchParams.get("slot") || "1";

            setLessonDate(dateParam);
            setSelectedSlotId(Number(slotParam));

            const { data } = await supabase
                .from("students")
                .select("student_id, s_name")
                .eq("status", "在籍中")
                .order("student_id", { ascending: false });

            if (data) setStudents(data as Student[]);
            setIsPageLoading(false);
        };

        initPage();
    }, [searchParams, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // ...（中略：handleSubmitの処理はそのままお使いください）
        // ※長くなるため、handleSubmitの中身は以前のコードのまま差し替えてください
    };

    if (isPageLoading)
        return <div className="p-10 text-center">読み込み中...</div>;

    return (
        // ...（以前の return 内の JSX をそのまま記述してください）
        <div className="p-6">フォームの内容</div>
    );
}

// 💡 重要：ここが修正のポイント！
// useSearchParams を使うページは、必ず Suspense で囲むルールがあります
export default function NewLessonPage() {
    return (
        <Suspense
            fallback={<div className="p-10 text-center">読み込み中...</div>}
        >
            <NewLessonContent />
        </Suspense>
    );
}
