import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createTheme, ThemeProvider} from '@mui/material';
import {SignIn} from './components/auth/SignIn';
import {SignUp} from './components/auth/SignUp';
import {Subscriptions} from './components/subscriptions/Subscriptions';
import {useAuthStore} from './store/auth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const queryClient = new QueryClient();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const {token} = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/signin"/>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/signin" element={<SignIn/>}/>
            <Route path="/signup" element={<SignUp/>}/>
            <Route
              path="/subscriptions"
              element={
                <PrivateRoute>
                  <Subscriptions/>
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/subscriptions"/>}/>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App
