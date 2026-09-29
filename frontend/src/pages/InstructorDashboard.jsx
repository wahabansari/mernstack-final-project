import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge, Modal } from 'react-bootstrap';
import Loader from '../components/Loader';
import { courseService, errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyCourse = { title: '', description: '', category: 'Frontend', price: 0 };
const emptyLesson = { title: '', content: '', videoUrl: '' };
const categories = ['Frontend', 'Backend', 'Database', 'Security', 'Design', 'Other'];

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyCourse);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ type: '', text: '' });
  const [lessonCourse, setLessonCourse] = useState(null);
  const [lesson, setLesson] = useState(emptyLesson);

  const load = () =>
    courseService
      .mine()
      .then(setCourses)
      .catch((e) => setAlert({ type: 'danger', text: errorMessage(e) }))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return setAlert({ type: 'danger', text: 'Title and description are required.' });
    if (Number(form.price) < 0 || Number.isNaN(Number(form.price))) return setAlert({ type: 'danger', text: 'Price must be 0 or more.' });
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) await courseService.update(editingId, payload);
      else await courseService.create(payload);
      setAlert({ type: 'success', text: editingId ? 'Course updated.' : 'Course created.' });
      setForm(emptyCourse);
      setEditingId(null);
      load();
    } catch (err) {
      setAlert({ type: 'danger', text: errorMessage(err) });
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({ title: c.title, description: c.description, category: c.category, price: c.price });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete "${c.title}"? Enrollments will be removed too.`)) return;
    try {
      await courseService.remove(c._id);
      setAlert({ type: 'success', text: 'Course deleted.' });
      load();
    } catch (err) {
      setAlert({ type: 'danger', text: errorMessage(err) });
    }
  };

  const openLessons = async (c) => {
    setLesson(emptyLesson);
    setLessonCourse(await courseService.get(c._id));
  };

  const addLesson = async (e) => {
    e.preventDefault();
    if (!lesson.title.trim()) return setAlert({ type: 'danger', text: 'Lesson title is required.' });
    try {
      setLessonCourse(await courseService.addLesson(lessonCourse._id, lesson));
      setLesson(emptyLesson);
      load();
    } catch (err) {
      setAlert({ type: 'danger', text: errorMessage(err) });
    }
  };

  const removeLesson = async (lessonId) => {
    try {
      setLessonCourse(await courseService.removeLesson(lessonCourse._id, lessonId));
      load();
    } catch (err) {
      setAlert({ type: 'danger', text: errorMessage(err) });
    }
  };

  return (
    <Container className="py-4">
      <h2>{user.role === 'admin' ? 'Course management' : 'Instructor dashboard'}</h2>
      <p className="text-muted">Create, edit and delete your courses, and upload lessons.</p>
      {alert.text && <Alert variant={alert.type} dismissible onClose={() => setAlert({ type: '', text: '' })}>{alert.text}</Alert>}

      <Row className="g-4">
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>{editingId ? 'Edit course' : 'New course'}</h5>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label>Title</Form.Label>
                  <Form.Control name="title" value={form.title} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={form.category} onChange={handleChange}>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control type="number" min="0" name="price" value={form.price} onChange={handleChange} />
                </Form.Group>
                <Button type="submit" className="btn-brand me-2">{editingId ? 'Save changes' : 'Create course'}</Button>
                {editingId && <Button variant="secondary" onClick={() => { setEditingId(null); setForm(emptyCourse); }}>Cancel</Button>}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <h5>Your courses</h5>
          {loading ? <Loader /> : courses.length === 0 ? (
            <Alert variant="info">You have not created any courses yet.</Alert>
          ) : (
            <Table responsive hover className="bg-white shadow-sm align-middle">
              <thead><tr><th>Title</th><th>Category</th><th>Price</th><th>Lessons</th><th>Students</th><th /></tr></thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <td><Badge bg="secondary">{c.category}</Badge></td>
                    <td>{c.price === 0 ? 'Free' : `$${c.price}`}</td>
                    <td>{c.lessons.length}</td>
                    <td>{c.enrolledCount}</td>
                    <td className="text-end text-nowrap">
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openLessons(c)}>Lessons</Button>
                      <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => startEdit(c)}>Edit</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(c)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      <Modal show={!!lessonCourse} onHide={() => setLessonCourse(null)} size="lg">
        <Modal.Header closeButton><Modal.Title>Lessons — {lessonCourse?.title}</Modal.Title></Modal.Header>
        <Modal.Body>
          {lessonCourse?.lessons.length === 0 && <p className="text-muted">No lessons yet.</p>}
          <ul className="list-group mb-3">
            {lessonCourse?.lessons.map((l, i) => (
              <li key={l._id} className="list-group-item d-flex justify-content-between align-items-start">
                <div><strong>{i + 1}. {l.title}</strong><div className="small text-muted">{l.content}</div></div>
                <Button size="sm" variant="outline-danger" onClick={() => removeLesson(l._id)}>Remove</Button>
              </li>
            ))}
          </ul>
          <Form onSubmit={addLesson}>
            <Form.Control className="mb-2" placeholder="Lesson title" value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} />
            <Form.Control className="mb-2" as="textarea" rows={2} placeholder="Lesson content / notes" value={lesson.content} onChange={(e) => setLesson({ ...lesson, content: e.target.value })} />
            <Form.Control className="mb-2" placeholder="Video URL (optional)" value={lesson.videoUrl} onChange={(e) => setLesson({ ...lesson, videoUrl: e.target.value })} />
            <Button type="submit" className="btn-brand">Add lesson</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
