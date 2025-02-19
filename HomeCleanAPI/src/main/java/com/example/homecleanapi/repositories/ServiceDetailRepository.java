package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.ServiceDetail;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceDetailRepository extends JpaRepository<ServiceDetail, Long> {
    List<ServiceDetail> findByServiceId(Long serviceId);
<<<<<<< HEAD
<<<<<<< HEAD
}
=======
=======
>>>>>>> 1751fa820f84132c0e8f88f2ccce12cc415882e1
}



<<<<<<< HEAD
>>>>>>> 9a0130a (new commit with new API)
=======
>>>>>>> 1751fa820f84132c0e8f88f2ccce12cc415882e1
