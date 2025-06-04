import React from 'react';
import {Box, Button, TextField, Paper} from '@mui/material';

interface SubscriptionFormProps {
  newUrl: string;
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: Error;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  newUrl,
  onUrlChange,
  onSubmit,
  isLoading,
  error,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <form onSubmit={onSubmit}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Product URL"
            value={newUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://intersport.com.au/..."
            error={!!error}
            helperText={error?.message}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!newUrl || isLoading}
          >
            Subscribe
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
