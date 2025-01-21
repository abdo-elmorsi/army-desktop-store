import React, { useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout, Progress } from '@/components';

// Lazy load the pages
const Home = lazy(() => import('@/pages/Home'));
const Users = lazy(() => import('@/pages/users'));
const Products = lazy(() => import('@/pages/products'));
const ProductsForm = lazy(() => import('@/pages/products/add-update'));
const TransactionsHistory = lazy(() => import('@/pages/products/transactions'));
const ProductsTransactionsForm = lazy(() => import('@/pages/products/transactions/add-update'));
const Stores = lazy(() => import('@/pages/stores'));
const Units = lazy(() => import('@/pages/units'));
const Settings = lazy(() => import('@/pages/Settings'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const Login = lazy(() => import('@/pages/Login'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const StoreForm = lazy(() => import('@/pages/stores/add-update'));
const UnitForm = lazy(() => import('@/pages/units/add-update'));

function App() {

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedFontSize = JSON.parse(localStorage.getItem('font-size') || '{"value": "22"}');

    document.documentElement.classList.toggle('dark', savedDarkMode);
    document.documentElement.style.fontSize = `${savedFontSize.value}px`
  }, []);

  return (
    <div className=''>
      <Router>
      <Suspense fallback={<Progress />}>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/view" element={<Home view={true} />} />
          <Route path="/users" element={<Layout><Users /></Layout>} />

          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/products/add" element={<Layout><ProductsForm /></Layout>} />
          <Route path="/products/edit/:id" element={<Layout><ProductsForm /></Layout>} />
          <Route path="/transactions/:id" element={<Layout><TransactionsHistory /></Layout>} />
          <Route path="/transactions/add" element={<Layout><ProductsTransactionsForm /></Layout>} />
          <Route path="/transactions/edit/:id" element={<Layout><ProductsTransactionsForm /></Layout>} />

          <Route path="/stores" element={<Layout><Stores /></Layout>} />
          <Route path="/stores/add" element={<Layout><StoreForm /></Layout>} />
          <Route path="/stores/edit/:id" element={<Layout><StoreForm /></Layout>} />

          <Route path="/units" element={<Layout><Units /></Layout>} />
          <Route path="/units/add" element={<Layout><UnitForm /></Layout>} />
          <Route path="/units/edit/:id" element={<Layout><UnitForm /></Layout>} />

          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
    </div>
  );
}

export default App;
