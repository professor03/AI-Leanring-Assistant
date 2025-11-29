import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ReviewTask, StudentTaskType, TaskVector } from '../../types';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { STUDENT_TASK_OPTIONS, REVIEW_TYPE_META } from '../../lib/constants';
import { toISODate } from '../../lib/format';
import TaskQuadrant from './TaskQuadrant';

interface TodayTasksProps {
  tasks: ReviewTask[];
  onAddTask?: (input: {
    title: string;
    type: StudentTaskType;
    dueDate: string;
    vector: TaskVector;
  }) => void;
  onDeleteTask?: (id: string) => void;
}

const statusChip = (status: ReviewTask['status']) =>
  status === 'done'
    ? { label: '完成', tone: 'success' as const }
    : { label: '待完成', tone: 'warning' as const };

const methodLabel = (method?: ReviewTask['method']) => {
  if (method === 'spaced-review') return 'Spaced Review';
  if (method === 'active-recall') return 'Active Recall';
  return null;
};

const TodayTasks = ({ tasks, onAddTask, onDeleteTask }: TodayTasksProps) => {
  const [form, setForm] = useState({
    title: '',
    dueDate: '',
    type: STUDENT_TASK_OPTIONS[0].value,
    focus: 60,
    urgency: 50,
  });

  const todayISO = toISODate(new Date());
  const todaysTasks = useMemo(
    () => tasks.filter((task) => task.dueDate === todayISO),
    [tasks, todayISO],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title || !form.dueDate) return;
    onAddTask?.({
      title: form.title,
      type: form.type,
      dueDate: form.dueDate,
      vector: { focus: form.focus, urgency: form.urgency },
    });
    setForm({ title: '', dueDate: '', type: STUDENT_TASK_OPTIONS[0].value, focus: 60, urgency: 50 });
  };

  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">今日任務</h2>
        <span className="text-sm text-gray-500">{todaysTasks.length} 項</span>
      </div>
      {onAddTask && (
        <form
          className="mb-6 grid gap-4 rounded-2xl border border-white/30 p-4 backdrop-blur-lg"
          onSubmit={handleSubmit}
        >
          <Input
            label="任務標題"
            placeholder="輸入任務內容"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="到期日"
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
            />
            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
              類型
              <select
                className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-text-dark focus:border-primary focus:ring-2 focus:ring-secondary/40 backdrop-blur transition"
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value as StudentTaskType }))
                }
              >
                {STUDENT_TASK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
              重要程度（X 軸） {form.focus}/100
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={form.focus}
                onChange={(event) => setForm((prev) => ({ ...prev, focus: Number(event.target.value) }))}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
              緊急程度（Y 軸） {form.urgency}/100
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={form.urgency}
                onChange={(event) => setForm((prev) => ({ ...prev, urgency: Number(event.target.value) }))}
              />
            </label>
          </div>
          <div className="text-xs text-gray-500">
            AI 會為學習型任務自動安排 D+3 / D+7 / D+14 的複習節奏。
          </div>
          <div className="flex justify-end">
            <Button type="submit">新增任務</Button>
          </div>
        </form>
      )}
      <div className="space-y-4">
        {todaysTasks.map((task) => {
          const meta = REVIEW_TYPE_META[task.type];
          const method = methodLabel(task.method);
          return (
            <div key={task.id} className="relative flex flex-col gap-2 rounded-2xl border border-white/30 p-4 backdrop-blur">
              {onDeleteTask && (
                <button
                  type="button"
                  className="absolute right-4 top-4 text-sm text-gray-400 hover:text-gray-700"
                  onClick={() => {
                    onDeleteTask(task.id);
                    if (task.status === 'done') {
                      useAppStore.getState().triggerPet();
                    }
                  }}
                  aria-label="刪除任務"
                >
                  ✕
                </button>
              )}
              <div className="flex items-start justify-between pr-8">
                <p className="font-medium text-text-dark">{task.title}</p>
                <Chip {...statusChip(task.status)} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.colorClass}`}>
                    {meta.label}
                  </span>
                  {method && (
                    <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-slate-700">
                      {method}
                    </span>
                  )}
                </div>
                <span>到期：{task.dueDate}</span>
              </div>
            </div>
          );
        })}
        {todaysTasks.length === 0 && (
          <p className="text-sm text-gray-500">今天尚未安排任務，先新增一項吧！</p>
        )}
      </div>
      <div className="mt-6">
        <TaskQuadrant tasks={todaysTasks} />
      </div>
    </Card >
  );
};

export default TodayTasks;
