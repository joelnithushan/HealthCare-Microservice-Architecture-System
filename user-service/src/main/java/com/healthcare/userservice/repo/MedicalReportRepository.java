package com.healthcare.userservice.repo;

import com.healthcare.userservice.model.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {

    List<MedicalReport> findByUserId(Long userId);
}
