function JobCard({ image, title, description, count }) {
    return (
        <div className="service-card job-card">
            <div className="card-image job-image">
                <img src={image} alt={title} />
            </div>
            <div className="card-content job-content">
                <h3 className="service-title">{title}</h3>
                <p className="service-description">{description}</p>
                <h3 className="service-title job-count">{count}</h3>
            </div>
        </div>
    );
}

export default JobCard;