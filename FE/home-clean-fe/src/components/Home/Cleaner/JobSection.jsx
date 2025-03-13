import JobCard from "./JobCard";
import iconKhach from "../../../assets/icon-pageClean/icon-clean-phongkhach.svg";
import iconNgu from "../../../assets/icon-pageClean/icon-clean-phongngu.svg";
import iconBep from "../../../assets/icon-pageClean/icon-clean-phongbep.svg";
import iconToilet from "../../../assets/icon-pageClean/icon-clean-donnhavs.svg";
import iconSk from "../../../assets/icon-pageClean/icon-clean-sk.svg";
import iconSua from "../../../assets/icon-pageClean/icon-clean-suachua.svg";
import iconVanPhong from "../../../assets/icon-pageClean/icon-clean-vanphong.svg";
import iconDinhKy from "../../../assets/icon-pageClean/icon-clean-dinhky.svg";
import { MdSearch, MdLocationOn } from "react-icons/md";

const services = [
  {
    id: 1,
    image: iconKhach,
    title: "Dọn phòng khách",
    description: "Lau sàn, hút bụi, lau bàn ghế, cửa kính",
    count: "2 việc làm",

  },
  {
    id: 2,
    image: iconNgu,
    title: "Dọn phòng ngủ",
    description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
    count: "1 việc làm",
  },
  {
    id: 3,
    image: iconBep,
    title: "Dọn bếp",
    description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
    count: "3 việc làm",
  },
  {
    id: 4,
    image: iconToilet,
    title: "Dọn nhà vệ sinh",
    description: "Gấp chăn gối, lau bụi, hút bụi, lau sàn",
    count: "2 việc làm",
  },
  {
    id: 5,
    image: iconSk,
    title: "Dọn dẹp sau tiệc/tổ chức sự kiện",
    description: "Lau sàn, hút bụi, lau bàn ghế, cửa kính",
    count: "0 việc làm",

  },
  {
    id: 6,
    image: iconSua,
    title: "Dọn dẹp nhà mới xây, sau sửa chữa",
    description: "Lau sàn, hút bụi, lau bàn ghế, cửa kính",
    count: "2 việc làm",

  },
  {
    id: 7,
    image: iconVanPhong,
    title: "Dọn dẹp văn phòng, cửa hàng",
    description: "Lau sàn, hút bụi, lau bàn ghế, cửa kính",
    count: "4 việc làm",

  },
  {
    id: 8,
    image: iconDinhKy,
    title: "Dọn dẹp nhà theo định kỳ (Hàng tuần, hàng tháng)",
    description: "Lau sàn, hút bụi, lau bàn ghế, cửa kính",
    count: "3 việc làm",

  },
];

function JobSection({ title }) {
  return (
    <section className="service-section">
      <div className="searchbar-group">

        <input className="searchbar" placeholder="Tìm tên công việc mong muốn" />
        <div className="button-group">
          <button className="diadiem">Địa điểm <MdLocationOn /></button>
          <button className="searchbtn"><MdSearch /> Tìm kiếm</button>
        </div>

      </div>
      <h2 className="section-title job-title">{title}</h2>
      <div className="service-grid job-grid">
        {services.map((service) => (
          <JobCard key={service.id} {...service} />
        ))}
      </div>
    </section>

  );
}

export default JobSection;