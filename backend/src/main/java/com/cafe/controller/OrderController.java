package com.cafe.controller;

import com.cafe.dto.CreateOrderRequest;
import com.cafe.model.Order;
import com.cafe.model.OrderStatus;
import com.cafe.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    @GetMapping("/table/{tableId}")
    public ResponseEntity<List<Order>> getOrdersByTable(@PathVariable String tableId) {
        return ResponseEntity.ok(orderService.getOrdersByTable(tableId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable String id) {
        try {
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Order not found: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create order: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> request) {

        System.out.println("request: " + request);
        System.out.println("id: " + id);
        System.out.println("status: " + request.get("status"));
        
        String statusStr = request.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            return ResponseEntity.badRequest().body("Status is required");
        }

        OrderStatus status;
        try {
            status = OrderStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value. Allowed: PENDING, COMPLETED, CANCELLED");
        }

        try {
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to update order status: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/transfer-table")
    public ResponseEntity<?> transferTable(@PathVariable String id, @RequestBody Map<String, String> request) {
        String newTableId = request.get("newTableId");
        if (newTableId == null || newTableId.isBlank()) {
            return ResponseEntity.badRequest().body("newTableId is required");
        }

        try {
            Order updatedOrder = orderService.transferTable(id, newTableId);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to transfer table: " + e.getMessage());
        }
    }
}
