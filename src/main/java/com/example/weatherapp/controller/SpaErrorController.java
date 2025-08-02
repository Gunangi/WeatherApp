// src/main/java/com/weatherapp/controller/SpaErrorController.java
package com.example.weatherapp.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * A custom error controller to handle 404 Not Found errors.
 * When a request is made for a path that Spring Boot cannot find (like a
 * client-side React route), it will result in a 404 error. This controller
 * intercepts that specific error and forwards the request to the root path ("/"),
 * allowing the React application's index.html to be served and React Router
 * to take control of the routing on the client side.
 */
@Controller
public class SpaErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute("jakarta.servlet.error.status_code");

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());

            // If the error is a 404 Not Found, forward to the root path
            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                return "forward:/index.html";
            }
        }

        // For all other errors, forward to the root path as well,
        // or you can create a dedicated error page.
        return "forward:/index.html";
    }
}