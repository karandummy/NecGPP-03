// src/components/layout/MainLayout.jsx
import Header from './Header';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[1920px] mx-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;