import { createContext, useEffect, useReducer } from "react";

// Hàm kiểm tra và parse JSON an toàn
const getUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");
    try {
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Lỗi khi parse JSON:", error);
        return null;
    }
};

const initial_state = {
    user: getUserFromLocalStorage(),
    loading: false,
    error: null,
};

export const AuthContext = createContext(initial_state);

// Reducer xử lý các hành động
const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return { ...state, user: null, loading: true, error: null };
        case "LOGIN_SUCCESS":
            localStorage.setItem("user", JSON.stringify(action.payload));
            return { ...state, user: action.payload, loading: false, error: null };
        case "LOGIN_FAILURE":
            return { ...state, user: null, loading: false, error: action.payload };
        case "REGISTER_SUCCESS":
            return { ...state, user: null, loading: false, error: null };
        case "UPDATE_USER":
            const updatedUser = { ...state.user, ...action.payload };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return { ...state, user: updatedUser };
        case "LOGOUT":
            localStorage.removeItem("user");
            return { ...state, user: null, loading: false, error: null };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, initial_state);

    // Cập nhật localStorage khi user thay đổi
    useEffect(() => {
        if (state.user) {
            localStorage.setItem("user", JSON.stringify(state.user));
        } else {
            localStorage.removeItem("user");
        }
    }, [state.user]);

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
