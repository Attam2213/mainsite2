import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Row, Col, Modal, Form } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../utils/consts';
import { getProfile, createYooMoneyPayment } from '../http/userAPI';
import { useContext } from 'react';
import { Context } from '../main';
import ChatSupport from '../components/ChatSupport';

const Cabinet = observer(() => {
    const { user } = useContext(Context);
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profile, setProfile] = useState(null);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [topUpLoading, setTopUpLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getProfile();
            setProfile(data);
        } catch (err) {
            setError(err.message || 'Не удалось загрузить профиль');
            if (err.message === 'Не авторизован') {
                setTimeout(() => navigate(LOGIN_ROUTE), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        user.logout();
        navigate(LOGIN_ROUTE);
    };

    const handleTopUpBalance = async () => {
        if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
            setError('Введите корректную сумму');
            return;
        }

        try {
            setTopUpLoading(true);
            setError('');
            
            // Создаем платеж через YooMoney
            const response = await createYooMoneyPayment(parseFloat(topUpAmount));
            
            if (response.payment && response.payment.confirmation && response.payment.confirmation.confirmation_url) {
                // Перенаправляем пользователя на страницу оплаты YooMoney
                window.location.href = response.payment.confirmation.confirmation_url;
            } else {
                // Если нет URL для оплаты, показываем ошибку
                setError('Не удалось создать платеж. Попробуйте позже.');
            }
            
            setShowTopUpModal(false);
            setTopUpAmount('');
        } catch (err) {
            setError(err.message || 'Не удалось создать платеж');
        } finally {
            setTopUpLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="mt-5 pt-5">
                <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}>
                    <div>Загрузка профиля...</div>
                </div>
            </Container>
        );
    }

    if (error && !profile) {
        return (
            <Container className="mt-5 pt-5">
                <Alert variant="danger" className="text-center">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5 pt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2>Личный кабинет</h2>
                            <Button variant="outline-danger" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </div>

                        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
                        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

                        <Row>
                            <Col md={6}>
                                <h5 className="mb-3">Информация о профиле</h5>
                                <div className="mb-2">
                                    <strong>Email:</strong> {profile?.email || 'Не указан'}
                                </div>
                                <div className="mb-2">
                                    <strong>Роль:</strong> {profile?.role || 'USER'}
                                </div>
                                <div className="mb-2">
                                    <strong>Баланс:</strong> <span className="text-success fw-bold">{profile?.balance || '0.00'} руб.</span>
                                </div>
                                <Button 
                                    variant="success" 
                                    onClick={() => setShowTopUpModal(true)}
                                    className="mb-3"
                                >
                                    Пополнить баланс
                                </Button>
                            </Col>
                            
                            <Col md={6}>
                                <h5 className="mb-3">Настройки сервера</h5>
                                <div className="mb-3">
                                    <strong>Домен:</strong> {profile?.domain || 'Не указан'}
                                </div>
                                <div className="mb-3">
                                    <strong>IP сервера:</strong> {profile?.server_ip || 'Не указан'}
                                </div>
                                <small className="text-muted d-block">
                                    Для изменения настроек обратитесь к администратору
                                </small>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Чат технической поддержки */}
            <ChatSupport userId={profile?.id} />

            {/* Модальное окно пополнения баланса */}
            <Modal show={showTopUpModal} onHide={() => setShowTopUpModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Пополнение баланса</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Сумма пополнения (руб.)</Form.Label>
                            <Form.Control
                                type="number"
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                placeholder="Введите сумму"
                                min="1"
                                step="0.01"
                            />
                        </Form.Group>
                        <small className="text-muted">
                            В дальнейшем здесь будет интеграция с YooMoney
                        </small>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTopUpModal(false)}>
                        Отмена
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={handleTopUpBalance}
                        disabled={topUpLoading}
                    >
                        {topUpLoading ? 'Обработка...' : 'Пополнить'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
});

export default Cabinet;