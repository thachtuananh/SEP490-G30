import { createContext, useEffect, useReducer } from "react";

// Hàm kiểm tra và parse JSON an toàn
const getUserFromsessionStorage = () => {
    try {
        const user = sessionStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Lỗi khi parse JSON:", error);
        return null;
    }
};
const getCleanerFromsessionStorage = () => {
    try {
        const cleaner = sessionStorage.getItem("cleaner");
        return cleaner ? JSON.parse(cleaner) : null;
    } catch (error) {
        console.error("Lỗi khi parse JSON:", error);
        return null;
    }
};
const initial_state = {
    user: getUserFromsessionStorage(),
    cleaner: getCleanerFromsessionStorage(),
    token: sessionStorage.getItem("token") || null,
    customerId: sessionStorage.getItem("customerId") || null,
    cleanerId: sessionStorage.getItem("cleanerId") || null,
    loading: false,
    error: null,
};

export const AuthContext = createContext(initial_state);

const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return { ...state, user: null, loading: true, error: null };

        case "LOGIN_SUCCESS_CUSTOMER":
            const customerLogin = {
                customerName: action.payload.name,
                customerPhone: action.payload.phone,
                token: action.payload.token,
                customerId: action.payload.customerId,
                customerEmail: action.payload.email,
                // role: action.payload.role
            };
            sessionStorage.setItem("user", JSON.stringify(customerLogin));
            return {
                ...state,
                user: customerLogin,
                token: action.payload.token,
                customerId: action.payload.customerId,
                loading: false,
                error: null
            };

        case "LOGIN_SUCCESS_CLEANER":
            const cleanerLogin = {
                cleanerName: action.payload.name, // Change name to cleanerName
                cleanerPhone: action.payload.phone, // Change phone to cleanerPhone
                token: action.payload.token,
                cleanerId: action.payload.cleanerId,
            };

            sessionStorage.setItem("cleaner", JSON.stringify(cleanerLogin));

            return {
                ...state,
                cleaner: cleanerLogin,
                token: action.payload.token,
                cleanerId: action.payload.cleanerId,
                cleanerPhone: action.payload.phone,
                loading: false,
                error: null
            };

        case "LOGIN_SUCCESS_ADMIN":
            const adminLogin = {
                adminName: action.payload.name,
                adminEmail: action.payload.email,
                token: action.payload.token,
                adminId: action.payload.adminId,
                // role: action.payload.role
            };
            sessionStorage.setItem("admin", JSON.stringify(adminLogin));
            return {
                ...state,
                admin: adminLogin,
                token: action.payload.token,
                adminId: action.payload.adminId,
                loading: false,
                error: null
            };

        case "FETCH_PROFILE_SUCCESS_CUSTOMER":
            const { name: customerName, phone: customerPhone,email:customerEmail } = action.payload;
            const customerProfile = { customerName, customerPhone,customerEmail };
            sessionStorage.setItem("user", JSON.stringify(customerProfile));
            return { ...state, user: customerProfile };

        case "FETCH_PROFILE_SUCCESS_CLEANER":
            const { name: cleanerName, phone: cleanerPhone, email: cleanerEmail, age: cleanerAge, address: cleanerAddress, identity_number: cleanerIDnum, experience: cleanerExp, profile_image } = action.payload;
            const cleanerProfile = { cleanerName, cleanerPhone, cleanerEmail, cleanerAge, cleanerAddress, cleanerIDnum, cleanerExp, profile_image };
            sessionStorage.setItem("cleaner", JSON.stringify(cleanerProfile));
            return { ...state, cleaner: cleanerProfile };

        case "LOGIN_FAILURE":
            return { ...state, user: null, loading: false, error: action.payload };

        case "UPDATE_USER":
            const updatedUser = { ...state.user, ...action.payload };
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
            return { ...state, user: updatedUser };

        case "UPDATE_CLEANER":
            const updatedCleaner = { ...state.cleaner, ...action.payload };
            sessionStorage.setItem("cleaner", JSON.stringify(updatedCleaner));
            return { ...state, cleaner: updatedCleaner };

        case "LOGOUT":
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("cleaner");
            sessionStorage.removeItem("admin");
            sessionStorage.removeItem("name");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("role");
            sessionStorage.removeItem("phone");
            sessionStorage.removeItem("customerId");
            sessionStorage.removeItem("cleanerId");
            sessionStorage.removeItem("adminId");
            localStorage.removeItem("image");
            return {
                ...state,
                user: null,
                cleaner: null,
                admin:null,
                token: null,
                customerId: null,
                cleanerId: null,
                adminId:null,
                name: null,
                role: null,
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
            sessionStorage.setItem("user", JSON.stringify(state.user));
        } else {
            sessionStorage.removeItem("user");
        }
    }, [state.user]);

    useEffect(() => {
        if (state.cleaner) {
            sessionStorage.setItem("cleaner", JSON.stringify(state.cleaner));
        } else {
            sessionStorage.removeItem("cleaner");
        }
    }, [state.cleaner]);
    useEffect(() => {
        if (state.admin) {
            sessionStorage.setItem("admin", JSON.stringify(state.admin));
        } else {
            sessionStorage.removeItem("admin");
        }
    }, [state.admin]);
    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
