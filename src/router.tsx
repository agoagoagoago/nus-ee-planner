/* eslint-disable react-refresh/only-export-components -- route config module, not a component file */
import { Suspense, lazy } from 'react';
import { createHashRouter } from 'react-router-dom';
import { Layout } from '@/components/Layout';

const Explore = lazy(() => import('@/views/Explore').then((m) => ({ default: m.Explore })));
const Pathways = lazy(() => import('@/views/Pathways').then((m) => ({ default: m.Pathways })));
const Planner = lazy(() => import('@/views/Planner').then((m) => ({ default: m.Planner })));
const Specialisation = lazy(() =>
  import('@/views/Specialisation').then((m) => ({ default: m.Specialisation })),
);
const Gpa = lazy(() => import('@/views/Gpa').then((m) => ({ default: m.Gpa })));
const About = lazy(() => import('@/views/About').then((m) => ({ default: m.About })));

function Loading() {
  return (
    <div className="py-16 text-center text-sm text-ink-faint" role="status" aria-live="polite">
      Loading…
    </div>
  );
}

const page = (el: React.ReactNode) => <Suspense fallback={<Loading />}>{el}</Suspense>;

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: page(<Explore />) },
      { path: 'pathways', element: page(<Pathways />) },
      { path: 'planner', element: page(<Planner />) },
      { path: 'specialisation', element: page(<Specialisation />) },
      { path: 'gpa', element: page(<Gpa />) },
      { path: 'about', element: page(<About />) },
    ],
  },
]);
