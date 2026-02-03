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
        check().then(data => {
            user.setUser(data)
            user.setIsAuth(true)
        }).catch(() => {
            // Error handling if check fails (user not logged in)
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
