import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, ProgressBar, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { enrollmentService, errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    enrollmentService
      .myCourses()
      .then(setEnrollments)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const completed = enrollments.filter((e) => e.progress === 100).length;

  return (
    <Container className="py-4">
      <h2>Student dashboard</h2>
      <p className="text-muted">Welcome, {user.name}. Here are the courses you are enrolled in.</p>
      <Row className="g-3 mb-4">
        <Col sm={6}><Card className="stat-card text-center p-3"><div className="value">{enrollments.length}</div>Enrolled courses</Card></Col>
        <Col sm={6}><Card className="stat-card text-center p-3"><div className="value">{completed}</div>Completed</Card></Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Loader />
      ) : enrollments.length === 0 ? (
        <Alert variant="info">
          You have not enrolled in any course yet. <Link to="/courses">Browse courses</Link>
        </Alert>
      ) : (
        <Row xs={1} md={2} className="g-3">
          {enrollments.map((e) => (
            <Col key={e._id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{e.course.title}</Card.Title>
                  <Card.Subtitle className="mb-3 text-muted">{e.course.category} · {e.course.instructor?.name}</Card.Subtitle>
                  <ProgressBar now={e.progress} label={`${e.progress}%`} className="mb-3" />
                  <Button as={Link} to={`/courses/${e.course._id}`} size="sm" className="btn-brand">
                    {e.progress === 100 ? 'Review course' : 'Continue learning'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
