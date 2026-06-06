import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/Home/index';
import CaseStudyPage from '@/pages/CaseStudy/index';
import ArticlePage from '@/pages/Article/index';
import InsightsPage from '@/pages/Insights/index';
import { ARTICLE_ORDER } from '@/pages/Article/articles';
import NotFoundPage from '@/pages/NotFound/index';
import Layout from '@/components/Layout';

// Admin bundle (analytics dashboard + recharts) is lazy-loaded so it never
// ships to public visitors.
const AdminAnalyticsPage = lazy(() => import('@/pages/Admin/index'));
const AdminReportPage = lazy(() => import('@/pages/Admin/ReportPage'));

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted/40 text-xs tracking-widest uppercase">
      Loading…
    </div>
  );
}

/**
 * Router Configuration
 *
 * AI Agent Usage Guide:
 * 1. Add new page routes here (before the 404 route)
 * 2. Use lazy() for code splitting
 * 3. Wrap all lazy-loaded components with <Lazy>
 * 4. The 404 route must be last (path: '*')
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // AI Agent: Add new page routes here
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/work/:slug',
        element: <CaseStudyPage />,
      },
      {
        path: '/insights',
        element: <InsightsPage />,
      },
      // Health-software SEO cluster: one root-level route per article, generated
      // from ARTICLE_ORDER. Explicit static paths so unknown paths still 404.
      ...ARTICLE_ORDER.map((slug) => ({
        path: `/${slug}`,
        element: <ArticlePage slug={slug} />,
      })),
    ],
  },
  {
    path: '/admin/analytics',
    element: (
      <Suspense fallback={<AdminFallback />}>
        <AdminAnalyticsPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/report',
    element: (
      <Suspense fallback={<AdminFallback />}>
        <AdminReportPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
