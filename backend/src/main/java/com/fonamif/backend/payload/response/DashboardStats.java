package com.fonamif.backend.payload.response;

import java.util.List;

public class DashboardStats {
    private long totalAgents;
    private long presentCount;
    private long lateCount;
    private long absentCount;
    private String departmentName;
    private List<RecentLog> recentLogs;

    public DashboardStats() {
    }

    public DashboardStats(long totalAgents, long presentCount, long lateCount, long absentCount) {
        this.totalAgents = totalAgents;
        this.presentCount = presentCount;
        this.lateCount = lateCount;
        this.absentCount = absentCount;
    }

    public long getTotalAgents() {
        return totalAgents;
    }

    public void setTotalAgents(long totalAgents) {
        this.totalAgents = totalAgents;
    }

    public long getPresentCount() {
        return presentCount;
    }

    public void setPresentCount(long presentCount) {
        this.presentCount = presentCount;
    }

    public long getLateCount() {
        return lateCount;
    }

    public void setLateCount(long lateCount) {
        this.lateCount = lateCount;
    }

    public long getAbsentCount() {
        return absentCount;
    }

    public void setAbsentCount(long absentCount) {
        this.absentCount = absentCount;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public List<RecentLog> getRecentLogs() {
        return recentLogs;
    }

    public void setRecentLogs(List<RecentLog> recentLogs) {
        this.recentLogs = recentLogs;
    }

    // Inner class for recent activity logs
    public static class RecentLog {
        private Long id;
        private String time;
        private String user;
        private String action;
        private String location;

        public RecentLog(Long id, String time, String user, String action, String location) {
            this.id = id;
            this.time = time;
            this.user = user;
            this.action = action;
            this.location = location;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public String getUser() {
            return user;
        }

        public void setUser(String user) {
            this.user = user;
        }

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }
    }
}
