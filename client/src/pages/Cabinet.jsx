import React, {useContext, useEffect, useState} from 'react';
import {Container, Card, Button} from "react-bootstrap";
import {Context} from "../main";
import {getProfile} from "../http/userAPI";

const Cabinet = () => {
    const {user} = useContext(Context);
    const [profile, setProfile] = useState({});

    useEffect(() => {
        getProfile().then(data => setProfile(data));
    }, [])

    return (
        <Container className="mt-5">
            <h1>Личный кабинет</h1>
            <Card className="p-3 mt-3">
                <h3>Информация</h3>
                <div>Email: {profile.email}</div>
                {profile.domain && <div>Ваш домен: {profile.domain}</div>}
                {profile.server_ip && <div>Ваш сервер: {profile.server_ip}</div>}
                {!profile.domain && <div className="text-warning">Домен еще не назначен администратором</div>}
            </Card>
            
            <Card className="p-3 mt-3">
                <h3>Оплата услуг</h3>
                <p>Здесь будет форма оплаты услуг.</p>
                <Button variant="success">Оплатить хостинг</Button>
            </Card>
        </Container>
    );
};

export default Cabinet;
