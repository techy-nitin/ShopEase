package com.example.ShopEase_Back.Location;

public class LocationResponse {
    private String distict;
    private String pincode;
    public LocationResponse(String distict,String pincode){
        this.distict = distict;
        this.pincode = pincode;
    }

    public String getDistict() {
        return distict;
    }

    public void setDistict(String distict) {
        this.distict = distict;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }
}
