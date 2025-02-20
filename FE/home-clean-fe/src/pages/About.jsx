import React from "react";
import bg from "../assets/bgintroduce.png";
import abImg from "../assets/about-img.png";
import iconImg from "../assets/icon-about.png";
import profileImg from "../assets/imgProfile/imgProfile.svg"
import { FaTwitter } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";



export const About = () => {
    return (
        <div>
            {/* Câu chuyện */}
            <div className="story-container">
                <h2>Câu chuyện Houseclean</h2>
                <div className="divider">
                    <div className="divider-green"></div>
                    {/* <div className="divider-gray"></div> */}
                </div>

                <div className="story-content">
                    <div className="story-text">
                        <p>
                            HouseClean tự hào là đơn vị cung cấp dịch vụ dọn dẹp nhà cửa chuyên nghiệp,
                            giúp mang lại không gian sống sạch sẽ, gọn gàng và thoải mái cho mọi gia đình.
                            Chúng tôi hiểu rằng một ngôi nhà sạch đẹp không chỉ tạo cảm giác thư thái
                            mà còn góp phần bảo vệ sức khỏe và nâng cao chất lượng cuộc sống.
                            Vì vậy, HouseClean cam kết mang đến giải pháp vệ sinh tối ưu với tiêu chuẩn cao nhất.
                        </p>
                        <p>
                            Với đội ngũ nhân viên tận tâm, giàu kinh nghiệm và được đào tạo bài bản,
                            HouseClean không chỉ đơn thuần làm sạch mà còn chăm chút từng chi tiết nhỏ để đảm
                            bảo ngôi nhà của bạn luôn trong trạng thái tốt nhất. Chúng tôi sử dụng các thiết bị
                            hiện đại, kết hợp với dung dịch vệ sinh an toàn, thân thiện với môi trường, giúp loại
                            bỏ bụi bẩn và vi khuẩn hiệu quả mà không gây ảnh hưởng đến sức khỏe của bạn và gia đình.
                        </p>
                        <p>
                            HouseClean cung cấp nhiều gói dịch vụ linh hoạt, phù hợp với nhu cầu riêng biệt:
                            từ dọn dẹp định kỳ hàng ngày, hàng tuần, tổng vệ sinh theo yêu cầu, đến vệ sinh nhà cửa sau
                            xây dựng hoặc trước khi chuyển nhà. Mọi quy trình làm sạch đều được thực hiện một cách chuyên
                            nghiệp, nhanh chóng và đảm bảo chất lượng.
                            Chúng tôi luôn đặt sự hài lòng của khách hàng lên hàng đầu, cam kết mang đến dịch vụ
                            với giá cả hợp lý, minh bạch, không phát sinh chi phí ẩn.
                        </p>
                    </div>
                    <div className="story-images">
                        {/* <div className="main-image">
                            <img src={bg} alt="Main" />
                        </div>
                        <div className="sub-images">
                            <img className="small-image" src={bg} alt="Sub 1" />
                            <img className="large-image" src={bg} alt="Sub 2" />
                        </div>
                         */}
                        <img src={abImg} alt="story-img" />
                    </div>
                </div>
            </div>

            {/* Dịch vụ */}
            <div className="services-section">
                <div className="services-container">
                    <h2>Tại sao chọn dịch vụ tại Houseclean</h2>
                    <div className="divider">
                        <div className="divider-green services-divider"></div>
                    </div>

                    <div className="services-grid">
                        {[
                            {
                                title: "Chuyên nghiệp & Uy tín",
                                description: "HouseClean có đội ngũ nhân viên giàu kinh nghiệm, được đào tạo bài bản, đảm bảo chất lượng dọn dẹp cao nhất."
                            },
                            {
                                title: "Dịch vụ đa dạng, linh hoạt",
                                description: "Từ dọn dẹp định kỳ, tổng vệ sinh nhà cửa, đến vệ sinh sau xây dựng – HouseClean đáp ứng mọi nhu cầu của bạn."
                            },
                            {
                                title: "Sử dụng thiết bị & dung dịch an toàn",
                                description: "Chúng tôi sử dụng các sản phẩm làm sạch thân thiện với môi trường, đảm bảo an toàn cho sức khỏe gia đình bạn."
                            },
                            {
                                title: "Tiết kiệm thời gian & công sức",
                                description: "Chỉ cần một cuộc gọi, HouseClean sẽ giúp bạn dọn dẹp nhanh chóng, hiệu quả, để bạn có thêm thời gian tận hưởng cuộc sống."
                            },
                            {
                                title: "Chi phí hợp lý, minh bạch",
                                description: "Giá cả cạnh tranh, không phát sinh chi phí ẩn, giúp bạn yên tâm sử dụng dịch vụ."
                            },
                            {
                                title: "Cam kết hài lòng 100%",
                                description: "Nếu có bất kỳ vấn đề gì, HouseClean sẵn sàng hỗ trợ và khắc phục ngay để đảm bảo sự hài lòng của khách hàng."
                            }
                        ].map((service, index) => (
                            <div key={index} className="service-item">
                                <div className="service-icon">
                                    <img src={iconImg} alt="icon" />
                                </div>
                                <b>{service.title}</b>
                                <p>{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Đội ngũ */}
            <div className="team-section">
                <h2>Đội ngũ phát triển</h2>
                <div className="divider">
                    <div className="divider-green"></div>
                    {/* <div className="divider-gray"></div> */}
                </div>

                <div className="team-grid">
                    <div className="team-member">
                        <img src={profileImg} alt="Team member" />
                        <b>Thạch Tuấn Anh</b>
                        <p className="role">Giám đốc điều hành</p>
                        <p>Chịu trách nhiệm chỉ đạo và giám sát toàn bộ hoạt động.</p>
                        <div className="social-icons">
                            <FaTwitter />
                            <FaLinkedin />
                            <FaFacebook />
                        </div>
                    </div>

                    <div className="team-member">
                        <img src={profileImg} alt="Team member" />
                        <b>Trần Tiến Mạnh</b>
                        <p className="role">Trưởng phòng kỹ thuật</p>
                        <p>Quản lý và phát triển các giải pháp kỹ thuật cho dự án.</p>
                        <div className="social-icons">
                            <FaTwitter />
                            <FaLinkedin />
                            <FaFacebook />
                        </div>
                    </div>

                    <div className="team-member">
                        <img src={profileImg} alt="Team member" />
                        <b>Nguyễn Xuân Sơn</b>
                        <p className="role">Chăm sóc khách hàng</p>
                        <p>Hỗ trợ khách hàng và xử lý các vấn đề phát sinh.</p>
                        <div className="social-icons">
                            <FaTwitter />
                            <FaLinkedin />
                            <FaFacebook />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;