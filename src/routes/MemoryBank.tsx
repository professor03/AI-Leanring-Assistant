import { useState } from 'react';
import { useMemoryStore } from '../../store/useMemoryStore';
import { KnowledgeAtom } from '../../types/memory';
import Card from '../ui/Card';
import { motion } from 'framer-motion';

export default function MemoryDashboard() {
    const { atoms, getStats, deleteAtom } = useMemoryStore();
    const stats = getStats();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAtoms = atoms.filter(atom =>
        atom.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atom.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">🧠</span>
                    Memory Bank
                </h1>
                <div className="text-sm text-gray-400">
                    The Core Engine of your Knowledge
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Atoms"
                    value={stats.totalAtoms}
                    icon="⚛️"
                    color="bg-blue-500/20 border-blue-500/50"
                />
                <StatsCard
                    title="Due Today"
                    value={stats.atomsDue}
                    icon="⏰"
                    color="bg-yellow-500/20 border-yellow-500/50"
                />
                <StatsCard
                    title="Mastered"
                    value={stats.masteredCount}
                    icon="🎓"
                    color="bg-green-500/20 border-green-500/50"
                />
                <StatsCard
                    title="New"
                    value={stats.newCount}
                    icon="🌱"
                    color="bg-purple-500/20 border-purple-500/50"
                />
            </div>

            {/* Atom List */}
            <Card className="bg-gray-800/50 border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Knowledge Atoms</h2>
                    <input
                        type="text"
                        placeholder="Search atoms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="text-xs uppercase bg-gray-900/50 text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Term</th>
                                <th className="px-6 py-3">Definition</th>
                                <th className="px-6 py-3">Mastery</th>
                                <th className="px-6 py-3">Next Review</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredAtoms.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No atoms found. Feed your brain by uploading notes!
                                    </td>
                                </tr>
                            ) : (
                                filteredAtoms.map((atom) => (
                                    <tr key={atom.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{atom.term}</td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={atom.definition}>
                                            {atom.definition}
                                        </td>
                                        <td className="px-6 py-4">
                                            <MasteryBar level={atom.mastery} />
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {new Date(atom.nextReview).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => deleteAtom(atom.id)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function StatsCard({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${color} backdrop-blur-sm`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                </div>
                <div className="text-2xl">{icon}</div>
            </div>
        </motion.div>
    );
}

function MasteryBar({ level }: { level: number }) {
    return (
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={`w-2 h-6 rounded-sm ${i < level
                            ? 'bg-gradient-to-t from-blue-600 to-cyan-400'
                            : 'bg-gray-700'
                        }`}
                />
            ))}
        </div>
    );
}
