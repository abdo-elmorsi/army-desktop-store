import React, { useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Home, Products, Stores, Units, Settings, SignUp, Login, NotFound } from '@/pages';
import { Layout } from '@/components';
import ProductsForm from '@/pages/products/add-update';
import StoreForm from '@/pages/stores/add-update';
import UnitForm from './pages/units/add-update';

function App() {

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedFontSize = localStorage.getItem('font-size') || 16;
    document.documentElement.classList.toggle('dark', savedDarkMode);
    document.documentElement.style.fontSize = `${savedFontSize}px`

  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/view" element={<Home view={true} />} />

        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/products/add" element={<Layout><ProductsForm /></Layout>} />
        <Route path="/products/edit/:id" element={<Layout><ProductsForm /></Layout>} />

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
    </Router>
  );
}

export default App;
