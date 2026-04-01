package com.healthcare.symptomcheckerservice.controller;

import com.healthcare.symptomcheckerservice.dto.SymptomCheckRequest;
import com.healthcare.symptomcheckerservice.dto.SymptomCheckResponse;
import com.healthcare.symptomcheckerservice.service.SymptomCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/symptoms")
@CrossOrigin(origins = "*")
public class SymptomCheckController {

    @Autowired
    private SymptomCheckService symptomCheckService;

    @PostMapping("/check")
    public ResponseEntity<SymptomCheckResponse> checkSymptoms(@RequestBody SymptomCheckRequest request) {
        SymptomCheckResponse result = symptomCheckService.checkSymptoms(request);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<SymptomCheckResponse>> getCheckHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(symptomCheckService.getCheckHistory(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SymptomCheckResponse> getCheckById(@PathVariable Long id) {
        return ResponseEntity.ok(symptomCheckService.getCheckById(id));
    }
}
