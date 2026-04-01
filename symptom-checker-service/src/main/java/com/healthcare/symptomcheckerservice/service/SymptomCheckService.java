package com.healthcare.symptomcheckerservice.service;

import com.healthcare.symptomcheckerservice.dto.SymptomCheckRequest;
import com.healthcare.symptomcheckerservice.dto.SymptomCheckResponse;

import java.util.List;

public interface SymptomCheckService {

    SymptomCheckResponse checkSymptoms(SymptomCheckRequest request);

    List<SymptomCheckResponse> getCheckHistory(Long userId);

    SymptomCheckResponse getCheckById(Long id);
}
