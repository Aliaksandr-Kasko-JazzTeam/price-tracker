import React, {useState} from 'react';
import {AxiosError} from 'axios';
import {api} from '../api/client';

interface UseApiOptions {
  onAuthError?: () => void;
}

export const useApi = (options: UseApiOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestInterceptor = api.interceptors.request.use(
    (config) => {
      setIsLoading(true);
      return config;
    },
    (error) => {
      setIsLoading(false);
      return Promise.reject(error);
    }
  );

  const responseInterceptor = api.interceptors.response.use(
    (response) => {
      setIsLoading(false);
      return response;
    },
    (error: AxiosError) => {
      setIsLoading(false);

      if (error.response?.status === 401) {
        options.onAuthError?.();
      }

      return Promise.reject(error);
    }
  );

  React.useEffect(() => {
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [requestInterceptor, responseInterceptor]);

  return {api, isLoading};
}
