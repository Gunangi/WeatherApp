package com.example.weatherapp.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // In a real application, you would fetch user from a database
        if ("user".equals(username)) {
            return User.builder()
                    .username("user")
                    .password("{bcrypt}$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW") // encoded "password"
                    .roles("USER")
                    .build();
        } else if ("admin".equals(username)) {
            return User.builder()
                    .username("admin")
                    .password("{bcrypt}$2a$10$zXPbYQDNum0.y/SxBD/z8OQnMA36vyDq.OahCNNEgBzTbu1Ye0WZi") // encoded "adminpass"
                    .roles("ADMIN")
                    .build();
        }

        throw new UsernameNotFoundException("User not found");
    }
}
