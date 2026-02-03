import React, {useEffect, useState} from 'react';
import {Container, Row, Col, Card} from "react-bootstrap";
import {$host} from "../http/index";
import {motion} from "framer-motion";
import {FaServer, FaLaptopCode, FaMobileAlt, FaRocket, FaCheckCircle} from "react-icons/fa";

const Shop = () => {
    const [portfolio, setPortfolio] = useState([]);

    useEffect(() => {
        $host.get('portfolio').then(data => setPortfolio(data.data));
    }, [])

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div style={{overflowX: 'hidden'}}>
            {/* HERO SECTION */}
            <section style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                    opacity: 0.1
                }}></div>
                
                <Container className="text-center position-relative">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                    >
                        <h1 style={{fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem'}}>
                            Создаю <span className="text-gradient">современные сайты</span>,<br />
                            которые работают на вас
                        </h1>
                        <p style={{fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 2.5rem'}}>
                            Полный цикл разработки: от дизайна до настройки VDS серверов. 
                            Ваш бизнес заслуживает лучшего представления в интернете.
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                            <button className="btn-primary-custom" onClick={() => document.getElementById('portfolio').scrollIntoView({behavior: 'smooth'})}>
                                Смотреть работы
                            </button>
                            <button className="btn btn-outline-light px-4 py-2" style={{borderRadius: '8px'}} onClick={() => document.getElementById('services').scrollIntoView({behavior: 'smooth'})}>
                                Мои услуги
                            </button>
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* SERVICES SECTION */}
            <section id="services" style={{padding: '5rem 0'}}>
                <Container>
                    <motion.h2 
                        className="section-title"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Чем я могу помочь
                    </motion.h2>
                    <Row>
                        {[
                            {icon: <FaLaptopCode size={40} color="var(--primary-color)"/>, title: "Разработка сайтов", desc: "Лендинги, корпоративные сайты, интернет-магазины на React и Node.js."},
                            {icon: <FaServer size={40} color="var(--accent-color)"/>, title: "Администрирование VDS", desc: "Настройка Linux серверов, Nginx, SSL сертификатов, баз данных."},
                            {icon: <FaMobileAlt size={40} color="#ec4899"/>, title: "Адаптивная верстка", desc: "Ваш сайт будет идеально выглядеть на смартфонах, планшетах и ПК."},
                        ].map((service, index) => (
                            <Col md={4} key={index} className="mb-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    <Card style={{
                                        background: 'var(--card-bg)', 
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        color: 'var(--text-primary)',
                                        height: '100%',
                                        padding: '2rem'
                                    }} className="text-center h-100 shadow-sm border-0">
                                        <div className="mb-3">{service.icon}</div>
                                        <h4 className="mb-3">{service.title}</h4>
                                        <p style={{color: 'var(--text-secondary)'}}>{service.desc}</p>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* PORTFOLIO SECTION */}
            <section id="portfolio" style={{padding: '5rem 0', background: '#131c2e'}}>
                <Container>
                    <motion.h2 
                        className="section-title"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Избранные работы
                    </motion.h2>
                    <Row>
                        {portfolio.length > 0 ? portfolio.map((item, index) => (
                            <Col md={4} key={item.id} className="mb-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card style={{
                                        background: 'var(--card-bg)',
                                        border: 'none',
                                        overflow: 'hidden',
                                        borderRadius: '12px'
                                    }} className="h-100 shadow-lg">
                                        <div style={{height: '200px', overflow: 'hidden', position: 'relative'}}>
                                            {item.image ? 
                                                <Card.Img variant="top" src={import.meta.env.VITE_API_URL + item.image} style={{height: '100%', objectFit: 'cover'}} />
                                                : <div style={{height: '100%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Нет изображения</div>
                                            }
                                        </div>
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title style={{color: 'white', fontWeight: '600'}}>{item.title}</Card.Title>
                                            <Card.Text style={{color: 'var(--text-secondary)', flexGrow: 1}}>
                                                {item.description}
                                            </Card.Text>
                                            {item.link && 
                                                <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-outline-primary w-100 mt-3">
                                                    Посетить сайт
                                                </a>
                                            }
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        )) : (
                            <div className="text-center text-secondary">
                                <p>Пока нет добавленных работ. Зайдите в админку, чтобы добавить.</p>
                            </div>
                        )}
                    </Row>
                </Container>
            </section>

            {/* FOOTER */}
            <footer style={{background: '#020617', padding: '3rem 0', marginTop: 'auto', borderTop: '1px solid #1e293b'}}>
                <Container className="text-center">
                    <h3 className="text-white mb-4">Готовы начать проект?</h3>
                    <p style={{color: 'var(--text-secondary)'}} className="mb-4">
                        Свяжитесь со мной, и мы обсудим детали вашего будущего сайта.
                    </p>
                    <div className="d-flex justify-content-center gap-4 mb-4">
                        <a href="#" className="text-white text-decoration-none">Telegram</a>
                        <a href="#" className="text-white text-decoration-none">WhatsApp</a>
                        <a href="#" className="text-white text-decoration-none">Email</a>
                    </div>
                    <div style={{color: '#475569', fontSize: '0.9rem'}}>
                        &copy; {new Date().getFullYear()} WebFreelancer. Все права защищены.
                    </div>
                </Container>
            </footer>
        </div>
    );
};

export default Shop;
