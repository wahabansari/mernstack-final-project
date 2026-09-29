import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Container } from 'react-bootstrap';
import { useAuth, dashboardPath } from '../context/AuthContext';
import Loader from './Loader';

// Blocks a page unless the user is logged in (and has one of the allowed roles)
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname, message: 'Please log in to continue.' }} replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Access denied</Alert.Heading>
          Your role (<strong>{user.role}</strong>) is not allowed to view this page.{' '}
          <Alert.Link href={dashboardPath(user.role)}>Go to your dashboard</Alert.Link>
        </Alert>
      </Container>
    );
  }
  return children;
}
