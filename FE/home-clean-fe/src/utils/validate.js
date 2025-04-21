export const validatePhone = (phone) => {
    if (!phone) return "Vui lòng nhập số điện thoại!";
    
    const trimmedPhone = phone.trim();
    if (trimmedPhone !== phone) return "Số điện thoại không được có khoảng trắng ở đầu hoặc cuối!";
    
    if (trimmedPhone.length > 12) return "Số điện thoại không được vượt quá 12 ký tự!";
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(trimmedPhone)) return "Số điện thoại phải có 10 chữ số!";
    
    return "";
};

export const validateName = (name) => {
    if (!name) return "Vui lòng nhập họ và tên!";
    
    const trimmedName = name.trim();
    if (trimmedName !== name) return "Tên không được có khoảng trắng ở đầu hoặc cuối!";
    
    if (trimmedName.length < 3) return "Tên phải có ít nhất 3 ký tự!";
    if (trimmedName.length > 50) return "Tên không được vượt quá 50 ký tự!";
    
    const nameRegex = /^[A-Za-zÀ-Ỹà-ỹ\s]+$/; // Chỉ cho phép chữ cái và khoảng trắng
    if (!nameRegex.test(trimmedName)) return "Tên chỉ được chứa chữ cái!";
    
    return "";
};

export const validatePassword = (password) => {
    if (!password) return "Vui lòng nhập mật khẩu!";
    
    const trimmedPassword = password.trim();
    if (trimmedPassword !== password) return "Mật khẩu không được có khoảng trắng ở đầu hoặc cuối!";
    
    if (trimmedPassword.length > 32) return "Mật khẩu không được vượt quá 32 ký tự!";
    
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(trimmedPassword)) return "Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất 1 ký tự đặc biệt!";
    
    return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Vui lòng nhập lại mật khẩu!";
    
    const trimmedConfirmPassword = confirmPassword.trim();
    if (trimmedConfirmPassword !== confirmPassword) return "Mật khẩu xác nhận không được có khoảng trắng ở đầu hoặc cuối!";
    
    if (trimmedConfirmPassword.length > 32) return "Mật khẩu xác nhận không được vượt quá 32 ký tự!";
    
    if (password !== trimmedConfirmPassword) return "Mật khẩu không khớp!";
    
    return "";
};

export const validateEmail = (email) => {
    if (!email) return "Vui lòng nhập email!";
    
    const trimmedEmail = email.trim();
    if (trimmedEmail !== email) return "Email không được có khoảng trắng ở đầu hoặc cuối!";
    
    if (trimmedEmail.length > 100) return "Email không được vượt quá 100 ký tự!";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return "Email không hợp lệ!";
    
    return "";
};

export const validateAge = (age) => {
    if (!age) return "Vui lòng nhập tuổi!";
    
    // Convert to string if it's a number
    const ageStr = String(age);
    const trimmedAge = ageStr.trim();
    
    if (trimmedAge !== ageStr) return "Tuổi không được có khoảng trắng ở đầu hoặc cuối!";
    
    if (trimmedAge.length > 3) return "Giá trị tuổi không hợp lệ!";
    
    const ageNum = parseInt(trimmedAge);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) return "Tuổi phải từ 18 đến 65!";
    
    return "";
};

export const validateIdentityNumber = (idNumber) => {
    if (!idNumber) return "Vui lòng nhập số CMND/CCCD!";
    
    const trimmedIdNumber = idNumber.trim();
    if (trimmedIdNumber !== idNumber) return "Số CMND/CCCD không được có khoảng trắng ở đầu hoặc cuối!";
    
    if (trimmedIdNumber.length > 12) return "Số CMND/CCCD không được vượt quá 12 ký tự!";
    
    const idRegex = /^[0-9]{9}$|^[0-9]{12}$/;
    if (!idRegex.test(trimmedIdNumber)) return "Số CMND/CCCD không hợp lệ!";
    
    return "";
};