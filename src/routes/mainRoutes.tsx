import React from 'react';
import { Route } from 'react-router-dom';
import { MinimalHomePage } from '@/pages/MinimalHomePage';
import { HomePage } from '@/pages/HomePage';
import { DebugHomePage } from '@/pages/DebugHomePage';
import { LoginPage } from '@/modules/auth/pages/LoginPage';

export const mainRoutes = [
  <Route key="home" path="/" element={<MinimalHomePage />} />,
  <Route key="homepage" path="/homepage" element={<HomePage />} />,
  <Route key="debug" path="/debug" element={<DebugHomePage />} />,
  <Route key="login" path="/login" element={<LoginPage />} />,
];