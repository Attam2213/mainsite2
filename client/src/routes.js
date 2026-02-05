import Admin from "./pages/Admin";
import {ADMIN_ROUTE, CABINET_ROUTE, LOGIN_ROUTE, PORTFOLIO_ROUTE, REGISTRATION_ROUTE, SHOP_ROUTE, PAYMENT_STATUS_ROUTE} from "./utils/consts";
import Cabinet from "./pages/Cabinet";
import Shop from "./pages/Shop";
import Auth from "./pages/Auth";
import PaymentStatus from "./pages/PaymentStatus";

export const authRoutes = [
    {
        path: ADMIN_ROUTE,
        Component: Admin
    },
    {
        path: CABINET_ROUTE,
        Component: Cabinet
    },
    {
        path: PAYMENT_STATUS_ROUTE,
        Component: PaymentStatus
    }
]

export const publicRoutes = [
    {
        path: SHOP_ROUTE,
        Component: Shop
    },
    {
        path: LOGIN_ROUTE,
        Component: Auth
    },
    {
        path: REGISTRATION_ROUTE,
        Component: Auth
    }
]
