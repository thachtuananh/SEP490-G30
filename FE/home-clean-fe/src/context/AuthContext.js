import { createContext, useEffect, useReducer } from "react";

// Hàm kiểm tra và parse JSON an toàn
const getUserFromLocalStorage = () => {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Lỗi khi parse JSON:", error);
        return null;
    }
};
const getCleanerFromLocalStorage = () => {
    try {
        const cleaner = localStorage.getItem("cleaner");
        return cleaner ? JSON.parse(cleaner) : null;
    } catch (error) {
        console.error("Lỗi khi parse JSON:", error);
        return null;
    }
};
const initial_state = {
    user: getUserFromLocalStorage(),
    cleaner: getCleanerFromLocalStorage(),
    token: localStorage.getItem("token") || null,
    customerId: localStorage.getItem("customerId") || null,
    cleanerId: localStorage.getItem("cleanerId") || null,
    loading: false,
    error: null,
};

export const AuthContext = createContext(initial_state);

const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return { ...state, user: null, loading: true, error: null };

        case "LOGIN_SUCCESS_CUSTOMER":
            const { name, token, customerId, phone } = action.payload;
            localStorage.setItem("user", JSON.stringify({ name, phone }));
            localStorage.setItem("token", token);
            localStorage.setItem("customerId", customerId);
            return {
                ...state,
                user: { name, phone },
                token,
                customerId,
                loading: false,
                error: null
            };

        // case "LOGIN_SUCCESS_CLEANER":
        //     const { name: empName, token: tokenC, cleanerId, phone: empPhone } = action.payload;

        //     // Lưu thông tin của cleaner vào localStorage
        //     localStorage.setItem("name", empName);
        //     localStorage.setItem("cleanerId", cleanerId);
        //     localStorage.setItem("token", tokenC);

        //     return {
        //         ...state,
        //         cleaner: { empName, empPhone },
        //         token: tokenC,
        //         cleanerId,
        //         loading: false,
        //         error: null
        //     };

        case "LOGIN_SUCCESS_CLEANER":


            const cleanerLogin = {
                name: action.payload.name,
                phone: action.payload.phone,
                token: action.payload.token,
                cleanerId: action.payload.cleanerId
            };

            localStorage.setItem("cleaner", JSON.stringify(cleanerLogin));

            return {
                ...state,
                cleaner: cleanerLogin,
                token: action.payload.token,
                cleanerId: action.payload.cleanerId,
                loading: false,
                error: null
            };

        case "FETCH_PROFILE_SUCCESS_CUSTOMER":
            const { name: customerName, phone: customerPhone } = action.payload;
            const customerProfile = { customerName, customerPhone };
            localStorage.setItem("user", JSON.stringify(customerProfile));
            return { ...state, user: customerProfile };

        case "FETCH_PROFILE_SUCCESS_CLEANER":
            const { name: cleanerName, phone: cleanerPhone, email: cleanerEmail, age: cleanerAge, address: cleanerAddress, identity_number: cleanerIDnum, experience: cleanerExp, profile_image } = action.payload;
            const cleanerProfile = { cleanerName, cleanerPhone, cleanerEmail, cleanerAge, cleanerAddress, cleanerIDnum, cleanerExp, profile_image };
            localStorage.setItem("cleaner", JSON.stringify(cleanerProfile));
            return { ...state, cleaner: cleanerProfile };

        case "LOGIN_FAILURE":
            return { ...state, user: null, loading: false, error: action.payload };

        case "UPDATE_USER":
            const updatedUser = { ...state.user, ...action.payload };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return { ...state, user: updatedUser };

        case "LOGOUT":
            localStorage.removeItem("user");
            localStorage.removeItem("cleaner");
            localStorage.removeItem("token");
            localStorage.removeItem("customerId");
            localStorage.removeItem("cleanerId");

            return {
                ...state,
                user: null,
                cleaner: null,
                token: null,
                customerId: null,
                cleanerId: null,
                loading: false,
                error: null
            };



        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, initial_state);

    useEffect(() => {
        if (state.user) {
            localStorage.setItem("user", JSON.stringify(state.user));
        } else {
            localStorage.removeItem("user");
        }
    }, [state.user]);

    useEffect(() => {
        if (state.cleaner) {
            localStorage.setItem("cleaner", JSON.stringify(state.cleaner));
        } else {
            localStorage.removeItem("cleaner");
        }
    }, [state.cleaner]);
    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
