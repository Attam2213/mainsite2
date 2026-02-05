import React, {useContext, useState} from 'react';
import {Container, Form, Card, Button, Row} from "react-bootstrap";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {LOGIN_ROUTE, REGISTRATION_ROUTE, SHOP_ROUTE, CABINET_ROUTE} from "../utils/consts";
import {login, registration} from "../http/userAPI";
import {observer} from "mobx-react-lite";
import {Context} from "../main";

const Auth = observer(() => {
    const {user} = useContext(Context)
    const location = useLocation()
    const navigate = useNavigate()
    const isLogin = location.pathname === LOGIN_ROUTE
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const click = async () => {
        try {
            // Клиентская валидация
            if (!email.trim()) {
                alert("Введите email!");
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Введите корректный email!");
                return;
            }
            
            if (!password.trim()) {
                alert("Введите пароль!");
                return;
            }
            
            if (password.length < 6) {
                alert("Пароль должен быть не менее 6 символов!");
                return;
            }
            
            if (!isLogin) {
                if (password !== confirmPassword) {
                    alert("Пароли не совпадают!");
                    return;
                }
            }

            let data;
            if (isLogin) {
                data = await login(email, password);
            } else {
                data = await registration(email, password);
            }
            user.setUser(data)
            user.setIsAuth(true)
            navigate(CABINET_ROUTE)
        } catch (e) {
            alert(e.response?.data?.message || "Ошибка авторизации")
        }
    }

    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{height: window.innerHeight - 54}}
        >
            <Card style={{
                width: 600, 
                background: 'var(--card-bg)', 
                color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.1)'
            }} className="p-5 shadow">
                <h2 className="m-auto mb-4">{isLogin ? 'Авторизация' : "Регистрация"}</h2>
                <Form className="d-flex flex-column">
                    <Form.Control
                        className="mt-3"
                        placeholder="Введите ваш email..."
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            color: 'white'
                        }}
                    />
                    <Form.Control
                        className="mt-3"
                        placeholder="Введите ваш пароль..."
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        style={{
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            color: 'white'
                        }}
                    />
                    {!isLogin && (
                        <Form.Control
                            className="mt-3"
                            placeholder="Повторите пароль..."
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            type="password"
                            style={{
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                color: 'white'
                            }}
                        />
                    )}
                    <Row className="d-flex justify-content-between mt-3 pl-3 pr-3 align-items-center">
                        {isLogin ?
                            <div style={{color: 'var(--text-secondary)'}}>
                                Нет аккаунта? <NavLink to={REGISTRATION_ROUTE} style={{color: 'var(--primary-color)'}}>Зарегистрируйся!</NavLink>
                            </div>
                            :
                            <div style={{color: 'var(--text-secondary)'}}>
                                Есть аккаунт? <NavLink to={LOGIN_ROUTE} style={{color: 'var(--primary-color)'}}>Войдите!</NavLink>
                            </div>
                        }
                        <button
                            className="btn-primary-custom mt-3"
                            onClick={click}
                            style={{width: 'fit-content'}}
                        >
                            {isLogin ? 'Войти' : 'Регистрация'}
                        </button>
                    </Row>

                </Form>
            </Card>
        </Container>
    );
});

export default Auth;