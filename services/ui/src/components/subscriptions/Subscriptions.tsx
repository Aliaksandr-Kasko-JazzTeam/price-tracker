import React, {useState, useEffect, useCallback} from 'react';
import {Container, Typography, Button, Box} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {Subscription} from '../../types/subscription';
import {SubscriptionForm} from './SubscriptionForm';
import {SubscriptionList} from './SubscriptionList';
import {useApi} from '../../hooks/useApi';
import {useAuthStore} from '../../store/auth';

export const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<Error>();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const { api, isLoading } = useApi({
    onAuthError: () => {
      navigate('/signin');
    },
  });

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (err) {
      if (err instanceof Error && 'response' in err && (err as any).response?.status === 401) return;
      console.error('Failed to fetch subscriptions:', err);
    }
  }, [api]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    try {
      const response = await api.post('/subscriptions', { url: newUrl });
      setSubscriptions([...subscriptions, response.data]);
      setNewUrl('');
    } catch (err) {
      if (err instanceof Error && 'response' in err && (err as any).response?.status === 401) return;
      setError(err instanceof Error ? err : new Error('Failed to subscribe'));
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await api.post('/subscriptions/unsubscribe', {productId});
      setSubscriptions(subscriptions => subscriptions.filter(sub => sub.id !== productId));
    } catch (err) {
      if (err instanceof Error && 'response' in err && (err as any).response?.status === 401) return;
      console.error('Failed to delete subscription:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Price Tracker
        </Typography>
        <Button variant="outlined" color="primary" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Box>

      <SubscriptionForm
        newUrl={newUrl}
        onUrlChange={setNewUrl}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />

      <SubscriptionList
        subscriptions={subscriptions}
        onDelete={handleDelete}
      />
    </Container>
  );
}
