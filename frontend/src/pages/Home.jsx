import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import { courseService, errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📚', title: 'Browse courses', text: 'Explore courses across many categories.' },
  { icon: '🧑‍🏫', title: 'Learn from instructors', text: 'Instructors publish lessons and manage their courses.' },
  { icon: '📈', title: 'Track progress', text: 'Enroll and follow your progress from your dashboard.' },
];

export default function Home() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    courseService
      .list()
      .then((data) => setCourses(data.slice(0, 3)))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero bg-brand text-center">
        <Container>
          <h1 className="display-4 fw-bold">Learn without limits</h1>
          <p className="lead mb-4">LearnHub is a learning platform where students enroll in courses and instructors share their knowledge.</p>
          <Button as={Link} to="/courses" variant="light" size="lg" className="me-2">Browse courses</Button>
          {!user && <Button as={Link} to="/register" variant="outline-light" size="lg">Get started</Button>}
        </Container>
      </section>

      <Container className="py-5">
        <Row className="text-center g-4">
          {features.map((f) => (
            <Col md={4} key={f.title}>
              <div className="display-5">{f.icon}</div>
              <h5 className="mt-2">{f.title}</h5>
              <p className="text-muted">{f.text}</p>
            </Col>
          ))}
        </Row>

        <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
          <h3 className="mb-0">Latest courses</h3>
          <Link to="/courses">See all →</Link>
        </div>
        {loading && <Loader />}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && courses.length === 0 && <Alert variant="info">No courses yet.</Alert>}
        <Row xs={1} md={3} className="g-4">
          {courses.map((c) => (
            <Col key={c._id}><CourseCard course={c} /></Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
