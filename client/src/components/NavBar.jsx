import React, {useContext} from 'react';
import {Context} from "../main";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import {NavLink, useNavigate} from "react-router-dom";
import {ADMIN_ROUTE, CABINET_ROUTE, LOGIN_ROUTE, SHOP_ROUTE} from "../utils/consts";
import {Button, Container} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import {FaCode, FaUserCircle, FaSignOutAlt, FaSignInAlt, FaTools} from 'react-icons/fa';

const NavBar = observer(() => {
    const {user} = useContext(Context)
    const navigate = useNavigate()

    const logOut = () => {
        user.setUser({})
        user.setIsAuth(false)
        localStorage.removeItem('token')
        navigate(LOGIN_ROUTE)
    }

    return (
        <Navbar expand="lg" fixed="top" style={{
            backgroundColor: 'var(--nav-bg)', 
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        }} variant="dark">
            <Container>
                <NavLink style={{
                    color:'white', 
                    textDecoration: 'none', 
                    fontWeight: '700', 
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }} to={SHOP_ROUTE}>
                    <FaCode color="var(--accent-color)" /> WebFreelancer
                </NavLink>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ms-auto" style={{color: 'white', alignItems: 'center', gap: '15px'}}>
                        {user.isAuth ?
                            <>
                                {user.user.role === 'ADMIN' && 
                                    <Button variant={"outline-light"} onClick={() => navigate(ADMIN_ROUTE)} className="d-flex align-items-center gap-2">
                                        <FaTools /> Админ
                                    </Button>
                                }
                                <Button variant={"outline-light"} onClick={() => navigate(CABINET_ROUTE)} className="d-flex align-items-center gap-2">
                                    <FaUserCircle /> Кабинет
                                </Button>
                                <Button variant={"outline-danger"} onClick={() => logOut()} className="d-flex align-items-center gap-2">
                                    <FaSignOutAlt /> Выйти
                                </Button>
                            </>
                            :
                            <Button variant={"primary"} className="btn-primary-custom d-flex align-items-center gap-2" onClick={() => navigate(LOGIN_ROUTE)}>
                                <FaSignInAlt /> Авторизация
                            </Button>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
});

export default NavBar;
