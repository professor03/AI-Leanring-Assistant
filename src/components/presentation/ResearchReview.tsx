import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Card from '../ui/Card';
import type { ResearchResult } from '../../types';

interface ResearchReviewProps {
    initialResults: ResearchResult[];
    onConfirm: (finalResults: ResearchResult[]) => void;
    onBack: () => void;
}

export default function ResearchReview({ initialResults, onConfirm, onBack }: ResearchReviewProps) {
    const [results, setResults] = useState<ResearchResult[]>(initialResults);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ title: string; summary: string }>({ title: '', summary: '' });

    const handleDelete = (id: string) => {
        if (confirm('確定要刪除這筆資料嗎？')) {
            setResults(results.filter(r => r.id !== id));
        }
    };

    const startEdit = (result: ResearchResult) => {
        setEditingId(result.id);
        setEditForm({ title: result.title, summary: result.summary });
    };

    const saveEdit = () => {
        if (!editingId) return;
        setResults(results.map(r =>
            r.id === editingId ? { ...r, title: editForm.title, summary: editForm.summary } : r
        ));
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">資料審查 (Research Review)</h2>
                <p className="text-sm md:text-base text-gray-600">請確認以下資料的正確性。這些資料將直接用於生成簡報。</p>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {results.map((result) => (
                        <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            layout
                        >
                            <Card className="relative group p-4 md:p-6">
                                {editingId === result.id ? (
                                    <div className="space-y-4">
                                        <input
                                            className="w-full text-lg font-bold border-b border-gray-300 focus:border-blue-500 outline-none py-1"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            placeholder="標題"
                                        />
                                        <textarea
                                            className="w-full h-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            value={editForm.summary}
                                            onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                                            placeholder="內容摘要"
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" onClick={cancelEdit} className="text-sm">取消</Button>
                                            <Button onClick={saveEdit} className="text-sm">保存修改</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{result.title}</h3>
                                            <div className="flex space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEdit(result)}
                                                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                    title="編輯"
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(result.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="刪除"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">{result.summary}</p>
                                        {result.sourceUrl && (
                                            <div className="mt-3 text-xs text-gray-400 flex items-center">
                                                <span className="mr-1">🔗</span>
                                                <span className="truncate max-w-[200px]">{result.sourceUrl}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {results.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">沒有資料。請返回上一頁重新搜尋或選擇筆記。</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-between pt-6 border-t border-gray-200 gap-4">
                <Button variant="ghost" onClick={onBack} className="w-full md:w-auto justify-center">
                    ← 返回搜尋
                </Button>
                <div className="text-center md:text-right w-full md:w-auto">
                    <p className="text-sm text-gray-500 mb-2 hidden md:block">確認資料無誤後，將進入簡報設定</p>
                    <Button
                        onClick={() => onConfirm(results)}
                        disabled={results.length === 0 || !!editingId}
                        className="px-8 w-full md:w-auto justify-center"
                    >
                        ✅ 確認資料並繼續
                    </Button>
                </div>
            </div>
        </div>
    );
}
