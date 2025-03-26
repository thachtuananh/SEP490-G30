package com.example.homecleanapi.dtos;

public class ConversationDTO {
    private Integer customer_id;
    private Integer cleaner_id;

    public ConversationDTO() {
    }

    public Integer getCustomer_id() {
        return customer_id;
    }

    public void setCustomer_id(Integer customer_id) {
        this.customer_id = customer_id;
    }

    public Integer getCleaner_id() {
        return cleaner_id;
    }

    public void setCleaner_id(Integer cleaner_id) {
        this.cleaner_id = cleaner_id;
    }
}
