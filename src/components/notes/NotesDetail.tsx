import type { NoteSection } from '../../types';
import { NOTES_SECTION_TITLE } from '../../lib/constants';
import Card from '../ui/Card';
import ReactMarkdown from 'react-markdown';

interface NotesDetailProps {
  sections: NoteSection[];
}

const headingId = 'notes-detail-heading';

const NotesDetail = ({ sections }: NotesDetailProps) => (
  <section aria-labelledby={headingId}>
    <Card>
      <header className="mb-4">
        <h2 id={headingId} className="text-xl font-semibold text-text-dark">
          {NOTES_SECTION_TITLE}
        </h2>
      </header>
      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{section.title}</h3>
            <div className="text-base leading-relaxed text-gray-600 prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  strong: (props: any) => <strong className="font-bold text-gray-900">{props.children}</strong>,
                  p: (props: any) => <p className="mb-3">{props.children}</p>,
                  ul: (props: any) => <ul className="list-disc list-inside mb-3">{props.children}</ul>,
                  ol: (props: any) => <ol className="list-decimal list-inside mb-3">{props.children}</ol>,
                }}
              >
                {section.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </section>
);

export default NotesDetail;
