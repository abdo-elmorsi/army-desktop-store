import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Home, SignUp, Login, NotFound } from '@/pages';
import { Layout } from '@/components';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout>
          <Home />
        </Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
