import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Alert, Row, Col, Modal, Form, ListGroup, Badge } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { FaPaperclip, FaPaperPlane, FaComment, FaDownload } from 'react-icons/fa';
import { createChat, getUserChats, getChatMessages, sendMessage } from '../http/chatAPI';

const ChatSupport = observer(({ userId }) => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [newChatSubject, setNewChatSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchUserChats();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchUserChats = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getUserChats();
            setChats(data);
        } catch (err) {
            setError(err.message || 'Не удалось загрузить чаты');
        } finally {
            setLoading(false);
        }
    };

    const fetchChatMessages = async (chatId) => {
        try {
            setLoading(true);
            setError('');
            const data = await getChatMessages(chatId);
            setMessages(data);
            setSelectedChat(chatId);
        } catch (err) {
            setError(err.message || 'Не удалось загрузить сообщения');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChat = async () => {
        if (!newChatSubject.trim()) {
            setError('Введите тему обращения');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const newChat = await createChat(newChatSubject);
            setChats([newChat, ...chats]);
            setShowNewChatModal(false);
            setNewChatSubject('');
            await fetchChatMessages(newChat.id);
        } catch (err) {
            setError(err.message || 'Не удалось создать чат');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && selectedFiles.length === 0) {
            setError('Введите сообщение или прикрепите файл');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const message = await sendMessage(selectedChat, newMessage, selectedFiles);
            setMessages([...messages, message]);
            setNewMessage('');
            setSelectedFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(err.message || 'Не удалось отправить сообщение');
        } finally {
            setLoading(false);
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card className="mt-4">
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaComment className="me-2" />
                        Техническая поддержка
                    </h5>
                    <Button variant="primary" size="sm" onClick={() => setShowNewChatModal(true)}>
                        Новое обращение
                    </Button>
                </div>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
                
                {!selectedChat ? (
                    <div>
                        <h6 className="mb-3">Ваши обращения</h6>
                        {chats.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-muted">У вас пока нет обращений в техническую поддержку</p>
                                <Button variant="primary" onClick={() => setShowNewChatModal(true)}>
                                    Создать первое обращение
                                </Button>
                            </div>
                        ) : (
                            <ListGroup>
                                {chats.map(chat => (
                                    <ListGroup.Item
                                        key={chat.id}
                                        action
                                        onClick={() => fetchChatMessages(chat.id)}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            <div className="fw-bold">{chat.subject}</div>
                                            <small className="text-muted">
                                                Создан: {new Date(chat.created_at).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <div className="text-end">
                                            <Badge bg={chat.status === 'active' ? 'success' : 'secondary'}>
                                                {chat.status === 'active' ? 'Активен' : 'Закрыт'}
                                            </Badge>
                                            {chat.messages && chat.messages.length > 0 && (
                                                <div className="text-muted small mt-1">
                                                    {new Date(chat.messages[0].created_at).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Button variant="outline-secondary" size="sm" onClick={() => setSelectedChat(null)}>
                                ← Назад к списку
                            </Button>
                            <h6 className="mb-0">{chats.find(c => c.id === selectedChat)?.subject}</h6>
                        </div>

                        <div className="chat-messages mb-3" style={{ height: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px' }}>
                            {messages.map(message => (
                                <div key={message.id} className={`mb-3 ${message.sender_type === 'user' ? 'text-end' : 'text-start'}`}>
                                    <div className={`d-inline-block p-2 rounded ${message.sender_type === 'user' ? 'bg-primary text-white' : 'bg-light'}`}>
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
                            <div ref={messagesEndRef} />
                        </div>

                        <Form onSubmit={handleSendMessage}>
                            <div className="mb-3">
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Введите ваше сообщение..."
                                    disabled={loading}
                                />
                            </div>

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
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={loading}
                                    >
                                        <FaPaperclip className="me-1" />
                                        Прикрепить файлы
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,.txt,.doc,.docx"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                        disabled={loading}
                                    />
                                </div>
                                <Button variant="primary" type="submit" disabled={loading || (!newMessage.trim() && selectedFiles.length === 0)}>
                                    <FaPaperPlane className="me-1" />
                                    Отправить
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </Card.Body>

            {/* Модальное окно создания нового чата */}
            <Modal show={showNewChatModal} onHide={() => setShowNewChatModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Новое обращение в техническую поддержку</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Тема обращения</Form.Label>
                            <Form.Control
                                type="text"
                                value={newChatSubject}
                                onChange={(e) => setNewChatSubject(e.target.value)}
                                placeholder="Кратко опишите проблему..."
                                maxLength="100"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNewChatModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleCreateChat} disabled={loading || !newChatSubject.trim()}>
                        Создать обращение
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
});

export default ChatSupport;