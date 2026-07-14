package com.lastmile.deliverytracker.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Springdoc-OpenAPI configuration for the DeliveryTracker API.
 *
 * Registers:
 *  - Project metadata (title, version, description, contact, license)
 *  - JWT Bearer authentication scheme (applied globally to all secured endpoints)
 *  - Server definitions (local dev)
 *
 * Swagger UI:  http://localhost:8080/swagger-ui.html
 * OpenAPI doc: http://localhost:8080/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI deliveryTrackerOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(localServer()))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME_NAME, jwtBearerScheme()));
    }

    // ── Project metadata ──────────────────────────────────────────

    private Info apiInfo() {
        return new Info()
                .title("DeliveryTracker API")
                .version("v1")
                .description("""
                        **Enterprise Last Mile Delivery Platform**
                        
                        Inspired by Delhivery, DeliveryTracker provides a complete REST API for:
                        - 📦 Shipment lifecycle management
                        - 🗺️ Real-time tracking & status updates
                        - 💰 Dynamic pricing via zone-based rate cards
                        - 🚴 Intelligent delivery agent assignment
                        - 🔔 In-app notification inbox
                        - 🛡️ Role-based access (ADMIN, CUSTOMER, AGENT)
                        
                        **Authentication**: All endpoints (except `/api/v1/auth/**`) require a\s
                        JWT Bearer token obtained from the `/api/v1/auth/login` endpoint.
                        """)
                .contact(new Contact()
                        .name("DeliveryTracker Team")
                        .email("support@deliverytracker.io"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }

    // ── Server definitions ────────────────────────────────────────

    private Server localServer() {
        return new Server()
                .url("http://localhost:8080")
                .description("Local Development Server");
    }

    // ── JWT Bearer security scheme ────────────────────────────────

    /**
     * Registers the HTTP Bearer authentication scheme.
     * Swagger UI will render an "Authorize" button that accepts a raw JWT token.
     * The token is sent as:  Authorization: Bearer <token>
     */
    private SecurityScheme jwtBearerScheme() {
        return new SecurityScheme()
                .name(BEARER_SCHEME_NAME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Enter your JWT token (without the 'Bearer ' prefix).");
    }
}
