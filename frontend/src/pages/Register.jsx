import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth, dashboardPath } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Please enter your name (at least 2 characters).');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const { name, email, password, role } = form;
      const u = await register({ name, email, password, role });
      navigate(dashboardPath(u.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-3">Create your account</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Full name</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={form.password} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm password</Form.Label>
              <Form.Control type="password" name="confirm" value={form.confirm} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>I want to</Form.Label>
              <Form.Select name="role" value={form.role} onChange={handleChange}>
                <option value="student">Learn (Student)</option>
                <option value="instructor">Teach (Instructor)</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" className="btn-brand w-100" disabled={submitting}>{submitting ? 'Creating…' : 'Sign up'}</Button>
          </Form>
          <p className="mt-3 mb-0 text-center">Already registered? <Link to="/login">Log in</Link></p>
        </Card.Body>
      </Card>
    </Container>
  );
}
