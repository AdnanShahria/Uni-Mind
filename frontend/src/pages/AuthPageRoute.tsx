import { useSearchParams } from 'react-router-dom';
import { AuthPage } from '../components/AuthPage';

export const AuthPageRoute = () => {
  const [searchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as 'login' | 'register') || 'register';

  return (
    <AuthPage
      initialTab={tab}
      onBackToHome={() => { window.location.href = '/'; }}
      onEnterWorkspace={() => { window.location.href = '/app'; }}
    />
  );
};
