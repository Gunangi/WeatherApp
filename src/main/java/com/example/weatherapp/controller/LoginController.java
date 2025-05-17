package com.example.weatherapp.controller;

import com.example.weatherapp.model.User;
import com.example.weatherapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final UserService userService;

    @Autowired
    public LoginController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest,
                                                     HttpServletRequest request) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        Optional<User> userOptional = Optional.ofNullable(userService.authenticate(username, password));

        Map<String, Object> response = new HashMap<>();

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Store in session
            request.getSession().setAttribute("userId", user.getId());
            request.getSession().setAttribute("username", user.getUsername());

            // Build response
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid username or password");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        // Invalidate session
        request.getSession().invalidate();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logout successful");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkLoginStatus(HttpServletRequest request) {
        String username = (String) request.getSession().getAttribute("username");
        Map<String, Object> response = new HashMap<>();

        if (username != null) {
            Optional<User> userOptional = userService.findByUsername(username);

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                response.put("success", true);
                response.put("message", "User is logged in");
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());

                return ResponseEntity.ok(response);
            }
        }

        response.put("success", false);
        response.put("message", "User is not logged in");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        Optional<User> registeredUserOptional = Optional.ofNullable(userService.registerUser(user));
        Map<String, Object> response = new HashMap<>();

        if (registeredUserOptional.isPresent()) {
            User registeredUser = registeredUserOptional.get();
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("username", registeredUser.getUsername());
            response.put("email", registeredUser.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            response.put("success", false);
            response.put("message", "Username or email already exists");

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}