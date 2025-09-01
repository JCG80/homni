import React from 'react';
import { Route } from 'react-router-dom';
import { MinimalHomePage } from '@/pages/MinimalHomePage';
import { HomePage } from '@/pages/HomePage';
import { DebugHomePage } from '@/pages/DebugHomePage';
import { LoginPage } from '@/modules/auth/pages/LoginPage';

export const mainRoutes = [
  <Route key="home" path="/" element={<HomePage />} />,
  <Route key="test" path="/test" element={<MinimalHomePage />} />,
  <Route key="debug" path="/debug" element={<DebugHomePage />} />,
  <Route key="login" path="/login" element={<LoginPage />} />,
];