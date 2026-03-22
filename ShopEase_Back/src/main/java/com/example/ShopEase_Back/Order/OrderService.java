package com.example.ShopEase_Back.Order;

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

    public OrderEntity placeOrder(ProductOrderRequest request) {
        if (request.getBuyerId() == null) {
            throw new RuntimeException("buyerId is required");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order items are required");
        }

        OrderEntity order = new OrderEntity();
        order.setBuyerId(request.getBuyerId());
        order.setTotalAmount(request.getTotalAmount());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PLACED");

        OrderEntity savedOrder = ordersRepo.save(order);

        for (OrderItemRequest item : request.getItems()) {
            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrderId(savedOrder.getId());
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getPrice());
            orderItemRepo.save(orderItem);
        }

        List<OrderItemEntity> savedItems = orderItemRepo.findByOrderId(savedOrder.getId());

        String base64Invoice = generateInvoicePDF(savedOrder, savedItems);
        if (base64Invoice == null || base64Invoice.isBlank()) {
            throw new RuntimeException("Invoice generation failed");
        }

        savedOrder.setPdfInvoice(base64Invoice);
        ordersRepo.save(savedOrder);

        List<CartEntity> cartItems = cartRepo.findByUserId(request.getBuyerId());
        cartRepo.deleteAll(cartItems);

        return savedOrder;
    }

    private String generateInvoicePDF(OrderEntity order, List<OrderItemEntity> items) {
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
                    .add(new Paragraph("Bill To").setBold().setFontSize(12))
                    .add(new Paragraph("Buyer ID: " + order.getBuyerId()).setFontSize(11))
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

    public OrderEntity deliverOrder(Integer orderId) {
        OrderEntity order = ordersRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"OUT_FOR_DELIVERY".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order not out for delivery");
        }

        order.setStatus("DELIVERED");
        return ordersRepo.save(order);
    }

    public OrderEntity cancelOrder(Integer orderId) {
        OrderEntity order = ordersRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("SHIPPED".equalsIgnoreCase(order.getStatus())
                || "OUT_FOR_DELIVERY".equalsIgnoreCase(order.getStatus())
                || "DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order cannot be cancelled");
        }

        order.setStatus("CANCELLED");
        return ordersRepo.save(order);
    }

    public List<OrderSummaryDto> getOrderSummaryByBuyer(Integer buyerId) {
        List<Object[]> orders = ordersRepo.findOrderSummaryWithoutInvoice(buyerId);

        return orders.stream().map(row -> {
            OrderSummaryDto dto = new OrderSummaryDto();

            dto.setId(((Number) row[0]).intValue());
            dto.setBuyerId(((Number) row[1]).intValue());
            dto.setOrderDate((java.time.LocalDateTime) row[2]);
            dto.setTotalAmount(((Number) row[3]).doubleValue());
            dto.setStatus((String) row[4]);

            List<OrderItemEntity> items = orderItemRepo.findByOrderId(dto.getId());

            if (items != null && !items.isEmpty()) {
                OrderItemEntity firstItem = items.get(0);

                dto.setOrderItemId(firstItem.getId());
                dto.setProductId(firstItem.getProductId());
                dto.setQuantity(firstItem.getQuantity());

                if (firstItem.getProductId() != null) {
                    productRepo.findById(firstItem.getProductId()).ifPresent(product -> {
                        dto.setProductName(product.getName());
                    });

                    List<ProductImage> images = imageRepo.findByProductId(firstItem.getProductId());
                    if (images != null && !images.isEmpty()) {
                        dto.setProductImage(images.get(0).getImageUrl());
                    }
                }
            }

            return dto;
        }).toList();
    }

    @Transactional
    public byte[] getInvoicePdfBytes(Integer orderId) {
        OrderEntity order = ordersRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String pdfInvoice = order.getPdfInvoice();

        if (!isLikelyBase64(pdfInvoice)) {
            List<OrderItemEntity> items = orderItemRepo.findByOrderId(orderId);

            String base64Invoice = generateInvoicePDF(order, items);
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