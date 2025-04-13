export const validatePhone = (phone) => {
    if (!phone) return "Vui lòng nhập số điện thoại!";
    
    const trimmedPhone = phone.trim();
    if (trimmedPhone !== phone) return "Số điện thoại không được có khoảng trắng ở đầu hoặc cuối!";
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(trimmedPhone)) return "Số điện thoại phải có 10 chữ số!";
    
    return "";
};

export const validateName = (name) => {
    if (!name) return "Vui lòng nhập họ và tên!";
    
    const trimmedName = name.trim();
    if (trimmedName !== name) return "Tên không được có khoảng trắng ở đầu hoặc cuối!";
    
    if (trimmedName.length < 3) return "Tên phải có ít nhất 3 ký tự!";
    
    const nameRegex = /^[A-Za-zÀ-Ỹà-ỹ\s]+$/; // Chỉ cho phép chữ cái và khoảng trắng
    if (!nameRegex.test(trimmedName)) return "Tên chỉ được chứa chữ cái!";
    
    return "";
};

export const validatePassword = (password) => {
    if (!password) return "Vui lòng nhập mật khẩu!";
    
    const trimmedPassword = password.trim();
    if (trimmedPassword !== password) return "Mật khẩu không được có khoảng trắng ở đầu hoặc cuối!";
    
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(trimmedPassword)) return "Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất 1 ký tự đặc biệt!";
    
    return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Vui lòng nhập lại mật khẩu!";
    
    const trimmedConfirmPassword = confirmPassword.trim();
    if (trimmedConfirmPassword !== confirmPassword) return "Mật khẩu xác nhận không được có khoảng trắng ở đầu hoặc cuối!";
    
    if (password !== trimmedConfirmPassword) return "Mật khẩu không khớp!";
    
    return "";
};

export const validateEmail = (email) => {
    if (!email) return "Vui lòng nhập email!";
    
    const trimmedEmail = email.trim();
    if (trimmedEmail !== email) return "Email không được có khoảng trắng ở đầu hoặc cuối!";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return "Email không hợp lệ!";
    
    return "";
};

export const validateAge = (age) => {
    if (!age) return "Vui lòng nhập tuổi!";
    
    const trimmedAge = age.trim();
    if (trimmedAge !== age) return "Tuổi không được có khoảng trắng ở đầu hoặc cuối!";
    
    const ageNum = parseInt(trimmedAge);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) return "Tuổi phải từ 18 đến 65!";
    
    return "";
};

export const validateIdentityNumber = (idNumber) => {
    if (!idNumber) return "Vui lòng nhập số CMND/CCCD!";
    
    const trimmedIdNumber = idNumber.trim();
    if (trimmedIdNumber !== idNumber) return "Số CMND/CCCD không được có khoảng trắng ở đầu hoặc cuối!";
    
    const idRegex = /^[0-9]{9}$|^[0-9]{12}$/;
    if (!idRegex.test(trimmedIdNumber)) return "Số CMND/CCCD không hợp lệ!";
    
    return "";
};