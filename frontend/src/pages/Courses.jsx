import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import { courseService, errorMessage } from '../services/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Re-fetch (debounced) whenever the filters change
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      courseService
        .list({ search: search || undefined, category: category || undefined })
        .then((data) => { setCourses(data); setError(''); })
        .catch((e) => setError(errorMessage(e)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search, category]);

  const categories = ['Frontend', 'Backend', 'Database', 'Security', 'Design', 'Other'];

  return (
    <Container className="py-4">
      <h2 className="mb-3">All courses</h2>
      <Row className="g-2 mb-4">
        <Col md={8}>
          <Form.Control placeholder="Search courses by title…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Col>
        <Col md={4}>
          <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </Form.Select>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Loader />
      ) : courses.length === 0 && !error ? (
        <Alert variant="info">No courses match your search.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {courses.map((c) => (
            <Col key={c._id}><CourseCard course={c} /></Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
