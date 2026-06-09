// app/(dashboard)/dashboard/page.tsx
export default function DashboardPage() {
    const days = ["月", "火", "水", "木", "金", "土", "日"];
    const timeSlots = [
        { id: 1, name: "1限 (09:00~09:50)" },
        { id: 2, name: "2限 (10:00~10:50)" },
        { id: 3, name: "3限 (11:00~11:50)" },
    ];

    return (
        <div>
            {/* 見出し */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">週間スケジュール</h2>
            </div>

            {/* 横スクロールできるようにする外枠 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* 曜日を表示する行 */}
                    <div className="grid grid-cols-8 bg-slate-100 border-b border-slate-200 text-center font-semibold text-sm py-3 text-slate-600">
                        <div>時間枠</div>
                        {days.map((day) => (
                            <div key={day}>{day}曜日</div>
                        ))}
                    </div>

                    {/* コマ数（時間枠）の行をループ */}
                    <div className="divide-y divide-slate-200">
                        {timeSlots.map((slot) => (
                            <div
                                key={slot.id}
                                className="grid grid-cols-8 min-h-[100px] divide-x divide-slate-200"
                            >
                                {/* 一番左の列：時間（1限、2限...） */}
                                <div className="p-3 bg-slate-50 flex items-center justify-center text-xs font-medium text-slate-500 text-center">
                                    {slot.name}
                                </div>

                                {/* 月曜日：韓国語レッスン（仮のデータ） */}
                                <div className="p-2 bg-green-50/60 border-l-4 border-green-500 m-1 rounded text-xs">
                                    <div className="font-bold text-green-700">
                                        【韓国語】
                                    </div>
                                    <div className="text-slate-600 mt-1 font-medium">
                                        田中様、鈴木様、高橋様
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-2">
                                        定員: 3 / 8名
                                    </div>
                                </div>

                                {/* 他の曜日（火〜日）の空欄セル */}
                                <div className="p-2"></div>
                                <div className="p-2"></div>
                                <div className="p-2"></div>
                                <div className="p-2"></div>
                                <div className="p-2"></div>
                                <div className="p-2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
