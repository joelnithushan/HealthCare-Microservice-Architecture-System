package com.healthcare.appointmentservice.controller;

import com.healthcare.appointmentservice.dto.AppointmentResponse;
import com.healthcare.appointmentservice.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/appointments")
public class AdminAppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAppointmentStats() {
        List<AppointmentResponse> allAppointments = appointmentService.getAllAppointments();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAppointments", allAppointments.size());

        long scheduled = allAppointments.stream().filter(a -> "ACCEPTED".equals(a.getStatus()) || "PENDING".equals(a.getStatus())).count();
        long completed = allAppointments.stream().filter(a -> "COMPLETED".equals(a.getStatus())).count();
        long cancelled = allAppointments.stream().filter(a -> "CANCELLED".equals(a.getStatus())).count();

        stats.put("scheduledAppointments", scheduled);
        stats.put("completedAppointments", completed);
        stats.put("cancelledAppointments", cancelled);

        return ResponseEntity.ok(stats);
    }
}
