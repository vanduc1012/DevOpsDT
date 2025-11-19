package com.cafe.config;

import com.cafe.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Tắt CSRF vì sử dụng JWT stateless authentication
            .csrf(csrf -> csrf.disable())
            
            // Cấu hình CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Cấu hình authorization rules
            .authorizeHttpRequests(auth -> auth
                // ===== PUBLIC STATIC FILES =====
                .requestMatchers("/", "/index.html", "/home", "/favicon.ico").permitAll()
                .requestMatchers("/static/**", "/assets/**").permitAll()
                
                // ===== AUTHENTICATION ENDPOINTS (PUBLIC) =====
                .requestMatchers("/api/auth/**").permitAll()
                
                // ===== HEALTH CHECK & API INFO (PUBLIC) =====
                .requestMatchers(HttpMethod.GET, "/api").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // ===== PUBLIC GET APIs (Khách hàng xem menu, bàn) =====
                .requestMatchers(HttpMethod.GET, "/api/menu/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tables/**").permitAll()
                
                // ===== ADMIN ONLY ENDPOINTS =====
                // Reports - chỉ Admin
                .requestMatchers("/api/reports/**").hasRole("ADMIN")
                
                // Menu Management - Admin only
                .requestMatchers(HttpMethod.POST, "/api/menu/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/menu/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/menu/**").hasRole("ADMIN")
                
                // Table Management - Admin only
                .requestMatchers(HttpMethod.POST, "/api/tables/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/tables/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/tables/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/tables/**").hasRole("ADMIN")
                
                // Order Management - Admin only
                .requestMatchers(HttpMethod.GET, "/api/orders").hasRole("ADMIN") // GET all orders - Admin only
                .requestMatchers(HttpMethod.PATCH, "/api/orders/*/status").hasRole("ADMIN") // Update order status
                .requestMatchers(HttpMethod.PATCH, "/api/orders/*/transfer-table").hasRole("ADMIN") // Transfer table
                
                // ===== AUTHENTICATED USERS (USER & ADMIN) =====
                // User orders - authenticated users
                .requestMatchers(HttpMethod.GET, "/api/orders/my-orders").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/orders/table/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/orders/{id}").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/orders").authenticated()
                
                // ===== DEFAULT: REQUIRE AUTHENTICATION =====
                .anyRequest().authenticated()
            )
            
            // Stateless session - không lưu session vì dùng JWT
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Xử lý exception khi access denied
            .exceptionHandling(exceptions -> exceptions
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    try {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json;charset=UTF-8");
                        response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
                        response.setHeader("Access-Control-Allow-Credentials", "true");
                        response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"Bạn không có quyền truy cập tài nguyên này\",\"status\":403}");
                        response.getWriter().flush();
                    } catch (Exception e) {
                        logger.error("Error writing access denied response", e);
                    }
                })
                .authenticationEntryPoint((request, response, authException) -> {
                    try {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json;charset=UTF-8");
                        response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
                        response.setHeader("Access-Control-Allow-Credentials", "true");
                        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Vui lòng đăng nhập để truy cập\",\"status\":401}");
                        response.getWriter().flush();
                    } catch (Exception e) {
                        logger.error("Error writing authentication entry point response", e);
                    }
                })
            )
            
            // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Cấu hình CORS (Cross-Origin Resource Sharing)
     * Cho phép frontend từ các origin cụ thể gọi API
     * 
     * Lưu ý: Khi setAllowCredentials(true), không thể dùng "*" cho allowedOrigins
     * Phải chỉ định cụ thể từng origin
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Danh sách các origin được phép (không thể dùng "*" khi allowCredentials = true)
        List<String> allowedOrigins = Arrays.asList(
            "http://localhost:3000",           // Frontend local development
            "http://localhost:3001",           // Frontend alternative port
            "http://localhost:8080",           // Backend direct access
            "http://127.0.0.1:3000",           // Frontend localhost alternative
            "http://127.0.0.1:3001",           // Frontend localhost alternative port
            "http://127.0.0.1:8080",           // Backend direct access alternative
            "https://devops-1-9r3z.onrender.com" // Production frontend
        );
        configuration.setAllowedOrigins(allowedOrigins);
        
        // Các HTTP methods được phép
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // Tất cả headers được phép (bao gồm Authorization header cho JWT)
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Expose Authorization header để frontend có thể đọc
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        // Cho phép gửi credentials (cookies, authorization headers)
        // Cần thiết cho JWT token authentication
        configuration.setAllowCredentials(true);
        
        // Cache preflight requests trong 1 giờ
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Password encoder - sử dụng BCrypt để mã hóa password
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication Manager - quản lý authentication
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
