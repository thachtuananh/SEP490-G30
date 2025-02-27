package com.example.homecleanapi.utils;


import org.apache.commons.io.IOUtils;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.HttpClients;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class ConvertAddressToLatLong {

    public String convertAddressToLatLong(String address) throws IOException {
        String BASE_URL = "https://mapapis.openmap.vn/v1/geocode/forward";
        String API_KEY = "GCqog2pA02tbV9b08wyoT66ZltjU5FvR";
        String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
        String FULL_URL = BASE_URL + "?address=" + encodedAddress + "&apikey=" + API_KEY;
        System.out.println(FULL_URL);
        HttpRequest httpRequest = new HttpGet(FULL_URL);

        HttpClient client = HttpClients.createDefault();

        HttpResponse httpResponse = client.execute((HttpUriRequest) httpRequest);
        String content = IOUtils.toString(httpResponse.getEntity().getContent(), "UTF-8");
        return content;
    }

}
