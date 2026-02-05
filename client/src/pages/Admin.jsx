import React, {useState, useEffect} from 'react';
import {Container, Form, Button, Card, Row, Col, Table, Alert, Modal, Badge, Nav, Tab} from "react-bootstrap";
import { getAllUsers, updateProfile } from '../http/userAPI';
import { 
    getAllServices, 
    createService, 
    updateService, 
    deleteService,
    getAllInvoices,
    createInvoice,
    getStatistics
} from '../http/billingAPI';
import { 
    getAllPortfolios, 
    createPortfolio, 
    deletePortfolio 
} from '../http/portfolioAPI';
import { 
    getAllChats, 
    getChatMessages, 
    sendMessage, 
    closeChat, 
    getUnreadCount 
} from '../http/chatAPI';
import { FaPlus, FaServer, FaEdit, FaSave, FaTimes, FaTrash, FaChartBar, FaUsers, FaFileInvoice, FaMoneyBill, FaBriefcase, FaImage, FaComments, FaPaperclip, FaPaperPlane, FaDownload, FaList } from 'react-icons/fa';

const Admin = () => {
    // Состояние для вкладок
    const [activeTab, setActiveTab] = useState('statistics');
    
    // Состояние для пользователей
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editDomain, setEditDomain] = useState('');
    const [editServerIp, setEditServerIp] = useState('');

    // Состояние для услуг
    const [services, setServices] = useState([]);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        name: '',
        price: '',
        description: '',
        type: 'one-time'
    });

    // Состояние для счетов
    const [invoices, setInvoices] = useState([]);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({
        user_id: '',
        service_id: '',
        amount: '',
        description: '',
        type: 'one-time'
    });

    // Состояние для статистики
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalServices: 0,
        totalInvoices: 0,
        pendingInvoices: 0,
        paidInvoices: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
    });

    // Состояние для портфолио
    const [portfolios, setPortfolios] = useState([]);
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [portfolioForm, setPortfolioForm] = useState({
        title: '',
        description: '',
        link: '',
        image: null
    });
    const [selectedImage, setSelectedImage] = useState(null);

    // Состояние для чатов
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Общее состояние
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Загрузка данных
    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const [usersData, servicesData, invoicesData, statsData, portfoliosData, chatsData, unreadCountData] = await Promise.all([
                getAllUsers(),
                getAllServices(),
                getAllInvoices(),
                getStatistics(),
                getAllPortfolios(),
                getAllChats(),
                getUnreadCount()
            ]);
            
            setUsers(usersData);
            setServices(servicesData);
            setInvoices(invoicesData);
            setStatistics(statsData);
            setPortfolios(portfoliosData);
            setChats(chatsData);
            setUnreadCount(unreadCountData.count);
            
        } catch (err) {
            setError(err.message || 'Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Управление пользователями
    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditDomain(user.domain || '');
        setEditServerIp(user.server_ip || '');
    };

    const handleSaveUser = async () => {
        try {
            setError('');
            setSuccess('');
            
            await updateProfile(editingUser.id, {
                domain: editDomain,
                server_ip: editServerIp
            });
            
            // Обновляем список пользователей
            const usersData = await getAllUsers();
            setUsers(usersData);
            
            setSuccess('Настройки пользователя обновлены');
            setEditingUser(null);
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Не удалось обновить пользователя');
        }
    };

    // Управление услугами
    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');
            
            if (editingService) {
                await updateService(editingService.id, serviceForm);
                setSuccess('Услуга обновлена');
            } else {
                await createService(serviceForm);
                setSuccess('Услуга создана');
            }
            
            // Обновляем список услуг
            const servicesData = await getAllServices();
            setServices(servicesData);
            
            setShowServiceModal(false);
            setEditingService(null);
            setServiceForm({ name: '', price: '', description: '', type: 'one-time' });
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Не удалось сохранить услугу');
        }
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setServiceForm({
            name: service.name,
            price: service.price,
            description: service.description || '',
            type: service.type || 'one-time'
        });
        setShowServiceModal(true);
    };

    const handleDeleteService = async (id) => {
        if (window.confirm('Вы уверены, что хотите деактивировать эту услугу?')) {
            try {
                await deleteService(id);
                const servicesData = await getAllServices();
                setServices(servicesData);
                setSuccess('Услуга деактивирована');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.message || 'Не удалось деактивировать услугу');
            }
        }
    };

    // Управление счетами
    const handleInvoiceSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');
            
            await createInvoice(invoiceForm);
            
            // Обновляем список счетов и статистику
            const [invoicesData, statsData] = await Promise.all([
                getAllInvoices(),
                getStatistics()
            ]);
            setInvoices(invoicesData);
            setStatistics(statsData);
            
            setSuccess('Счет создан');
            setShowInvoiceModal(false);
            setInvoiceForm({ user_id: '', service_id: '', amount: '', description: '', type: 'one-time' });
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Не удалось создать счет');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <Badge bg="success">Оплачен</Badge>;
            case 'pending':
                return <Badge bg="warning" text="dark">Ожидает оплаты</Badge>;
            case 'cancelled':
                return <Badge bg="danger">Отменен</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'monthly':
                return <Badge bg="info">Ежемесячно</Badge>;
            case 'one-time':
                return <Badge bg="primary">Разовый</Badge>;
            default:
                return <Badge bg="secondary">{type}</Badge>;
        }
    };

    // Управление портфолио
    const handlePortfolioSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');
            
            await createPortfolio(portfolioForm);
            
            // Обновляем список портфолио
            const portfoliosData = await getAllPortfolios();
            setPortfolios(portfoliosData);
            
            setSuccess('Работа добавлена в портфолио');
            setShowPortfolioModal(false);
            setPortfolioForm({ title: '', description: '', link: '', image: null });
            setSelectedImage(null);
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Не удалось добавить работу');
        }
    };

    const handleDeletePortfolio = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту работу?')) {
            try {
                await deletePortfolio(id);
                const portfoliosData = await getAllPortfolios();
                setPortfolios(portfoliosData);
                setSuccess('Работа удалена из портфолио');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.message || 'Не удалось удалить работу');
            }
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPortfolioForm({ ...portfolioForm, image: file });
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    // Функции для чата
    const handleSelectChat = async (chatId) => {
        try {
            setLoading(true);
            setError('');
            const messages = await getChatMessages(chatId);
            setChatMessages(messages);
            setSelectedChat(chatId);
        } catch (err) {
            setError(err.message || 'Не удалось загрузить сообщения чата');
        } finally {
            setLoading(false);
        }
    };

    const handleSendAdminMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && selectedFiles.length === 0) return;

        try {
            setLoading(true);
            setError('');
            const message = await sendMessage(selectedChat, newMessage, selectedFiles);
            setChatMessages([...chatMessages, message]);
            setNewMessage('');
            setSelectedFiles([]);
            
            // Обновить список чатов
            const chatsData = await getAllChats();
            setChats(chatsData);
            const unreadCountData = await getUnreadCount();
            setUnreadCount(unreadCountData.count);
        } catch (err) {
            setError(err.message || 'Не удалось отправить сообщение');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseChat = async (chatId) => {
        if (window.confirm('Вы уверены, что хотите закрыть этот чат?')) {
            try {
                await closeChat(chatId);
                const chatsData = await getAllChats();
                setChats(chatsData);
                if (selectedChat === chatId) {
                    setSelectedChat(null);
                    setChatMessages([]);
                }
                setSuccess('Чат закрыт');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.message || 'Не удалось закрыть чат');
            }
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            setError('Можно прикрепить не более 5 файлов');
            return;
        }
        setSelectedFiles([...selectedFiles, ...files]);
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <Container className="mt-5 pt-5">
                <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}>
                    <div>Загрузка данных...</div>
                </div>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <h2 className="mb-4">
                        <FaChartBar className="me-2" />
                        Административная панель
                    </h2>
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    
                    <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                        <Nav variant="tabs" className="mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="statistics">
                                    <FaChartBar className="me-1" />
                                    Статистика
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="users">
                                    <FaUsers className="me-1" />
                                    Пользователи ({statistics.totalUsers})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="services">
                                    <FaList className="me-1" />
                                    Услуги ({statistics.totalServices})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="invoices">
                                    <FaFileInvoice className="me-1" />
                                    Счета ({statistics.pendingInvoices})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="portfolio">
                                    <FaBriefcase className="me-1" />
                                    Портфолио ({portfolios.length})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="chats">
                                    <FaComments className="me-1" />
                                    Чаты поддержки {unreadCount > 0 && <Badge bg="danger" className="ms-1">{unreadCount}</Badge>}
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>

                        <Tab.Content>
                            {/* Вкладка статистики */}
                            <Tab.Pane eventKey="statistics">
                                <Row>
                                    <Col md={3}>
                                        <Card className="mb-3">
                                            <Card.Body>
                                                <Card.Title>Всего пользователей</Card.Title>
                                                <h3>{statistics.totalUsers}</h3>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={3}>
                                        <Card className="mb-3">
                                            <Card.Body>
                                                <Card.Title>Активных услуг</Card.Title>
                                                <h3>{statistics.totalServices}</h3>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={3}>
                                        <Card className="mb-3">
                                            <Card.Body>
                                                <Card.Title>Общий доход</Card.Title>
                                                <h3><FaMoneyBill className="me-1" />{statistics.totalRevenue.toFixed(2)} ₽</h3>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={3}>
                                        <Card className="mb-3">
                                            <Card.Body>
                                                <Card.Title>Доход за месяц</Card.Title>
                                                <h3><FaMoneyBill className="me-1" />{statistics.monthlyRevenue.toFixed(2)} ₽</h3>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <Col md={4}>
                                        <Card className="mb-3">
                                            <Card.Body>
                                                <Card.Title>Статус счетов</Card.Title>
                                                <div className="d-flex justify-content-between">
                                                    <span>Ожидают оплаты:</span>
                                                    <Badge bg="warning" text="dark">{statistics.pendingInvoices}</Badge>
                                                </div>
                                                <div className="d-flex justify-content-between mt-2">
                                                    <span>Оплачено:</span>
                                                    <Badge bg="success">{statistics.paidInvoices}</Badge>
                                                </div>
                                                <div className="d-flex justify-content-between mt-2">
                                                    <span>Всего счетов:</span>
                                                    <Badge bg="info">{statistics.totalInvoices}</Badge>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            {/* Вкладка пользователей */}
                            <Tab.Pane eventKey="users">
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Email</th>
                                            <th>Роль</th>
                                            <th>Домен</th>
                                            <th>IP Сервер</th>
                                            <th>Баланс</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <Badge bg={user.role === 'ADMIN' ? 'danger' : 'primary'}>
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {editingUser?.id === user.id ? (
                                                        <Form.Control
                                                            type="text"
                                                            value={editDomain}
                                                            onChange={(e) => setEditDomain(e.target.value)}
                                                            size="sm"
                                                        />
                                                    ) : (
                                                        user.domain || '-'
                                                    )}
                                                </td>
                                                <td>
                                                    {editingUser?.id === user.id ? (
                                                        <Form.Control
                                                            type="text"
                                                            value={editServerIp}
                                                            onChange={(e) => setEditServerIp(e.target.value)}
                                                            size="sm"
                                                        />
                                                    ) : (
                                                        user.server_ip || '-'
                                                    )}
                                                </td>
                                                <td>{parseFloat(user.balance).toFixed(2)} ₽</td>
                                                <td>
                                                    {editingUser?.id === user.id ? (
                                                        <div>
                                                            <Button 
                                                                variant="success" 
                                                                size="sm" 
                                                                onClick={handleSaveUser}
                                                                className="me-2"
                                                            >
                                                                <FaSave />
                                                            </Button>
                                                            <Button 
                                                                variant="secondary" 
                                                                size="sm"
                                                                onClick={() => setEditingUser(null)}
                                                            >
                                                                <FaTimes />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button 
                                                            variant="primary" 
                                                            size="sm"
                                                            onClick={() => handleEditUser(user)}
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Tab.Pane>

                            {/* Вкладка услуг */}
                            <Tab.Pane eventKey="services">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4>Управление услугами</h4>
                                    <Button variant="primary" onClick={() => setShowServiceModal(true)}>
                                        <FaPlus className="me-1" />
                                        Добавить услугу
                                    </Button>
                                </div>

                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Название</th>
                                            <th>Описание</th>
                                            <th>Цена</th>
                                            <th>Тип</th>
                                            <th>Статус</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map(service => (
                                            <tr key={service.id}>
                                                <td>{service.id}</td>
                                                <td>{service.name}</td>
                                                <td>{service.description || '-'}</td>
                                                <td>{parseFloat(service.price).toFixed(2)} ₽</td>
                                                <td>{getTypeBadge(service.type)}</td>
                                                <td>
                                                    <Badge bg={service.is_active ? 'success' : 'secondary'}>
                                                        {service.is_active ? 'Активна' : 'Неактивна'}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button 
                                                        variant="primary" 
                                                        size="sm"
                                                        onClick={() => handleEditService(service)}
                                                        className="me-2"
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => handleDeleteService(service.id)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Tab.Pane>

                            {/* Вкладка счетов */}
                            <Tab.Pane eventKey="invoices">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4>Счета на оплату</h4>
                                    <Button variant="primary" onClick={() => setShowInvoiceModal(true)}>
                                        <FaPlus className="me-1" />
                                        Выставить счет
                                    </Button>
                                </div>

                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Пользователь</th>
                                            <th>Услуга</th>
                                            <th>Сумма</th>
                                            <th>Тип</th>
                                            <th>Статус</th>
                                            <th>Дата создания</th>
                                            <th>Дата оплаты</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map(invoice => (
                                            <tr key={invoice.id}>
                                                <td>{invoice.id}</td>
                                                <td>{invoice.User?.email || 'Неизвестно'}</td>
                                                <td>{invoice.Service?.name || 'Неизвестно'}</td>
                                                <td>{parseFloat(invoice.amount).toFixed(2)} ₽</td>
                                                <td>{getTypeBadge(invoice.type)}</td>
                                                <td>{getStatusBadge(invoice.status)}</td>
                                                <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    {invoice.paid_at ? 
                                                        new Date(invoice.paid_at).toLocaleDateString() : 
                                                        '-'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Tab.Pane>

                            {/* Вкладка портфолио */}
                            <Tab.Pane eventKey="portfolio">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4>Портфолио работ</h4>
                                    <Button variant="primary" onClick={() => setShowPortfolioModal(true)}>
                                        <FaPlus className="me-1" />
                                        Добавить работу
                                    </Button>
                                </div>

                                <Row>
                                    {portfolios.map(portfolio => (
                                        <Col md={4} key={portfolio.id} className="mb-4">
                                            <Card>
                                                {portfolio.image && (
                                                    <Card.Img 
                                                        variant="top" 
                                                        src={`http://localhost:5000/${portfolio.image}`} 
                                                        alt={portfolio.title}
                                                        style={{ height: '200px', objectFit: 'cover' }}
                                                    />
                                                )}
                                                <Card.Body>
                                                    <Card.Title>{portfolio.title}</Card.Title>
                                                    {portfolio.description && (
                                                        <Card.Text>{portfolio.description}</Card.Text>
                                                    )}
                                                    {portfolio.link && (
                                                        <Card.Text>
                                                            <a href={portfolio.link} target="_blank" rel="noopener noreferrer">
                                                                Посмотреть работу
                                                            </a>
                                                        </Card.Text>
                                                    )}
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => handleDeletePortfolio(portfolio.id)}
                                                    >
                                                        <FaTrash className="me-1" />
                                                        Удалить
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Tab.Pane>

                            {/* Вкладка чатов поддержки */}
                            <Tab.Pane eventKey="chats">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4>Чаты технической поддержки</h4>
                                    <Button variant="outline-primary" onClick={fetchAllData}>
                                        Обновить
                                    </Button>
                                </div>

                                <Row>
                                    <Col md={4}>
                                        <Card>
                                            <Card.Header>
                                                <h6 className="mb-0">Активные чаты</h6>
                                            </Card.Header>
                                            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                                {chats.length === 0 ? (
                                                    <p className="text-muted text-center">Нет активных чатов</p>
                                                ) : (
                                                    <div className="list-group list-group-flush">
                                                        {chats.map(chat => (
                                                            <div 
                                                                key={chat.id}
                                                                className={`list-group-item list-group-item-action ${selectedChat === chat.id ? 'active' : ''}`}
                                                                onClick={() => handleSelectChat(chat.id)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div>
                                                                        <h6 className="mb-1">{chat.subject}</h6>
                                                                        <small className="text-muted">
                                                                            {chat.user?.email || 'Неизвестный пользователь'}
                                                                        </small>
                                                                        {chat.messages && chat.messages.length > 0 && (
                                                                            <div className="small text-muted mt-1">
                                                                                {new Date(chat.messages[0].created_at).toLocaleString()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <Badge bg="success">Активен</Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    
                                    <Col md={8}>
                                        {selectedChat ? (
                                            <Card>
                                                <Card.Header className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0">
                                                        {chats.find(c => c.id === selectedChat)?.subject}
                                                    </h6>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        onClick={() => handleCloseChat(selectedChat)}
                                                    >
                                                        Закрыть чат
                                                    </Button>
                                                </Card.Header>
                                                <Card.Body>
                                                    <div className="chat-messages mb-3" style={{ height: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px' }}>
                                                        {chatMessages.map(message => (
                                                            <div key={message.id} className={`mb-3 ${message.sender_type === 'admin' ? 'text-end' : 'text-start'}`}>
                                                                <div className={`d-inline-block p-2 rounded ${message.sender_type === 'admin' ? 'bg-primary text-white' : 'bg-light'}`}>
                                                                    {message.content}
                                                                    {message.files && message.files.length > 0 && (
                                                                        <div className="mt-2">
                                                                            {message.files.map(file => (
                                                                                <div key={file.id} className="small">
                                                                                    <a 
                                                                                        href={`http://localhost:5000/chat/files/${file.id}/download`}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="text-decoration-none"
                                                                                    >
                                                                                        <FaDownload className="me-1" />
                                                                                        {file.original_name} ({formatFileSize(file.file_size)})
                                                                                    </a>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="small text-muted mt-1">
                                                                    {new Date(message.created_at).toLocaleString()}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <Form onSubmit={handleSendAdminMessage}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={3}
                                                                value={newMessage}
                                                                onChange={(e) => setNewMessage(e.target.value)}
                                                                placeholder="Введите ваше сообщение..."
                                                                disabled={loading}
                                                            />
                                                        </Form.Group>

                                                        {selectedFiles.length > 0 && (
                                                            <div className="mb-3">
                                                                <h6>Прикрепленные файлы:</h6>
                                                                {selectedFiles.map((file, index) => (
                                                                    <div key={index} className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-1">
                                                                        <span className="small">
                                                                            {file.name} ({formatFileSize(file.size)})
                                                                        </span>
                                                                        <Button 
                                                                            variant="outline-danger" 
                                                                            size="sm" 
                                                                            onClick={() => removeFile(index)}
                                                                            disabled={loading}
                                                                        >
                                                                            Удалить
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <Form.Control
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*,.pdf,.txt,.doc,.docx"
                                                                    onChange={handleFileSelect}
                                                                    disabled={loading}
                                                                    style={{ display: 'none' }}
                                                                    id="admin-file-input"
                                                                />
                                                                <Button 
                                                                    variant="outline-secondary" 
                                                                    onClick={() => document.getElementById('admin-file-input').click()}
                                                                    disabled={loading}
                                                                >
                                                                    <FaPaperclip className="me-1" />
                                                                    Прикрепить файлы
                                                                </Button>
                                                            </div>
                                                            <Button variant="primary" type="submit" disabled={loading || (!newMessage.trim() && selectedFiles.length === 0)}>
                                                                <FaPaperPlane className="me-1" />
                                                                Отправить
                                                            </Button>
                                                        </div>
                                                    </Form>
                                                </Card.Body>
                                            </Card>
                                        ) : (
                                            <Card>
                                                <Card.Body>
                                                    <p className="text-muted text-center">Выберите чат для просмотра сообщений</p>
                                                </Card.Body>
                                            </Card>
                                        )}
                                    </Col>
                                </Row>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Col>
            </Row>

            {/* Модальное окно для услуг */}
            <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingService ? 'Редактировать услугу' : 'Создать услугу'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleServiceSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Название услуги</Form.Label>
                            <Form.Control
                                type="text"
                                value={serviceForm.name}
                                onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Цена (₽)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={serviceForm.price}
                                onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={serviceForm.description}
                                onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Тип оплаты</Form.Label>
                            <Form.Select
                                value={serviceForm.type}
                                onChange={(e) => setServiceForm({...serviceForm, type: e.target.value})}
                            >
                                <option value="one-time">Разовый</option>
                                <option value="monthly">Ежемесячный</option>
                            </Form.Select>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {editingService ? 'Обновить' : 'Создать'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Модальное окно для счетов */}
            <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Выставить счет</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleInvoiceSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Пользователь</Form.Label>
                            <Form.Select
                                value={invoiceForm.user_id}
                                onChange={(e) => setInvoiceForm({...invoiceForm, user_id: e.target.value})}
                                required
                            >
                                <option value="">Выберите пользователя</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.email} (Баланс: {parseFloat(user.balance).toFixed(2)} ₽)
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Услуга</Form.Label>
                            <Form.Select
                                value={invoiceForm.service_id}
                                onChange={(e) => setInvoiceForm({...invoiceForm, service_id: e.target.value})}
                                required
                            >
                                <option value="">Выберите услугу</option>
                                {services.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name} - {parseFloat(service.price).toFixed(2)} ₽
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Сумма (₽)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={invoiceForm.amount}
                                onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={invoiceForm.description}
                                onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Тип оплаты</Form.Label>
                            <Form.Select
                                value={invoiceForm.type}
                                onChange={(e) => setInvoiceForm({...invoiceForm, type: e.target.value})}
                            >
                                <option value="one-time">Разовый</option>
                                <option value="monthly">Ежемесячный</option>
                            </Form.Select>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Выставить счет
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Модальное окно для портфолио */}
            <Modal show={showPortfolioModal} onHide={() => {
                setShowPortfolioModal(false);
                setPortfolioForm({ title: '', description: '', link: '', image: null });
                setSelectedImage(null);
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>Добавить работу в портфолио</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePortfolioSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Название работы</Form.Label>
                            <Form.Control
                                type="text"
                                value={portfolioForm.title}
                                onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})}
                                required
                                maxLength="100"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={portfolioForm.description}
                                onChange={(e) => setPortfolioForm({...portfolioForm, description: e.target.value})}
                                maxLength="500"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ссылка на работу</Form.Label>
                            <Form.Control
                                type="url"
                                value={portfolioForm.link}
                                onChange={(e) => setPortfolioForm({...portfolioForm, link: e.target.value})}
                                placeholder="https://example.com"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Изображение</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                            {selectedImage && (
                                <div className="mt-2">
                                    <img 
                                        src={selectedImage} 
                                        alt="Preview" 
                                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Добавить работу
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Admin;