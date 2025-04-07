A simple and secure Weather App built with **Spring Boot**, **MongoDB**, and **Spring Security**. This application demonstrates how to consume REST APIs and integrate user authentication using Spring Security.

---

## 🔧 Features

- 🌍 Fetch real-time weather data from OpenWeatherMap API
- 🔐 Secure login and logout with Spring Security
- 📦 No database for users (In-Memory Authentication)
- 🌱 MongoDB integration for saving and extending weather-related data (optional/future scope)
- 🎨 Minimal and responsive frontend using HTML, CSS, and JS

---

## 🚀 Tech Stack

| Layer         | Technology              |
|---------------|--------------------------|
| Backend       | Java, Spring Boot        |
| REST Client   | `RestTemplate`           |
| Security      | Spring Security (In-Memory) |
| Frontend      | HTML, CSS, JavaScript    |
| Database      | MongoDB (extendable)     |
| Build Tool    | Gradle                   |

---

## 🔐 Security Implementation

- Users are authenticated using Spring Security's `InMemoryUserDetailsManager`.
- Only logged-in users can access the weather search functionality.
- Login and logout are handled securely using form-based authentication.

---

## 🌐 REST API Integration

The app fetches weather data from the **OpenWeatherMap API** using a backend call to:
