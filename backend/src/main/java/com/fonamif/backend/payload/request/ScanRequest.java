package com.fonamif.backend.payload.request;

import jakarta.validation.constraints.NotBlank;

public class ScanRequest {
    @NotBlank
    private String method; // BIOMETRIC, QR_CODE, BARCODE

    @NotBlank
    private String data; // The string content scanned

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }
}
