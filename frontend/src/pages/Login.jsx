import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Please enter your email and password.');
    setSubmitting(true);
    try {
      const u = await login(form);
      navigate(location.state?.from || dashboardPath(u.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 460 }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-3">Welcome back</h3>
          {location.state?.message && <Alert variant="warning">{location.state.message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={form.password} onChange={handleChange} />
            </Form.Group>
            <Button type="submit" className="btn-brand w-100" disabled={submitting}>{submitting ? 'Logging in…' : 'Log in'}</Button>
          </Form>
          <p className="mt-3 mb-0 text-center">No account? <Link to="/register">Sign up</Link></p>
          <hr />
          <small className="text-muted">
            Demo: student@learnhub.com / student123 · instructor@learnhub.com / instructor123 · admin@learnhub.com / admin123
          </small>
        </Card.Body>
      </Card>
    </Container>
  );
}
