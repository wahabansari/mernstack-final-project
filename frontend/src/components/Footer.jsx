export default function Footer() {
  return (
    <footer className="footer text-center">
      <small>
        © {new Date().getFullYear()} LearnHub — MERN Stack Learning Management System ·{' '}
        <a href="/LearnHub-Final-Report.pdf" target="_blank" rel="noreferrer" className="text-white">Project report (PDF)</a>
      </small>
    </footer>
  );
}
