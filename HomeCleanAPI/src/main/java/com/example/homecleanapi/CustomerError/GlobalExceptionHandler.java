package com.example.homecleanapi.CustomerError;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;

import java.util.Collections;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(), 
            ex.getErrorCode(),
            Collections.singletonList(ex.getDetail())
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);  
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse(
            "Internal server error",
            "INTERNAL_SERVER_ERROR",
            Collections.singletonList("An unexpected error occurred, please try again later.")
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
