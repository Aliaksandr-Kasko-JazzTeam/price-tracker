import React from 'react';
import {Box, Typography} from '@mui/material';
import {Subscription} from '../../types/subscription';
import {SubscriptionItem} from './SubscriptionItem';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onDelete: (id: string) => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onDelete,
}) => {
  if (subscriptions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No subscriptions yet. Add your first product URL above!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {subscriptions.map((subscription) => (
        <SubscriptionItem
          key={subscription.id}
          subscription={subscription}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
}
