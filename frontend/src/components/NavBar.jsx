import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="md" variant="dark" className="bg-brand" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">🎓 LearnHub</Navbar.Brand>
        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
            <Nav.Link as={NavLink} to="/courses">Courses</Nav.Link>
            {user && <Nav.Link as={NavLink} to={dashboardPath(user.role)}>Dashboard</Nav.Link>}
          </Nav>
          <Nav className="align-items-md-center gap-2">
            {user ? (
              <>
                <Navbar.Text className="text-white">
                  {user.name} <Badge bg="light" text="dark" className="text-capitalize">{user.role}</Badge>
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-light" size="sm">Login</Button>
                <Button as={Link} to="/register" variant="light" size="sm">Sign up</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
