package com.atob.atobapp.repository;

import com.atob.atobapp.domain.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository <Location,String>{
}
