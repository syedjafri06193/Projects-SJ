package com.resumeanalyzer.controller;

import com.resumeanalyzer.model.AnalysisResult;
import com.resumeanalyzer.model.ResumeDTO;
import com.resumeanalyzer.service.ResumeAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/resume")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeAnalysisService analysisService;

    /**
     * POST /api/v1/resume/analyze
     * Accepts resume text + job target, calls Python ML service,
     * then calls Claude AI for semantic analysis.
     */
    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResult> analyze(@RequestBody ResumeDTO dto) {
        if (dto.getResumeText() == null || dto.getResumeText().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        AnalysisResult result = analysisService.analyze(dto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\":\"ok\",\"service\":\"resume-analyzer-java\"}");
    }
}
