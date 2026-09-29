import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Container className="py-5 text-center">
      <h1 className="display-3">404</h1>
      <p className="lead">The page you are looking for does not exist.</p>
      <Link to="/">Back to home</Link>
    </Container>
  );
}
