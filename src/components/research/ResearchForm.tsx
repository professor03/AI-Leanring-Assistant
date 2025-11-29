import { useState, type FormEvent } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface ResearchFormValues {
  topic: string;
  course: string;
}

interface ResearchFormProps {
  onSearch: (values: ResearchFormValues) => void;
  isLoading?: boolean;
}

const ResearchForm = ({ onSearch, isLoading }: ResearchFormProps) => {
  const [form, setForm] = useState<ResearchFormValues>({ topic: '', course: 'Finance' });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.topic) return;
    onSearch(form);
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Research Assistant</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="報告主題"
          placeholder="輸入想研究的主題"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        />
        <label className="flex flex-col gap-2 text-sm text-text-normal">
          課程領域
          <select
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
          >
            <option value="Finance">Finance</option>
            <option value="Computer Science">Computer Science</option>
            <option value="English">English</option>
            <option value="Psychology">Psychology</option>
          </select>
        </label>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '查詢中...' : '生成資料蒐集建議'}
        </Button>
      </form>
    </Card>
  );
};

export default ResearchForm;
