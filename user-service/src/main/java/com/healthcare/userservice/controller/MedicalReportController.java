package com.healthcare.userservice.controller;

import com.healthcare.userservice.dto.MedicalReportResponse;
import com.healthcare.userservice.model.MedicalReport;
import com.healthcare.userservice.repo.MedicalReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class MedicalReportController {

    @Autowired
    private MedicalReportRepository medicalReportRepository;

    @PostMapping("/{userId}/reports")
    public ResponseEntity<MedicalReportResponse> uploadReport(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) throws IOException {

        MedicalReport report = new MedicalReport();
        report.setUserId(userId);
        report.setFileName(file.getOriginalFilename());
        report.setFileType(file.getContentType());
        report.setFileData(file.getBytes());

        MedicalReport saved = medicalReportRepository.save(report);
        return new ResponseEntity<>(mapToResponse(saved), HttpStatus.CREATED);
    }

    @GetMapping("/{userId}/reports")
    public ResponseEntity<List<MedicalReportResponse>> getReportsByUser(@PathVariable Long userId) {
        List<MedicalReportResponse> reports = medicalReportRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/{reportId}")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long reportId) {
        MedicalReport report = medicalReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with ID: " + reportId));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(report.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + report.getFileName() + "\"")
                .body(report.getFileData());
    }

    @DeleteMapping("/reports/{reportId}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long reportId) {
        MedicalReport report = medicalReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with ID: " + reportId));
        medicalReportRepository.delete(report);
        return ResponseEntity.noContent().build();
    }

    private MedicalReportResponse mapToResponse(MedicalReport report) {
        MedicalReportResponse response = new MedicalReportResponse();
        response.setId(report.getId());
        response.setUserId(report.getUserId());
        response.setFileName(report.getFileName());
        response.setFileType(report.getFileType());
        response.setUploadDate(report.getUploadDate());
        return response;
    }
}
