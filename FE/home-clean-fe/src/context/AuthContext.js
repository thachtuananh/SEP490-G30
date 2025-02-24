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

const initial_state = {
    user: getUserFromLocalStorage(),
    token: localStorage.getItem("token") || null,
    customerId: localStorage.getItem("customerId") || null,
    loading: false,
    error: null,
};

export const AuthContext = createContext(initial_state);

const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return { ...state, user: null, loading: true, error: null };

        case "LOGIN_SUCCESS":
            const { user, token, customerId } = action.payload;
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
            localStorage.setItem("customerId", customerId);
            return { ...state, user, token, customerId, loading: false, error: null };

        case "FETCH_PROFILE_SUCCESS":
            const { name, phone, email, gender, dob, addresses } = action.payload;
            const userProfile = { name, phone, email, gender, dob, addresses };
            localStorage.setItem("user", JSON.stringify(userProfile));
            return { ...state, user: userProfile };


        case "LOGIN_FAILURE":
            return { ...state, user: null, loading: false, error: action.payload };

        case "UPDATE_USER":
            const updatedUser = { ...state.user, ...action.payload };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return { ...state, user: updatedUser };

        case "LOGOUT":
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("customerId");
            return { ...state, user: null, token: null, customerId: null, loading: false, error: null };

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

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
