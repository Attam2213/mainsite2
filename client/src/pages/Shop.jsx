import React, {useEffect, useState} from 'react';
import {Container, Row, Col, Card} from "react-bootstrap";
import {$host} from "../http/index";

const Shop = () => {
    const [portfolio, setPortfolio] = useState([]);

    useEffect(() => {
        $host.get('portfolio').then(data => setPortfolio(data.data));
    }, [])

    return (
        <Container>
            <h1 className="mt-4 mb-4">Мои работы</h1>
            <Row>
                {portfolio.map(item => (
                    <Col md={4} key={item.id} className="mb-3">
                        <Card style={{width: '18rem'}}>
                            {item.image && <Card.Img variant="top" src={import.meta.env.VITE_API_URL + item.image} />}
                            <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text>
                                    {item.description}
                                </Card.Text>
                                {item.link && <Card.Link href={item.link} target="_blank">Перейти на сайт</Card.Link>}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <h2 className="mt-5">Мои услуги</h2>
            <p>Разработка сайтов под ключ, администрирование VDS, настройка доменов.</p>
        </Container>
    );
};

export default Shop;
