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

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Vui lòng nhập email!";
    if (!emailRegex.test(email)) return "Email không hợp lệ!";
    return "";
};

export const validateAge = (age) => {
    if (!age) return "Vui lòng nhập tuổi!";
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) return "Tuổi phải từ 18 đến 65!";
    return "";
};

export const validateIdentityNumber = (idNumber) => {
    const idRegex = /^[0-9]{9}$|^[0-9]{12}$/;
    if (!idNumber) return "Vui lòng nhập số CMND/CCCD!";
    if (!idRegex.test(idNumber)) return "Số CMND/CCCD không hợp lệ!";
    return "";
};