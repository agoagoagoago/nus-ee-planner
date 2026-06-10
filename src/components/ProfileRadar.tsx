import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import type { Ratings } from '@/types';

interface Props {
  ratings: Ratings;
  /** optional second profile to overlay (e.g. your quiz preferences) */
  compare?: Ratings;
  height?: number;
}

export function ProfileRadar({ ratings, compare, height = 200 }: Props) {
  const data = [
    { axis: 'Difficulty', a: ratings.difficulty, b: compare?.difficulty },
    { axis: 'Workload', a: ratings.workload, b: compare?.workload },
    { axis: 'Math', a: ratings.math, b: compare?.math },
    { axis: 'Prog', a: ratings.programming, b: compare?.programming },
    { axis: 'Hardware', a: ratings.hardware, b: compare?.hardware },
    { axis: 'Project', a: ratings.project, b: compare?.project },
  ];
  return (
    <div style={{ width: '100%', height }} aria-hidden>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#D9DCDD" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#42536E' }} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar dataKey="a" stroke="#BC643A" fill="#BC643A" fillOpacity={0.3} />
          {compare && <Radar dataKey="b" stroke="#1B7884" fill="#1B7884" fillOpacity={0.15} />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
