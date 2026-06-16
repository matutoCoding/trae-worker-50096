import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import ImageAnalysis from '@/pages/ImageAnalysis';
import StripesLayout from '@/pages/StripesLayout';
import WeavingPreview from '@/pages/WeavingPreview';
import Archives from '@/pages/Archives';
import Templates from '@/pages/Templates';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<ImageAnalysis />} />
          <Route path="/stripes-layout" element={<StripesLayout />} />
          <Route path="/weaving-preview" element={<WeavingPreview />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/templates" element={<Templates />} />
        </Route>
      </Routes>
    </Router>
  );
}
