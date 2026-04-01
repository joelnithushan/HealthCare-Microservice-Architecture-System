package com.healthcare.symptomcheckerservice.repo;

import com.healthcare.symptomcheckerservice.model.SymptomCheck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SymptomCheckRepository extends JpaRepository<SymptomCheck, Long> {

    List<SymptomCheck> findByUserIdOrderByCreatedAtDesc(Long userId);
}
