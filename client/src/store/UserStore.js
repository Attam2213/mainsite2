import { makeAutoObservable } from 'mobx';

class UserStore {
    constructor() {
        this._isAuth = false;
        this._user = {};
        this._loading = false;
        this._error = null;
        makeAutoObservable(this);
    }

    setIsAuth(bool) {
        this._isAuth = bool;
    }

    setUser(user) {
        this._user = user;
    }

    setLoading(bool) {
        this._loading = bool;
    }

    setError(error) {
        this._error = error;
    }

    get isAuth() {
        return this._isAuth;
    }

    get user() {
        return this._user;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }

    // Очистка состояния при выходе
    logout() {
        this._isAuth = false;
        this._user = {};
        this._error = null;
        localStorage.removeItem('token');
    }
}

export default UserStore;