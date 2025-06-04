import React from 'react';
import {useForm} from 'react-hook-form';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {Alert, Box, Button, Container, Link, TextField, Typography,} from '@mui/material';
import {SignInData, useAuthStore} from '../../store/auth';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const {signIn, isLoading, error} = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<SignInData>();

  const onSubmit = async (data: SignInData) => {
    try {
      await signIn(data);
      navigate('/subscriptions');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        {error && (
          <Alert severity="error" sx={{mt: 2, width: '100%'}}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{mt: 3}}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            {...register('password', {required: 'Password is required'})}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{mt: 3, mb: 2}}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <Box sx={{textAlign: 'center'}}>
            <Link component={RouterLink} to="/signup" variant="body2">
              Don't have an account? Sign up
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
