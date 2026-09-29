import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const colors = ['#4f46e5', '#0891b2', '#db2777', '#059669', '#d97706', '#7c3aed'];
const colorFor = (text) => colors[[...text].reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];

export default function CourseCard({ course }) {
  return (
    <Card className="course-card h-100">
      <div className="course-thumb" style={{ background: colorFor(course.category) }}>
        {course.category}
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title>{course.title}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {course.description.length > 90 ? `${course.description.slice(0, 90)}…` : course.description}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">by {course.instructor?.name || 'Unknown'}</small>
          <Badge bg={course.price === 0 ? 'success' : 'primary'}>{course.price === 0 ? 'Free' : `$${course.price}`}</Badge>
        </div>
        <Button as={Link} to={`/courses/${course._id}`} className="btn-brand" size="sm">View details</Button>
      </Card.Body>
    </Card>
  );
}
