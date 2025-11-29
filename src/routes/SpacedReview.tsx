import { useEffect, useState } from 'react';
import TodayReviewList from '../components/review/TodayReviewList';
import ReviewScheduleTimeline from '../components/review/ReviewScheduleTimeline';
import { api } from '../lib/api';
import type { ReviewTask } from '../types';

const SpacedReview = () => {
  const [todayTasks, setTodayTasks] = useState<ReviewTask[]>([]);

  useEffect(() => {
    api.getDashboard().then((data) => setTodayTasks(data.todayTasks));
  }, []);

  return (
    <div className="space-y-6">
      <TodayReviewList tasks={todayTasks} />
      <ReviewScheduleTimeline />
    </div>
  );
};

export default SpacedReview;


