package com.lastmile.deliverytracker.common.exception;

import com.lastmile.deliverytracker.common.constants.ErrorMessages;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Centralised exception handling for the entire DeliveryTracker platform.
 *
 * Precedence (most specific → least specific):
 *
 *  1. MethodArgumentNotValidException     → 400  (Bean Validation on @RequestBody)
 *  2. ConstraintViolationException        → 400  (Bean Validation on @PathVariable / @RequestParam)
 *  3. ShipmentNotFoundException           → 404  (via ResourceNotFoundException)
 *  4. TrackingNotFoundException           → 404  (via ResourceNotFoundException)
 *  5. NotificationNotFoundException       → 404  (via ResourceNotFoundException)
 *  6. AssignmentNotFoundException         → 404  (via ResourceNotFoundException)
 *  7. RateCardNotFoundException           → 404  (via ResourceNotFoundException)
 *  8. ResourceNotFoundException           → 404  (catch-all for any 404)
 *  9. BusinessException                   → 422  (or custom status from exception)
 * 10. AccessDeniedException               → 403  (Spring Security — role not permitted)
 * 11. AuthenticationException             → 401  (Spring Security — invalid/missing token)
 * 12. Exception                           → 500  (last-resort safety net)
 *
 * Security note:
 *  - Stack traces are NEVER included in responses.
 *  - Internal error details are logged server-side at ERROR level.
 *  - Generic "unexpected error" message is returned to the client for 500s.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ================================================================
    // 1. Bean Validation — @RequestBody fields (@Valid)
    // Returns 400 with a field-wise breakdown of all failing constraints.
    // ================================================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        List<ApiError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> ApiError.of(fe.getField(), fe.getDefaultMessage()))
                .toList();

        log.info("Validation failed for request [{}]: {} field error(s)", request.getRequestURI(), fieldErrors.size());

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                ErrorMessages.VALIDATION_FAILED,
                request.getRequestURI(),
                fieldErrors
        );
    }

    // ================================================================
    // 2. Bean Validation — @PathVariable / @RequestParam / @RequestHeader
    // Returns 400 with field-wise constraint details.
    // ================================================================
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request) {

        List<ApiError> fieldErrors = ex.getConstraintViolations()
                .stream()
                .map(cv -> {
                    // Extract the simple property name from the full path (e.g. "method.param" → "param")
                    String field = cv.getPropertyPath().toString();
                    int dot = field.lastIndexOf('.');
                    if (dot >= 0) {
                        field = field.substring(dot + 1);
                    }
                    return ApiError.of(field, cv.getMessage());
                })
                .toList();

        log.info("Constraint violation for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                ErrorMessages.CONSTRAINT_VIOLATED,
                request.getRequestURI(),
                fieldErrors
        );
    }

    // ================================================================
    // 3-8. ResourceNotFoundException hierarchy — 404
    // A single handler catches all domain-specific not-found exceptions
    // because they all extend ResourceNotFoundException.
    //
    // Covers:
    //   ShipmentNotFoundException, TrackingNotFoundException,
    //   NotificationNotFoundException, AssignmentNotFoundException,
    //   RateCardNotFoundException, AdminUserNotFoundException
    // ================================================================
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request) {

        log.info("Resource not found [{}]: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request.getRequestURI(),
                null
        );
    }

    // ================================================================
    // 9. BusinessException — 422 Unprocessable Entity (default)
    // Domain rule violations that are not "not found" errors.
    // The exception carries its own HttpStatus (may be 409 Conflict etc.)
    // ================================================================
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex,
            HttpServletRequest request) {

        log.info("Business rule violation [{}]: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse(
                ex.getStatus(),
                ex.getMessage(),
                request.getRequestURI(),
                null
        );
    }

    // ================================================================
    // 10. IllegalArgumentException — 409 Conflict
    // Thrown by service layer for domain-level argument violations,
    // e.g. "Email is already registered".
    // Returns 409 so clients can distinguish from validation errors (400).
    // ================================================================
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        log.info("Illegal argument for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                request.getRequestURI(),
                null
        );
    }

    // ================================================================
    // 11. IllegalStateException — 422 Unprocessable Entity
    // Thrown by service layer for invalid state transitions,
    // e.g. "Shipment in status DELIVERED cannot be cancelled".
    // ================================================================
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(
            IllegalStateException ex,
            HttpServletRequest request) {

        log.info("Illegal state for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse(
                HttpStatus.UNPROCESSABLE_ENTITY,
                ex.getMessage(),
                request.getRequestURI(),
                null
        );
    }

    // ================================================================
    // 12. AccessDeniedException — 403 Forbidden
    // Thrown by Spring Security's @PreAuthorize when the authenticated
    // user does not have the required role/permission.
    // ================================================================
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {

        log.info("Access denied for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse(
                HttpStatus.FORBIDDEN,
                ErrorMessages.ACCESS_DENIED,
                request.getRequestURI(),
                null
        );
    }

    // ================================================================
    // 13. AuthenticationException — 401 Unauthorised
    // Thrown by Spring Security when a request carries an invalid,
    // expired, or missing JWT token.
    // ================================================================
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex,
            HttpServletRequest request) {

        log.info("Authentication failure for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                ErrorMessages.AUTHENTICATION_FAILED,
                request.getRequestURI(),
                null
        );
    }

    // ================================================================
    // 14. Exception — 500 Internal Server Error (last-resort safety net)
    // Catches any unhandled exception. Full stack trace is logged
    // server-side but NEVER sent to the client.
    // ================================================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        // Log full stack trace internally — client receives a generic message only
        log.error("Unhandled exception for request [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ErrorMessages.INTERNAL_SERVER_ERROR,
                request.getRequestURI(),
                null
        );
    }

    // ================================================================
    // Private builder helper — avoids duplication across all handlers
    // ================================================================
    private ResponseEntity<ErrorResponse> buildResponse(
            HttpStatus status,
            String message,
            String path,
            List<ApiError> fieldErrors) {

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .fieldErrors(fieldErrors)
                .build();

        return ResponseEntity.status(status).body(body);
    }
}
