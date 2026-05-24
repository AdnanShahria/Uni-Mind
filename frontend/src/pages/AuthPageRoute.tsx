import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthPage } from '../components/AuthPage';

export const AuthPageRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as 'login' | 'register') || 'register';

  return (
    <AuthPage
      initialTab={tab}
      onBackToHome={() => navigate('/')}
      onEnterWorkspace={() => navigate('/app')}
    />
  );
};
