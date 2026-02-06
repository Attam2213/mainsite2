import { BrowserRouter } from "react-router-dom";
import AppRouter from "./components/AppRouter";
import NavBar from "./components/NavBar";
import {observer} from "mobx-react-lite";
import {useContext, useEffect, useState} from "react";
import {Context} from "./main";
import {check} from "./http/userAPI";
import 'bootstrap/dist/css/bootstrap.min.css';

const App = observer(() => {
    const {user} = useContext(Context)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        console.log('Проверка аутентификации при загрузке приложения...');
        check().then(data => {
            if (data && data.user) {
                console.log('Пользователь аутентифицирован:', data.user);
                user.setUser(data.user)
                user.setIsAuth(true)
            } else {
                console.log('Данные пользователя некорректны:', data);
                user.setUser({})
                user.setIsAuth(false)
            }
        }).catch((error) => {
            console.log('Пользователь не аутентифицирован:', error.message);
            user.setUser({})
            user.setIsAuth(false)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center" style={{height: window.innerHeight}}>Loading...</div>
    }

    return (
        <BrowserRouter>
            <NavBar />
            <AppRouter />
        </BrowserRouter>
    );
})

export default App;
