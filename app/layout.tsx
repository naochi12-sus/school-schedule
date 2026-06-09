// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Language School Management",
    description: "語学スクールのためのスマートな管理システム",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja">
            <body>
                {/* ここに各ページの画面がはめ込まれます */}
                {children}
            </body>
        </html>
    );
}
