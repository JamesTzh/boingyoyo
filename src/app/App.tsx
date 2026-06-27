import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { Header } from './Header';
import { IntroScreen } from '@/features/intro/IntroScreen';
import { FeedScreen } from '@/features/marketplace/FeedScreen';
import { ListingDetailScreen } from '@/features/marketplace/ListingDetailScreen';
import { ChatScreen } from '@/features/chat/ChatScreen';
import { TraceScreen } from '@/features/grading/TraceScreen';
import { ReportScreen } from '@/features/report/ReportScreen';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<IntroScreen />} />
            <Route path="/feed" element={<FeedScreen />} />
            <Route path="/listing/:id" element={<ListingDetailScreen />} />
            <Route path="/chat/:id" element={<ChatScreen />} />
            <Route path="/trace/:archetypeId" element={<TraceScreen />} />
            <Route path="/report" element={<ReportScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ThemeProvider>
  );
}
