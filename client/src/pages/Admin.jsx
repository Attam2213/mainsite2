import React, {useState} from 'react';
import {Container, Form, Button, Card, Row, Col} from "react-bootstrap";
import {$authHost} from "../http/index";
import { FaPlus, FaServer, FaImage } from 'react-icons/fa';

const Admin = () => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [link, setLink] = useState('');
    const [file, setFile] = useState(null);

    const [userId, setUserId] = useState('');
    const [domain, setDomain] = useState('');
    const [serverIp, setServerIp] = useState('');

    const selectFile = e => {
        setFile(e.target.files[0])
    }

    const addPortfolio = () => {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', desc)
        formData.append('link', link)
        if (file) {
            formData.append('image', file)
        }
        $authHost.post('portfolio', formData).then(data => {
            alert('Работа добавлена')
            setTitle('')
            setDesc('')
            setLink('')
            setFile(null)
        })
    }

    const assignServer = () => {
        $authHost.post('user/assign-server', {userId, domain, server_ip: serverIp}).then(data => {
            alert('Данные назначены')
        })
    }

    const inputStyle = {
        background: 'rgba(255,255,255,0.05)', 
        border: '1px solid rgba(255,255,255,0.1)', 
        color: 'white'
    };

    return (
        <Container className="d-flex flex-column mt-5 pt-5">
            <h2 className="mb-4 text-gradient">Панель администратора</h2>
            
            <Row>
                <Col md={6}>
                    <Card className="p-4 mb-4" style={{background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)'}}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <FaImage color="var(--primary-color)" size={24}/>
                            <h3>Добавить работу</h3>
                        </div>
                        <Form>
                            <Form.Control
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder={"Название проекта"}
                                className="mt-2"
                                style={inputStyle}
                            />
                            <Form.Control
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                placeholder={"Описание"}
                                className="mt-2"
                                style={inputStyle}
                            />
                            <Form.Control
                                value={link}
                                onChange={e => setLink(e.target.value)}
                                placeholder={"Ссылка"}
                                className="mt-2"
                                style={inputStyle}
                            />
                            <Form.Control
                                type="file"
                                onChange={selectFile}
                                className="mt-2"
                                style={inputStyle}
                            />
                            <Button className="btn-primary-custom mt-3" onClick={addPortfolio}>
                                <FaPlus className="me-2"/> Добавить
                            </Button>
                        </Form>
                    </Card>
                </Col>
                
                <Col md={6}>
                    <Card className="p-4" style={{background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)'}}>
                         <div className="d-flex align-items-center gap-2 mb-3">
                            <FaServer color="var(--accent-color)" size={24}/>
                            <h3>Назначить сервер</h3>
                        </div>
                        <Form>
                            <Form.Control
                                value={userId}
                                onChange={e => setUserId(e.target.value)}
                                placeholder={"ID Пользователя"}
                                className="mt-2"
                                style={inputStyle}
                            />
                            <Form.Control
                                value={domain}
                                onChange={e => setDomain(e.target.value)}
                                placeholder={"Домен (example.com)"}
                                className="mt-2"
                                style={inputStyle}
                            />
                            <Form.Control
                                value={serverIp}
                                onChange={e => setServerIp(e.target.value)}
                                placeholder={"IP Сервера"}
                                className="mt-2"
                                style={inputStyle}
                            />
                            <Button className="btn-primary-custom mt-3" onClick={assignServer}>
                                Назначить
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Admin;