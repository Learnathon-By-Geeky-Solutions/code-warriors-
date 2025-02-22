package com.meta.user.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.*;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI productServiceAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Order Service API")
                        .description("This is the REST API for User Service")
                        .version("v0.0.1")
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")
                        )

                )
                .tags(List.of(
                        new Tag().name("User Management").description("Operations related to user management")
//                        new Tag().name("Order Management").description("Operations related to order processing")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                        )
                )
                .security(List.of(new SecurityRequirement().addList("bearerAuth")))
//                .servers(List.of(
//                        new Server().url("https://api.example.com").description("Production Server"),
//                        new Server().url("https://staging.api.example.com").description("Staging Server")
//                ))
                .externalDocs(new ExternalDocumentation()
                        .description("You can see the full code here")
                        .url("https://github.com/SaidurIUT/meta/tree/main/project/backend/user-service")
                )
                .extensions(Map.of(
                        "x-company-name", "MetaChain",
                        "x-department", "Engineering"
                ));
    }
}
