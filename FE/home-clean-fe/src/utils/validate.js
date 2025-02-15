export const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone) return "Vui lòng nhập số điện thoại!";
    if (!phoneRegex.test(phone)) return "Số điện thoại phải có 10 chữ số!";
    return "";
};

export const validateName = (name) => {
    const nameRegex = /^[A-Za-zÀ-Ỹà-ỹ\s]+$/; // Chỉ cho phép chữ cái và khoảng trắng
    if (!name) return "Vui lòng nhập họ và tên!";
    if (name.length < 3) return "Tên phải có ít nhất 3 ký tự!";
    if (!nameRegex.test(name)) return "Tên chỉ được chứa chữ cái!";
    return "";
};

export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!password) return "Vui lòng nhập mật khẩu!";
    if (!passwordRegex.test(password)) return "Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất 1 ký tự đặc biệt!";
    return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Vui lòng nhập lại mật khẩu!";
    if (password !== confirmPassword) return "Mật khẩu không khớp!";
    return "";
};
