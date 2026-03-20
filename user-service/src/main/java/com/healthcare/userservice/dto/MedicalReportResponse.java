package com.healthcare.userservice.dto;

import java.time.LocalDateTime;

public class MedicalReportResponse {

    private Long id;
    private Long userId;
    private String fileName;
    private String fileType;
    private LocalDateTime uploadDate;

    public MedicalReportResponse() {
    }

    public MedicalReportResponse(Long id, Long userId, String fileName, String fileType, LocalDateTime uploadDate) {
        this.id = id;
        this.userId = userId;
        this.fileName = fileName;
        this.fileType = fileType;
        this.uploadDate = uploadDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }
}
