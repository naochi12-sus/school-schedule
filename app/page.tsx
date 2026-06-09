// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
    // アクセスされたら、自動的にスケジュール画面（/dashboard）へジャンプさせる
    redirect("/dashboard");
}
