package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.model.AnalysisResult;
import com.resumeanalyzer.model.ResumeDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Service
public class ResumeAnalysisService {

    @Value("${python.ml.url:http://localhost:5001}")
    private String pythonMlUrl;

    @Value("${anthropic.api.key}")
    private String anthropicApiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public AnalysisResult analyze(ResumeDTO dto) {
        // Step 1: Call Python ML microservice for feature extraction
        Map<String, Object> mlFeatures = callPythonMlService(dto);

        // Step 2: Call Claude API for semantic analysis
        AnalysisResult result = callClaudeApi(dto, mlFeatures);

        return result;
    }

    private Map<String, Object> callPythonMlService(ResumeDTO dto) {
        try {
            String body = mapper.writeValueAsString(Map.of(
                "resume_text", dto.getResumeText(),
                "target_role", dto.getTargetRole() != null ? dto.getTargetRole() : ""
            ));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(pythonMlUrl + "/ml/extract"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return mapper.readValue(response.body(), Map.class);
        } catch (Exception e) {
            System.err.println("[Java] Python ML service unavailable: " + e.getMessage());
            // Return empty features — Claude will still analyze without them
            return Map.of();
        }
    }

    private AnalysisResult callClaudeApi(ResumeDTO dto, Map<String, Object> mlFeatures) {
        try {
            String systemPrompt = """
                You are a senior technical resume reviewer and ML model. Analyze the resume for the given job role.
                Return ONLY valid JSON with this exact structure (no markdown, no extra text):
                {
                  "overall_score": <0-100>,
                  "headline": "<one-line verdict, max 10 words>",
                  "subtitle": "<brief context sentence>",
                  "ats_score": <0-100>,
                  "keyword_match_pct": <0-100>,
                  "years_experience": <number>,
                  "matched_skills": ["skill1","skill2"],
                  "missing_skills": ["skill1","skill2"],
                  "bonus_skills": ["skill1","skill2"],
                  "section_scores": [
                    {"label":"Work experience","score":<0-100>},
                    {"label":"Education","score":<0-100>},
                    {"label":"Skills section","score":<0-100>},
                    {"label":"Formatting","score":<0-100>},
                    {"label":"Impact metrics","score":<0-100>}
                  ],
                  "suggestions": [
                    {"priority":"high","text":"<actionable improvement>"},
                    {"priority":"med","text":"<actionable improvement>"},
                    {"priority":"low","text":"<actionable improvement>"}
                  ],
                  "ml_features": {
                    "tfidf_top_terms": ["term1","term2","term3"],
                    "entity_types": {"ORG":3,"DATE":4,"SKILL":10},
                    "readability_grade": 12.4,
                    "action_verb_count": 8,
                    "quantified_achievements": 4
                  }
                }
                """;

            String userContent = String.format(
                "Resume:\\n%s\\n\\nTarget Role: %s\\nTarget Company: %s\\nML Features: %s\\n\\nReturn JSON only.",
                dto.getResumeText(),
                dto.getTargetRole() != null ? dto.getTargetRole() : "Software Engineer",
                dto.getTargetCompany() != null ? dto.getTargetCompany() : "a tech company",
                mapper.writeValueAsString(mlFeatures)
            );

            String requestBody = mapper.writeValueAsString(Map.of(
                "model", "claude-sonnet-4-20250514",
                "max_tokens", 1500,
                "system", systemPrompt,
                "messages", new Object[]{Map.of("role", "user", "content", userContent)}
            ));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("Content-Type", "application/json")
                .header("x-api-key", anthropicApiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            Map<String, Object> claudeResponse = mapper.readValue(response.body(), Map.class);

            // Extract text from content array
            var contentList = (java.util.List<?>) claudeResponse.get("content");
            var firstBlock = (Map<?, ?>) contentList.get(0);
            String jsonText = (String) firstBlock.get("text");

            // Strip any accidental markdown fences
            jsonText = jsonText.replaceAll("```json|```", "").trim();

            return mapper.readValue(jsonText, AnalysisResult.class);

        } catch (Exception e) {
            System.err.println("[Java] Claude API error: " + e.getMessage());
            throw new RuntimeException("Analysis failed: " + e.getMessage(), e);
        }
    }
}
