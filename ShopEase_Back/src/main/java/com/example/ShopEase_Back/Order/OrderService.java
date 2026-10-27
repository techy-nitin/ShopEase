package com.example.ShopEase_Back.Order;
import com.example.ShopEase_Back.Payment.PaymentEntity;
import com.example.ShopEase_Back.Cart.CartEntity;
import com.example.ShopEase_Back.Cart.CartRepo;
import com.example.ShopEase_Back.ProductData.ImageRepo;
import com.example.ShopEase_Back.ProductData.ProductEntity;
import com.example.ShopEase_Back.ProductData.ProductImage;
import com.example.ShopEase_Back.ProductData.ProductRepo;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.ShopEase_Back.Payment.PaymentRepo;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrdersRepo ordersRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private ImageRepo imageRepo;

    @Autowired
    private PaymentRepo paymentRepo;
    @Transactional
    public OrderEntity placeOrder(ProductOrderRequest request) {
        if (request.getBuyerId() == null) {
            throw new RuntimeException("buyerId is required");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order items are required");
        }

        if (isBlank(request.getFullName()) ||
                isBlank(request.getPhone()) ||
                isBlank(request.getAddress()) ||
                isBlank(request.getCity()) ||
                isBlank(request.getState()) ||
                isBlank(request.getPincode()) ||
                isBlank(request.getPaymentMethod())) {
            throw new RuntimeException("Delivery details are required");
        }

        OrderEntity order = new OrderEntity();
        order.setBuyerId(request.getBuyerId());
        order.setTotalAmount(request.getTotalAmount());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PLACED");

        OrderEntity savedOrder = ordersRepo.save(order);

        for (OrderItemRequest item : request.getItems()) {
            ProductEntity product = productRepo.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Invalid quantity");
            }

            if (product.getStock() < item.getQuantity()) {
                throw new RuntimeException(
                        "Only " + product.getStock() + " items left for product: " + product.getName()
                );
            }

            product.setStock(product.getStock() - item.getQuantity());
            productRepo.save(product);

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrderId(savedOrder.getId());
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getPrice());

            orderItemRepo.save(orderItem);
        }

        List<OrderItemEntity> savedItems = orderItemRepo.findByOrderId(savedOrder.getId());

        String base64Invoice = generateInvoicePDF(savedOrder, savedItems, request);
        if (base64Invoice == null || base64Invoice.isBlank()) {
            throw new RuntimeException("Invoice generation failed");
        }

        savedOrder.setPdfInvoice(base64Invoice);
        ordersRepo.save(savedOrder);

        List<CartEntity> cartItems = cartRepo.findByUserId(request.getBuyerId());
        cartRepo.deleteAll(cartItems);
        PaymentEntity payment = new PaymentEntity();
        payment.setOrderId(savedOrder.getId());
        payment.setAmount(savedOrder.getTotalAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus("PENDING");
        payment.setCreatedAt(LocalDateTime.now());

        paymentRepo.save(payment);
        return savedOrder;
    }

    private String generateInvoicePDF(OrderEntity order, List<OrderItemEntity> items, ProductOrderRequest request) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            document.setMargins(30, 30, 30, 30);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

            Paragraph companyName = new Paragraph("SHOP EASE")
                    .setBold()
                    .setFontSize(24);

            Paragraph invoiceTitle = new Paragraph("INVOICE / ORDER RECEIPT")
                    .setFontSize(11);

            document.add(companyName);
            document.add(invoiceTitle);
            document.add(new Paragraph(" "));

            Table infoTable = new Table(new float[]{1, 1});
            infoTable.setWidth(UnitValue.createPercentValue(100));

            infoTable.addCell(new Cell()
                    .add(new Paragraph("Bill To / Shipping Details").setBold().setFontSize(12))
                    .add(new Paragraph("Buyer ID: " + order.getBuyerId()).setFontSize(11))
                    .add(new Paragraph("Full Name: " + safe(request.getFullName())).setFontSize(11))
                    .add(new Paragraph("Phone: " + safe(request.getPhone())).setFontSize(11))
                    .add(new Paragraph("Address: " + safe(request.getAddress())).setFontSize(11))
                    .add(new Paragraph("City: " + safe(request.getCity())).setFontSize(11))
                    .add(new Paragraph("State: " + safe(request.getState())).setFontSize(11))
                    .add(new Paragraph("Pincode: " + safe(request.getPincode())).setFontSize(11))
                    .add(new Paragraph("Payment Method: " + safe(request.getPaymentMethod())).setFontSize(11))
                    .setPadding(10));

            infoTable.addCell(new Cell()
                    .add(new Paragraph("Invoice Details").setBold().setFontSize(12))
                    .add(new Paragraph("Invoice No: INV-" + order.getId()).setFontSize(11))
                    .add(new Paragraph("Order ID: " + order.getId()).setFontSize(11))
                    .add(new Paragraph("Order Date: " + order.getOrderDate().format(formatter)).setFontSize(11))
                    .add(new Paragraph("Status: " + order.getStatus()).setFontSize(11))
                    .setPadding(10));

            document.add(infoTable);
            document.add(new Paragraph(" "));

            Table table = new Table(UnitValue.createPercentArray(new float[]{12, 40, 10, 18, 20}));
            table.setWidth(UnitValue.createPercentValue(100));

            table.addHeaderCell(new Cell().add(new Paragraph("Product ID").setBold()).setPadding(8));
            table.addHeaderCell(new Cell().add(new Paragraph("Product Name").setBold()).setPadding(8));
            table.addHeaderCell(new Cell().add(new Paragraph("Qty").setBold()).setPadding(8));
            table.addHeaderCell(new Cell().add(new Paragraph("Unit Price").setBold()).setPadding(8));
            table.addHeaderCell(new Cell().add(new Paragraph("Total").setBold()).setPadding(8));

            double grandTotal = 0.0;

            for (OrderItemEntity item : items) {
                String productName = "Product";
                double unitPrice = item.getPrice() != null ? item.getPrice() : 0.0;
                int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                double lineTotal = unitPrice * qty;

                grandTotal += lineTotal;

                if (item.getProductId() != null) {
                    Optional<ProductEntity> productOpt = productRepo.findById(item.getProductId());
                    if (productOpt.isPresent()) {
                        productName = productOpt.get().getName();
                    }
                }

                table.addCell(new Cell()
                        .add(new Paragraph(String.valueOf(item.getProductId())))
                        .setPadding(8));

                table.addCell(new Cell()
                        .add(new Paragraph(productName))
                        .setPadding(8));

                table.addCell(new Cell()
                        .add(new Paragraph(String.valueOf(qty)).setTextAlignment(TextAlignment.CENTER))
                        .setPadding(8));

                table.addCell(new Cell()
                        .add(new Paragraph("₹" + String.format("%.2f", unitPrice)))
                        .setPadding(8));

                table.addCell(new Cell()
                        .add(new Paragraph("₹" + String.format("%.2f", lineTotal)))
                        .setPadding(8));
            }

            document.add(table);
            document.add(new Paragraph(" "));

            Table totalTable = new Table(new float[]{70, 30});
            totalTable.setWidth(UnitValue.createPercentValue(100));

            totalTable.addCell(new Cell()
                    .add(new Paragraph("Payment Summary").setBold().setFontSize(12))
                    .add(new Paragraph("All prices are inclusive of applicable taxes.").setFontSize(10))
                    .setPadding(10));

            totalTable.addCell(new Cell()
                    .add(new Paragraph("Grand Total: ₹" + String.format("%.2f", grandTotal))
                            .setBold()
                            .setFontSize(14)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .setPadding(10));

            document.add(totalTable);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Thank you for shopping with Shop Ease!")
                    .setBold()
                    .setFontSize(12));

            document.add(new Paragraph("This is a computer-generated invoice and does not require a signature.")
                    .setFontSize(10));

            document.add(new Paragraph("For support, contact Shop Ease customer care.")
                    .setFontSize(10));

            document.close();

            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private boolean isLikelyBase64(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        if (value.length() < 100) {
            return false;
        }

        try {
            Base64.getDecoder().decode(value);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "N/A" : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public List<OrderEntity> getOrdersByBuyer(Integer buyerId) {
        return ordersRepo.findByBuyerId(buyerId);
    }

    public OrderEntity getOrder(Integer orderId) {
        return ordersRepo.findById(orderId).orElse(null);
    }

    public OrderEntity confirmOrder(Integer orderId) {
        OrderEntity order = ordersRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"PLACED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order cannot be confirmed");
        }

        order.setStatus("CONFIRMED");
        return ordersRepo.save(order);
    }

    public OrderEntity shipOrder(Integer orderId) {
        OrderEntity order = ordersRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"CONFIRMED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order must be confirmed first");
        }

        order.setStatus("SHIPPED");
        return ordersRepo.save(order);
    }

    public OrderEntity outForDelivery(Integer orderId) {
        OrderEntity order = ordersRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"SHIPPED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order must be shipped first");
        }

        order.setStatus("OUT_FOR_DELIVERY");
        return ordersRepo.save(order);
    }

    @Transactional
    public OrderEntity deliverOrder(Integer orderId) {
        OrderEntity order = ordersRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"OUT_FOR_DELIVERY".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order not out for delivery");
        }

        order.setStatus("DELIVERED");
        OrderEntity savedOrder = ordersRepo.save(order);

        PaymentEntity payment = paymentRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setPaymentStatus("SUCCESS");
        payment.setPaidAt(LocalDateTime.now());
        paymentRepo.save(payment);

        return savedOrder;
    }

    @Transactional
    public OrderEntity cancelOrder(Integer orderId) {
        OrderEntity order = ordersRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("SHIPPED".equalsIgnoreCase(order.getStatus())
                || "OUT_FOR_DELIVERY".equalsIgnoreCase(order.getStatus())
                || "DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order cannot be cancelled");
        }

        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            return order;
        }

        List<OrderItemEntity> items = orderItemRepo.findByOrderId(orderId);

        for (OrderItemEntity item : items) {
            ProductEntity product = productRepo.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            int qty = item.getQuantity() != null ? item.getQuantity() : 0;
            product.setStock(product.getStock() + qty);
            productRepo.save(product);
        }

        order.setStatus("CANCELLED");
        PaymentEntity payment = paymentRepo.findByOrderId(orderId).orElse(null);
        if (payment != null) {
            payment.setPaymentStatus("CANCELLED");
            paymentRepo.save(payment);
        }
        return ordersRepo.save(order);
    }

    public List<OrderSummaryDto> getOrderSummaryByBuyer(Integer buyerId) {
        List<Object[]> orders = ordersRepo.findOrderSummaryWithoutInvoice(buyerId);
        List<OrderSummaryDto> result = new java.util.ArrayList<>();

        for (Object[] row : orders) {
            Integer orderId = ((Number) row[0]).intValue();
            Integer orderBuyerId = ((Number) row[1]).intValue();
            java.time.LocalDateTime orderDate = (java.time.LocalDateTime) row[2];
            Double totalAmount = ((Number) row[3]).doubleValue();
            String orderStatus = (String) row[4];

            List<OrderItemEntity> items = orderItemRepo.findByOrderId(orderId);
            if (items == null || items.isEmpty()) {
                continue;
            }

            for (OrderItemEntity item : items) {
                OrderSummaryDto dto = new OrderSummaryDto();
                dto.setId(orderId);
                dto.setBuyerId(orderBuyerId);
                dto.setOrderDate(orderDate);
                dto.setTotalAmount(totalAmount);
                dto.setStatus(orderStatus);

                dto.setOrderItemId(item.getId());
                dto.setProductId(item.getProductId());
                dto.setQuantity(item.getQuantity());

                if (item.getProductId() != null) {
                    productRepo.findById(item.getProductId()).ifPresent(product -> {
                        dto.setProductName(product.getName());
                    });

                    List<ProductImage> images = imageRepo.findByProductId(item.getProductId());
                    if (images != null && !images.isEmpty()) {
                        dto.setProductImage(images.get(0).getImageUrl());
                    }
                }

                result.add(dto);
            }
        }

        return result;
    }

    @Transactional
    public byte[] getInvoicePdfBytes(Integer orderId) {
        OrderEntity order = ordersRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String pdfInvoice = order.getPdfInvoice();

        if (!isLikelyBase64(pdfInvoice)) {
            List<OrderItemEntity> items = orderItemRepo.findByOrderId(orderId);

            ProductOrderRequest request = new ProductOrderRequest();
            String base64Invoice = generateInvoicePDF(order, items, request);

            if (base64Invoice == null || base64Invoice.isBlank()) {
                throw new RuntimeException("Invoice generation failed");
            }

            order.setPdfInvoice(base64Invoice);
            ordersRepo.save(order);

            pdfInvoice = base64Invoice;
        }

        try {
            return Base64.getDecoder().decode(pdfInvoice);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Stored invoice is invalid");
        }
    }
}