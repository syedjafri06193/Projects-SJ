package com.resumeanalyzer.model;

import java.util.List;
import java.util.Map;

public class AnalysisResult {
    private int overallScore;
    private String headline;
    private String subtitle;
    private int atsScore;
    private int keywordMatchPct;
    private int yearsExperience;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> bonusSkills;
    private List<SectionScore> sectionScores;
    private List<Suggestion> suggestions;
    private MlFeatures mlFeatures;

    // --- nested types ---

    public static class SectionScore {
        private String label;
        private int score;
        public SectionScore() {}
        public SectionScore(String label, int score) { this.label = label; this.score = score; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
    }

    public static class Suggestion {
        private String priority;
        private String text;
        public Suggestion() {}
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public static class MlFeatures {
        private List<String> tfidfTopTerms;
        private Map<String, Integer> entityTypes;
        private double readabilityGrade;
        private int actionVerbCount;
        private int quantifiedAchievements;
        public MlFeatures() {}
        public List<String> getTfidfTopTerms() { return tfidfTopTerms; }
        public void setTfidfTopTerms(List<String> t) { this.tfidfTopTerms = t; }
        public Map<String, Integer> getEntityTypes() { return entityTypes; }
        public void setEntityTypes(Map<String, Integer> e) { this.entityTypes = e; }
        public double getReadabilityGrade() { return readabilityGrade; }
        public void setReadabilityGrade(double r) { this.readabilityGrade = r; }
        public int getActionVerbCount() { return actionVerbCount; }
        public void setActionVerbCount(int a) { this.actionVerbCount = a; }
        public int getQuantifiedAchievements() { return quantifiedAchievements; }
        public void setQuantifiedAchievements(int q) { this.quantifiedAchievements = q; }
    }

    // --- getters/setters ---

    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int s) { this.overallScore = s; }
    public String getHeadline() { return headline; }
    public void setHeadline(String h) { this.headline = h; }
    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String s) { this.subtitle = s; }
    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int a) { this.atsScore = a; }
    public int getKeywordMatchPct() { return keywordMatchPct; }
    public void setKeywordMatchPct(int k) { this.keywordMatchPct = k; }
    public int getYearsExperience() { return yearsExperience; }
    public void setYearsExperience(int y) { this.yearsExperience = y; }
    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> m) { this.matchedSkills = m; }
    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> m) { this.missingSkills = m; }
    public List<String> getBonusSkills() { return bonusSkills; }
    public void setBonusSkills(List<String> b) { this.bonusSkills = b; }
    public List<SectionScore> getSectionScores() { return sectionScores; }
    public void setSectionScores(List<SectionScore> s) { this.sectionScores = s; }
    public List<Suggestion> getSuggestions() { return suggestions; }
    public void setSuggestions(List<Suggestion> s) { this.suggestions = s; }
    public MlFeatures getMlFeatures() { return mlFeatures; }
    public void setMlFeatures(MlFeatures m) { this.mlFeatures = m; }
}
