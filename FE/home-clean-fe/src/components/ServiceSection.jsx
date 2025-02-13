import ServiceCard from "./ServiceCard"

function ServiceSection({ title }) {
  return (
    <section className="service-section">
      <h2 className="section-title">{title}</h2>
      <div className="service-grid">
        {[1, 2, 3, 4].map((i) => (
          <ServiceCard key={i} />
        ))}
      </div>
    </section>
  )
}

export default ServiceSection

