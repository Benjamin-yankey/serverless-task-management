import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsConfig from './aws-config';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import './App.css';

Amplify.configure(awsConfig as any);

const App: React.FC = () => {
  return (
    <Router>
      <Authenticator
        signUpAttributes={['email']}
        loginMechanisms={['email']}
      >
        {({ signOut, user }) => (
          <AuthProvider>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        )}
      </Authenticator>
    </Router>
  );
};

export default App;
