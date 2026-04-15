package com.healthcare.doctorservice.repo;

import com.healthcare.doctorservice.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);

    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);

    List<Doctor> findByVerified(boolean verified);

    long countByVerified(boolean verified);
}
