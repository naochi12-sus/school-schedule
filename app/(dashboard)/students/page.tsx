export default function StudentsPage() {
    const mockStudents = [
        { id: 1, name: "田中 太郎", status: "在籍", quota: 4, used: 3 },
        { id: 2, name: "鈴木 一郎", status: "在籍", quota: 8, used: 4 },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">生徒・受講回数管理</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                            <th className="p-4">生徒名</th>
                            <th className="p-4">ステータス</th>
                            <th className="p-4">今月の契約回数</th>
                            <th className="p-4">消化状況</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                        {mockStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium">
                                    {student.name}
                                </td>
                                <td className="p-4">{student.status}</td>
                                <td className="p-4">{student.quota} 回</td>
                                <td className="p-4">
                                    {student.used} / {student.quota}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
