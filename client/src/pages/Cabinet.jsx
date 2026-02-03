import React, {useContext, useEffect, useState} from 'react';
import {Container, Card, Button} from "react-bootstrap";
import {Context} from "../main";
import {getProfile} from "../http/userAPI";
import { FaUser, FaServer, FaGlobe, FaCreditCard } from 'react-icons/fa';

const Cabinet = () => {
    const {user} = useContext(Context);
    const [profile, setProfile] = useState({});

    useEffect(() => {
        getProfile().then(data => setProfile(data));
    }, [])

    return (
        <Container className="mt-5 pt-5">
            <h1 className="mb-4 text-gradient">Личный кабинет</h1>
            <Card className="p-4 mt-3 shadow-sm" style={{
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                    <FaUser size={30} color="var(--primary-color)" />
                    <h3 className="m-0">Информация о пользователе</h3>
                </div>
                <div style={{fontSize: '1.1rem'}}>
                    <div className="mb-2"><span style={{color: 'var(--text-secondary)'}}>Email:</span> {profile.email}</div>
                    
                    <div className="mt-4 p-3 rounded" style={{background: 'rgba(255,255,255,0.03)'}}>
                        {profile.domain ? (
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <FaGlobe color="var(--accent-color)" /> 
                                <span>Ваш домен: <strong>{profile.domain}</strong></span>
                            </div>
                        ) : (
                            <div className="text-warning d-flex align-items-center gap-2">
                                <FaGlobe /> Домен еще не назначен администратором
                            </div>
                        )}
                        
                        {profile.server_ip && (
                            <div className="d-flex align-items-center gap-2">
                                <FaServer color="#ec4899" />
                                <span>Ваш сервер: <strong>{profile.server_ip}</strong></span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
            
            <Card className="p-4 mt-4 shadow-sm" style={{
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                    <FaCreditCard size={30} color="var(--primary-color)" />
                    <h3 className="m-0">Оплата услуг</h3>
                </div>
                <p style={{color: 'var(--text-secondary)'}}>Управляйте своими подписками и оплачивайте хостинг.</p>
                <Button className="btn-primary-custom" style={{width: 'fit-content'}}>Оплатить хостинг</Button>
            </Card>
        </Container>
    );
};

export default Cabinet;