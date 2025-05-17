package com.example.weatherapp.controller;

import com.example.weatherapp.model.User;
import com.example.weatherapp.service.UserService;
import com.example.weatherapp.dto.LoginRequest;
import com.example.weatherapp.dto.LoginResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final UserService userService;

    @Autowired
    public LoginController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        // Authenticate user
        User user = userService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());

        if (user != null) {
            // Create session
            session.setAttribute("userId", user.getId());
            session.setAttribute("username", user.getUsername());

            // Return success response
            LoginResponse response = new LoginResponse(
                    true,
                    "Login successful",
                    user.getUsername(),
                    user.getEmail()
            );
            return ResponseEntity.ok(response);
        } else {
            // Return error response
            LoginResponse response = new LoginResponse(
                    false,
                    "Invalid username or password",
                    null,
                    null
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<LoginResponse> logout(HttpSession session) {
        // Invalidate session
        session.invalidate();

        // Return success response
        LoginResponse response = new LoginResponse(
                true,
                "Logout successful",
                null,
                null
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check")
    public ResponseEntity<LoginResponse> checkLoginStatus(HttpSession session) {
        String username = (String) session.getAttribute("username");

        if (username != null) {
            User user = userService.findByUsername(username);

            if (user != null) {
                LoginResponse response = new LoginResponse(
                        true,
                        "User is logged in",
                        user.getUsername(),
                        user.getEmail()
                );
                return ResponseEntity.ok(response);
            }
        }

        // Return not logged in response
        LoginResponse response = new LoginResponse(
                false,
                "User is not logged in",
                null,
                null
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
}


