require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const run = async () => {
  await Promise.all([User.deleteMany(), Course.deleteMany(), Enrollment.deleteMany()]);
  await User.create({ name: 'Admin User', email: 'admin@learnhub.com', password: 'admin123', role: 'admin' });
  const inst = await User.create({ name: 'Sara Instructor', email: 'instructor@learnhub.com', password: 'instructor123', role: 'instructor' });
  const student = await User.create({ name: 'Ali Student', email: 'student@learnhub.com', password: 'student123', role: 'student' });

  const courses = await Course.create([
    { title: 'React from Scratch', description: 'Components, props, state, hooks and routing with React.', category: 'Frontend', price: 49, instructor: inst._id,
      lessons: [{ title: 'JSX & Components', content: 'Building blocks of React.' }, { title: 'State & Effects', content: 'useState and useEffect.' }, { title: 'React Router', content: 'Client-side navigation.' }] },
    { title: 'Node.js & Express APIs', description: 'Build REST APIs with Express, middleware and error handling.', category: 'Backend', price: 59, instructor: inst._id,
      lessons: [{ title: 'Express Basics', content: 'Routes and middleware.' }, { title: 'REST Design', content: 'Resources and verbs.' }] },
    { title: 'MongoDB with Mongoose', description: 'Model your data, run queries and build relationships.', category: 'Database', price: 39, instructor: inst._id,
      lessons: [{ title: 'Schemas & Models', content: 'Defining data.' }] },
    { title: 'JWT Authentication', description: 'Secure your app with bcrypt hashing, JWT and role-based access.', category: 'Security', price: 0, instructor: inst._id, lessons: [] },
  ]);
  await Enrollment.create({ student: student._id, course: courses[0]._id, progress: 33, completedLessons: [courses[0].lessons[0]._id] });
  console.log('Seeded. Logins: admin@learnhub.com/admin123, instructor@learnhub.com/instructor123, student@learnhub.com/student123');
};

module.exports = { run };

if (require.main === module) {
  require('./config/db')().then(run).then(() => mongoose.disconnect()).catch((e) => { console.error(e); process.exit(1); });
}
