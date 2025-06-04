import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Link,
} from '@mui/material';
import {Delete as DeleteIcon, OpenInNew as OpenInNewIcon} from '@mui/icons-material';
import {Subscription} from '../../types/subscription';

interface SubscriptionItemProps {
  subscription: Subscription;
  onDelete: (id: string) => void;
}

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  subscription,
  onDelete,
}) => {
  const isUnavailable = subscription.currentPrice === -1;

  return (
    <Card
      sx={{
        mb: 2,
        opacity: isUnavailable ? 0.5 : 1,
        filter: isUnavailable ? 'grayscale(100%)' : 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" gutterBottom>
              {subscription.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Link
                href={subscription.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Typography variant="body2" color="primary">
                  {subscription.url}
                </Typography>
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </Link>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={isUnavailable ? 'Unavailable' : `$${subscription.currentPrice}`}
                color={isUnavailable ? 'default' : 'primary'}
                size="small"
              />
            </Box>
          </Box>
          <IconButton
            onClick={() => onDelete(subscription.id)}
            size="small"
            sx={{ ml: 1 }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
