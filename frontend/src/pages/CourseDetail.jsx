import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert, ListGroup, ProgressBar, Form } from 'react-bootstrap';
import Loader from '../components/Loader';
import { courseService, enrollmentService, errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setLoading(true);
    courseService
      .get(id)
      .then(setCourse)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  // For students, find out whether they are already enrolled
  useEffect(() => {
    if (user?.role !== 'student') return;
    enrollmentService
      .myCourses()
      .then((list) => setEnrollment(list.find((e) => e.course._id === id) || null))
      .catch(() => {});
  }, [id, user]);

  const handleEnroll = async () => {
    try {
      const e = await enrollmentService.enroll(id);
      setEnrollment(e);
      setMessage({ type: 'success', text: 'You are enrolled! Find this course on your dashboard.' });
    } catch (err) {
      setMessage({ type: 'danger', text: errorMessage(err) });
    }
  };

  const toggleLesson = async (lessonId) => {
    try {
      setEnrollment(await enrollmentService.toggleLesson(enrollment._id, lessonId).then((u) => ({ ...enrollment, ...u })));
    } catch (err) {
      setMessage({ type: 'danger', text: errorMessage(err) });
    }
  };

  if (loading) return <Loader />;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert><Link to="/courses">← Back to courses</Link></Container>;

  const done = (lessonId) => enrollment?.completedLessons?.includes(lessonId);

  return (
    <Container className="py-4">
      <Link to="/courses">← Back to courses</Link>
      <Row className="mt-3 g-4">
        <Col lg={8}>
          <Badge bg="secondary" className="mb-2">{course.category}</Badge>
          <h2>{course.title}</h2>
          <p className="text-muted">By {course.instructor?.name}</p>
          <p>{course.description}</p>

          <h5 className="mt-4">Lessons ({course.lessons.length})</h5>
          {course.lessons.length === 0 ? (
            <Alert variant="light">The instructor has not uploaded lessons yet.</Alert>
          ) : (
            <ListGroup>
              {course.lessons.map((l, i) => (
                <ListGroup.Item key={l._id}>
                  <div className="d-flex align-items-center gap-2">
                    {enrollment && (
                      <Form.Check type="checkbox" checked={!!done(l._id)} onChange={() => toggleLesson(l._id)} aria-label="Mark complete" />
                    )}
                    <strong>{i + 1}. {l.title}</strong>
                    {!enrollment && <span className="ms-auto" title="Enroll to unlock">🔒</span>}
                  </div>
                  {/* Lesson content is only visible to enrolled students, the owner and admins */}
                  {(enrollment || user?.role === 'admin' || user?._id === course.instructor?._id) && (
                    <div className="small text-muted mt-1">
                      {l.content}
                      {l.videoUrl && <> · <a href={l.videoUrl} target="_blank" rel="noreferrer">Watch video</a></>}
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3>{course.price === 0 ? 'Free' : `$${course.price}`}</h3>
              {message.text && <Alert variant={message.type}>{message.text}</Alert>}
              {!user && (
                <Button as={Link} to="/login" state={{ from: `/courses/${id}`, message: 'Log in as a student to enroll.' }} className="btn-brand w-100">
                  Log in to enroll
                </Button>
              )}
              {user?.role === 'student' && !enrollment && <Button className="btn-brand w-100" onClick={handleEnroll}>Enroll now</Button>}
              {user?.role === 'student' && enrollment && (
                <>
                  <Badge bg="success" className="mb-2">Enrolled</Badge>
                  <ProgressBar now={enrollment.progress} label={`${enrollment.progress}%`} />
                </>
              )}
              {user && user.role !== 'student' && <Alert variant="info" className="mb-0">Only student accounts can enroll.</Alert>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
