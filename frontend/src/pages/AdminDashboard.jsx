import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { adminService, courseService, errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user: me } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', text: '' });

  const load = () =>
    Promise.all([adminService.analytics(), adminService.users(), courseService.list()])
      .then(([s, u, c]) => { setStats(s); setUsers(u); setCourses(c); })
      .catch((e) => setAlert({ type: 'danger', text: errorMessage(e) }))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const run = async (fn, okText) => {
    try {
      await fn();
      setAlert({ type: 'success', text: okText });
      load();
    } catch (err) {
      setAlert({ type: 'danger', text: errorMessage(err) });
    }
  };

  if (loading) return <Loader />;

  const cards = stats && [
    ['Users', stats.users], ['Students', stats.students], ['Instructors', stats.instructors],
    ['Courses', stats.courses], ['Enrollments', stats.enrollments],
  ];

  return (
    <Container className="py-4">
      <h2>Admin dashboard</h2>
      {alert.text && <Alert variant={alert.type} dismissible onClose={() => setAlert({ type: '', text: '' })}>{alert.text}</Alert>}

      {stats && (
        <>
          <Row xs={2} md={5} className="g-3 mb-4">
            {cards.map(([label, value]) => (
              <Col key={label}><Card className="stat-card text-center p-3"><div className="value">{value}</div>{label}</Card></Col>
            ))}
          </Row>
          <Row className="g-4 mb-4">
            <Col md={6}>
              <Card className="shadow-sm h-100"><Card.Body>
                <h5>Most popular courses</h5>
                {stats.popular.length === 0 ? <p className="text-muted">No enrollments yet.</p> : (
                  <ol className="mb-0">{stats.popular.map((p) => <li key={p.title}>{p.title} <Badge bg="primary">{p.enrollments}</Badge></li>)}</ol>
                )}
              </Card.Body></Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm h-100"><Card.Body>
                <h5>Courses by category</h5>
                <ul className="mb-0">{stats.byCategory.map((c) => <li key={c._id}>{c._id}: <strong>{c.count}</strong></li>)}</ul>
              </Card.Body></Card>
            </Col>
          </Row>
        </>
      )}

      <h5>Manage users</h5>
      <Table responsive hover className="bg-white shadow-sm align-middle mb-4">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th /></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td style={{ width: 160 }}>
                <Form.Select size="sm" value={u.role} disabled={u._id === me._id}
                  onChange={(e) => run(() => adminService.setRole(u._id, e.target.value), `${u.name} is now ${e.target.value}.`)}>
                  <option value="student">student</option>
                  <option value="instructor">instructor</option>
                  <option value="admin">admin</option>
                </Form.Select>
              </td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="text-end">
                <Button size="sm" variant="outline-danger" disabled={u._id === me._id}
                  onClick={() => window.confirm(`Delete ${u.name}?`) && run(() => adminService.removeUser(u._id), 'User deleted.')}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center">
        <h5>Manage courses</h5>
        <Button as={Link} to="/dashboard/instructor" size="sm" className="btn-brand">Create a course</Button>
      </div>
      <Table responsive hover className="bg-white shadow-sm align-middle">
        <thead><tr><th>Title</th><th>Instructor</th><th>Category</th><th>Price</th><th /></tr></thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c._id}>
              <td><Link to={`/courses/${c._id}`}>{c.title}</Link></td>
              <td>{c.instructor?.name}</td>
              <td>{c.category}</td>
              <td>{c.price === 0 ? 'Free' : `$${c.price}`}</td>
              <td className="text-end">
                <Button size="sm" variant="outline-danger"
                  onClick={() => window.confirm(`Delete "${c.title}"?`) && run(() => courseService.remove(c._id), 'Course deleted.')}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
