import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { CABINET_ROUTE } from '../utils/consts';
import { registration, login } from '../http/userAPI';
import { useContext } from 'react';
import { Context } from '../main';

const Auth = observer(() => {
    const { user } = useContext(Context);
    const navigate = useNavigate();
    
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Если пользователь уже авторизован, перенаправляем в кабинет
    useEffect(() => {
        if (user.isAuth) {
            navigate(CABINET_ROUTE);
        }
    }, [user.isAuth, navigate]);

    const validateForm = () => {
        if (!email || !password) {
            setError('Email и пароль обязательны');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Введите корректный email');
            return false;
        }

        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return false;
        }

        // Проверка совпадения паролей при регистрации
        if (!isLogin && password !== confirmPassword) {
            setError('Пароли не совпадают');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            let data;
            if (isLogin) {
                data = await login(email, password);
            } else {
                data = await registration(email, password);
            }

            // Сохраняем токен
            localStorage.setItem('token', data.token);
            
            // Обновляем состояние
            user.setUser(data.user);
            user.setIsAuth(true);
            
            // Перенаправляем в кабинет
            navigate(CABINET_ROUTE);

        } catch (err) {
            setError(err.message || 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{height: window.innerHeight - 54}}>
            <Card style={{width: 600}} className="p-5">
                <h2 className="m-auto mb-4">{isLogin ? 'Авторизация' : 'Регистрация'}</h2>
                
                {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Введите email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </Form.Group>
                    
                    {!isLogin && (
                        <Form.Group className="mb-4">
                            <Form.Label>Повторите пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Повторите пароль"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                        </Form.Group>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Button 
                            variant="outline-success" 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setConfirmPassword('');
                            }}
                            disabled={loading}
                        >
                            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                        </Button>
                        
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
});

export default Auth;