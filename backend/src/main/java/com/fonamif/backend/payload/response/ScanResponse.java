package com.fonamif.backend.payload.response;

public class ScanResponse {
    private String message;
    private String agentName;
    private String departmentName;
    private String type; // "ENTRÉE" or "SORTIE"
    private String status; // "À L'HEURE" or "EN RETARD"
    private String timestamp;

    public ScanResponse() {
    }

    public ScanResponse(String message, String agentName, String departmentName, String type, String status,
            String timestamp) {
        this.message = message;
        this.agentName = agentName;
        this.departmentName = departmentName;
        this.type = type;
        this.status = status;
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
