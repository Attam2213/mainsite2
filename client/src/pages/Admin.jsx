import React, {useState} from 'react';
import {Container, Form, Button} from "react-bootstrap";
import {$authHost} from "../http/index";

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

    return (
        <Container className="d-flex flex-column mt-5">
            <h2>Добавить работу в портфолио</h2>
            <Form className="mt-3 p-3 border">
                <Form.Control
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={"Название"}
                    className="mt-2"
                />
                <Form.Control
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={"Описание"}
                    className="mt-2"
                />
                <Form.Control
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder={"Ссылка"}
                    className="mt-2"
                />
                <Form.Control
                    type="file"
                    onChange={selectFile}
                    className="mt-2"
                />
                <Button variant={"outline-dark"} className="mt-2" onClick={addPortfolio}>Добавить</Button>
            </Form>

            <h2 className="mt-5">Назначить сервер клиенту</h2>
            <Form className="mt-3 p-3 border">
                <Form.Control
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    placeholder={"ID Пользователя"}
                    className="mt-2"
                />
                <Form.Control
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    placeholder={"Домен"}
                    className="mt-2"
                />
                <Form.Control
                    value={serverIp}
                    onChange={e => setServerIp(e.target.value)}
                    placeholder={"IP Сервера"}
                    className="mt-2"
                />
                <Button variant={"outline-dark"} className="mt-2" onClick={assignServer}>Назначить</Button>
            </Form>
        </Container>
    );
};

export default Admin;
