package com.healthcare.symptomcheckerservice.service;

import com.healthcare.symptomcheckerservice.dto.SymptomCheckRequest;
import com.healthcare.symptomcheckerservice.dto.SymptomCheckResponse;
import com.healthcare.symptomcheckerservice.exception.ResourceNotFoundException;
import com.healthcare.symptomcheckerservice.model.SymptomCheck;
import com.healthcare.symptomcheckerservice.repo.SymptomCheckRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SymptomCheckServiceImpl implements SymptomCheckService {

    @Autowired
    private SymptomCheckRepository symptomCheckRepository;

    @Autowired
    private GeminiAiService geminiAiService;

    @Override
    public SymptomCheckResponse checkSymptoms(SymptomCheckRequest request) {
        // Call Gemini AI to analyze symptoms
        Map<String, String> aiResult = geminiAiService.analyzeSymptoms(request.getSymptoms());

        // Save the result to database
        SymptomCheck check = new SymptomCheck();
        check.setUserId(request.getUserId());
        check.setSymptoms(request.getSymptoms());
        check.setAiResponse(aiResult.get("suggestion"));
        check.setRecommendedSpecialty(aiResult.get("recommendedSpecialty"));
        check.setSeverity(aiResult.get("severity"));

        SymptomCheck saved = symptomCheckRepository.save(check);
        return mapToResponse(saved);
    }

    @Override
    public List<SymptomCheckResponse> getCheckHistory(Long userId) {
        return symptomCheckRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SymptomCheckResponse getCheckById(Long id) {
        SymptomCheck check = symptomCheckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Symptom check not found with ID: " + id));
        return mapToResponse(check);
    }

    private SymptomCheckResponse mapToResponse(SymptomCheck check) {
        SymptomCheckResponse response = new SymptomCheckResponse();
        response.setId(check.getId());
        response.setUserId(check.getUserId());
        response.setSymptoms(check.getSymptoms());
        response.setAiSuggestion(check.getAiResponse());
        response.setRecommendedSpecialty(check.getRecommendedSpecialty());
        response.setSeverity(check.getSeverity());
        response.setCreatedAt(check.getCreatedAt());
        return response;
    }
}
