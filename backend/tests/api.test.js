// End-to-end API test. Start the server first (e.g. `npm run dev`), then: npm test
// Set API_URL to test a deployed instance. Uses only Node's built-in fetch.
const BASE = process.env.API_URL || 'http://localhost:5000/api';
let passed = 0;
let failed = 0;

const call = async (method, path, body, token) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};

const check = (name, cond, extra = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name} ${extra}`); }
};

(async () => {
  const stamp = Date.now();
  console.log('Auth');
  let r = await call('POST', '/register', { name: 'T', email: 'bad' , password: '123456' });
  check('register rejects invalid email (400)', r.status === 400, JSON.stringify(r.data));
  r = await call('POST', '/register', { name: 'Test Student', email: `s${stamp}@t.com`, password: '123' });
  check('register rejects short password (400)', r.status === 400);
  r = await call('POST', '/register', { name: 'Test Student', email: `s${stamp}@t.com`, password: 'secret1', role: 'admin' });
  check('register cannot self-assign admin (400)', r.status === 400);
  r = await call('POST', '/register', { name: 'Test Student', email: `s${stamp}@t.com`, password: 'secret1' });
  check('register student (201 + token)', r.status === 201 && !!r.data.token);
  const student = r.data;
  r = await call('POST', '/register', { name: 'Test Student', email: `s${stamp}@t.com`, password: 'secret1' });
  check('duplicate email rejected (409)', r.status === 409);
  r = await call('POST', '/register', { name: 'Test Instructor', email: `i${stamp}@t.com`, password: 'secret1', role: 'instructor' });
  check('register instructor (201)', r.status === 201);
  const instructor = r.data;
  r = await call('POST', '/login', { email: `s${stamp}@t.com`, password: 'wrong' });
  check('login wrong password (401)', r.status === 401);
  r = await call('POST', '/login', { email: `s${stamp}@t.com`, password: 'secret1' });
  check('login ok (200 + token)', r.status === 200 && !!r.data.token);
  r = await call('POST', '/login', { email: 'admin@learnhub.com', password: 'admin123' });
  check('seeded admin can log in', r.status === 200 && r.data.user.role === 'admin');
  const admin = r.data;

  console.log('Protected routes');
  r = await call('GET', '/my-courses');
  check('no token -> 401', r.status === 401);
  r = await call('GET', '/my-courses', null, 'garbage');
  check('bad token -> 401', r.status === 401);
  r = await call('POST', '/courses', { title: 'x', description: 'y', category: 'z', price: 1 }, student.token);
  check('student cannot create course (403)', r.status === 403);
  r = await call('GET', '/admin/analytics', null, instructor.token);
  check('instructor cannot view analytics (403)', r.status === 403);

  console.log('Course CRUD');
  r = await call('POST', '/courses', { title: 'No price' }, instructor.token);
  check('invalid course rejected (400)', r.status === 400, JSON.stringify(r.data));
  r = await call('POST', '/courses', { title: 'Test Course', description: 'Desc', category: 'Testing', price: 10 }, instructor.token);
  check('instructor creates course (201)', r.status === 201);
  const course = r.data;
  r = await call('GET', '/courses');
  check('GET /courses lists new course', r.status === 200 && r.data.some((c) => c._id === course._id));
  r = await call('GET', `/courses/${course._id}`);
  check('GET /courses/:id (200)', r.status === 200 && r.data.title === 'Test Course');
  r = await call('GET', '/courses/notanid');
  check('invalid id -> 400', r.status === 400);
  r = await call('PUT', `/courses/${course._id}`, { price: 25 }, instructor.token);
  check('owner updates course', r.status === 200 && r.data.price === 25);
  r = await call('POST', `/courses/${course._id}/lessons`, { title: 'Lesson 1', content: 'Hello' }, instructor.token);
  check('instructor adds lesson (201)', r.status === 201 && r.data.lessons.length === 1);
  const lessonId = r.data.lessons[0]._id;

  console.log('Enrollment');
  r = await call('POST', '/enroll', { courseId: course._id }, student.token);
  check('student enrolls (201)', r.status === 201);
  const enrollmentId = r.data._id;
  r = await call('POST', '/enroll', { courseId: course._id }, student.token);
  check('double enrollment rejected (409)', r.status === 409);
  r = await call('POST', '/enroll', { courseId: course._id }, instructor.token);
  check('instructor cannot enroll (403)', r.status === 403);
  r = await call('GET', '/my-courses', null, student.token);
  check('GET /my-courses shows enrollment', r.status === 200 && r.data.length === 1 && r.data[0].course._id === course._id);
  r = await call('PUT', `/enrollments/${enrollmentId}/progress`, { lessonId }, student.token);
  check('completing lesson sets progress 100', r.status === 200 && r.data.progress === 100);

  console.log('Admin');
  r = await call('GET', '/admin/analytics', null, admin.token);
  check('admin analytics (200)', r.status === 200 && r.data.courses >= 1);
  r = await call('GET', '/admin/users', null, admin.token);
  check('admin lists users', r.status === 200 && r.data.length >= 3);
  r = await call('PUT', `/admin/users/${student.user._id}`, { role: 'instructor' }, admin.token);
  check('admin changes role', r.status === 200 && r.data.role === 'instructor');

  console.log('Cleanup');
  r = await call('DELETE', `/courses/${course._id}`, null, instructor.token);
  check('owner deletes course (200)', r.status === 200);
  r = await call('GET', `/courses/${course._id}`);
  check('deleted course -> 404', r.status === 404);
  r = await call('DELETE', `/admin/users/${student.user._id}`, null, admin.token);
  check('admin deletes user', r.status === 200);
  r = await call('DELETE', `/admin/users/${instructor.user._id}`, null, admin.token);
  check('admin deletes instructor', r.status === 200);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
