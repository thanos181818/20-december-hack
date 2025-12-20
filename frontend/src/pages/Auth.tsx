import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Redirect /auth to /login for backward compatibility
const Auth = () => {
  return (
    <>
      <Helmet>
        <title>Redirecting... | ApparelDesk</title>
      </Helmet>
      <Navigate to="/login" replace />
    </>
  );
};

export default Auth;
