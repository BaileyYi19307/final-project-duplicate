import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../pages/Auth";

export function NavBar() {

  const {authUser,isLoggedIn,logout}=useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`/api/logout`, { method: "POST", credentials: "include" });
      if (response.ok) {
        //clear user data on logout
        logout();
        //redirect to login page after logout
        navigate("/login"); 
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };


  return (
    <Navbar expand="lg" bg="light">
      <Container>
        <Navbar.Brand as={Link} to="/">Campus Clearout</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Listings</Nav.Link>
          <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
          <Nav.Link as={Link} to="/register">Register</Nav.Link>
        </Nav>
        <Nav>
          {isLoggedIn ? ( // check if user is logged in
            <NavDropdown title={`Welcome, ${authUser.username}`} id="navbarScrollingDropdown">
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          ) : (
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
