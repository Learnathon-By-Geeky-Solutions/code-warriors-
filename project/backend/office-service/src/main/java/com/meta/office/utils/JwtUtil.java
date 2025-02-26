package com.meta.office.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class JwtUtil {

    public String getUserIdFromToken() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            String token = extractToken(request);

            if (token == null) {
//                System.out.println("The token is null");
                return null;
            }

            // Use Auth0 JWT library to decode the token without verification
            DecodedJWT jwt = JWT.decode(token);
            String subject = jwt.getSubject();
//            System.out.println("Extracted subject: " + subject);
            return subject;

        } catch (Exception e) {
//            System.out.println("Error decoding token: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private static String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
//        System.out.println("The bearer token is: " + bearerToken);
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
//            System.out.println("Returning token from extractToken:" + token);
            return token;
        }
//        System.out.println("Returning null");
        return null;
    }
}