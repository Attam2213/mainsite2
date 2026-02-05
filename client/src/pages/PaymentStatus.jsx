import React, {useEffect, useState} from 'react';
import {Container, Card, Button, Alert, Spinner} from 'react-bootstrap';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {getProfile} from '../http/userAPI';
import {CABINET_ROUTE} from '../utils/consts';

const PaymentStatus = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('pending'); // pending, success, failed
    const [message, setMessage] = useState('Проверка статуса платежа...');

    useEffect(() => {
        const checkPaymentStatus = async () => {
            try {
                // Получаем текущий профиль для обновления баланса
                await getProfile();
                
                // Проверяем параметры URL для определения статуса
                const paymentStatus = searchParams.get('status');
                const error = searchParams.get('error');
                
                if (error) {
                    setStatus('failed');
                    setMessage('Платеж не удался. Попробуйте еще раз.');
                } else if (paymentStatus === 'success') {
                    setStatus('success');
                    setMessage('Платеж успешно завершен! Баланс пополнен.');
                } else {
                    setStatus('pending');
                    setMessage('Статус платежа уточняется...');
                }
                
            } catch (err) {
                console.error('Ошибка проверки статуса платежа:', err);
                setStatus('failed');
                setMessage('Не удалось проверить статус платежа.');
            } finally {
                setLoading(false);
            }
        };

        checkPaymentStatus();
    }, [searchParams]);

    const getStatusIcon = () => {
        switch (status) {
            case 'success':
                return '✅';
            case 'failed':
                return '❌';
            default:
                return '⏳';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'success';
            case 'failed':
                return 'danger';
            default:
                return 'info';
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
                <Card className="text-center p-5">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <h4>Проверка статуса платежа...</h4>
                    <p className="text-muted">Пожалуйста, подождите...</p>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
            <Card className="text-center p-5" style={{maxWidth: '500px', width: '100%'}}>
                <div className="mb-4" style={{fontSize: '3rem'}}>
                    {getStatusIcon()}
                </div>
                
                <Alert variant={getStatusColor()} className="mb-4">
                    <h4 className="alert-heading">{message}</h4>
                </Alert>

                <div className="d-grid gap-2">
                    <Button 
                        variant="primary" 
                        onClick={() => navigate(CABINET_ROUTE)}
                        className="mb-2"
                    >
                        Вернуться в личный кабинет
                    </Button>
                    
                    {status === 'failed' && (
                        <Button 
                            variant="outline-primary" 
                            onClick={() => navigate(CABINET_ROUTE)}
                        >
                            Попробовать еще раз
                        </Button>
                    )}
                </div>
            </Card>
        </Container>
    );
};

export default PaymentStatus;