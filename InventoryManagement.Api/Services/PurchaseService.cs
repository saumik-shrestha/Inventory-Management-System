using InventoryManagement.Api.Data;
using InventoryManagement.Api.DTOs;
using InventoryManagement.Api.Models;
using InventoryManagement.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Services;

public class PurchaseService
{
    private readonly PurchaseRepository _purchaseRepository;
    private readonly ApplicationDbContext _context;

    public PurchaseService(
        PurchaseRepository purchaseRepository,
        ApplicationDbContext context)
    {
        _purchaseRepository = purchaseRepository;
        _context = context;
    }


    // ==========================================
    // GET ALL PURCHASES
    // ==========================================

    public async Task<List<PurchaseResponseDto>> GetAllAsync()
    {
        var purchases = await _purchaseRepository.GetAllAsync();

        return purchases.Select(MapToDto).ToList();
    }


    // ==========================================
    // GET PURCHASE BY ID
    // ==========================================

    public async Task<PurchaseResponseDto?> GetByIdAsync(int id)
    {
        var purchase = await _purchaseRepository.GetByIdAsync(id);

        if (purchase == null)
        {
            return null;
        }

        return MapToDto(purchase);
    }


    // ==========================================
    // CREATE PURCHASE
    // ==========================================

    public async Task<PurchaseResponseDto> CreateAsync(
        CreatePurchaseDto dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
        {
            throw new Exception(
                "At least one equipment item is required.");
        }


        // Check supplier
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == dto.SupplierId);

        if (supplier == null)
        {
            throw new Exception("Supplier not found.");
        }


        // Check all equipment
        foreach (var item in dto.Items)
        {
            if (item.Quantity <= 0)
            {
                throw new Exception(
                    "Quantity must be greater than zero.");
            }

            if (item.UnitCost < 0)
            {
                throw new Exception(
                    "Unit cost cannot be negative.");
            }

            var equipment = await _context.Equipment
                .FirstOrDefaultAsync(
                    e => e.Id == item.EquipmentId);

            if (equipment == null)
            {
                throw new Exception(
                    $"Equipment with ID {item.EquipmentId} not found.");
            }
        }


        // ==========================================
        // GENERATE PURCHASE NUMBER
        // ==========================================

        var purchaseNumber =
            $"PO-{DateTime.UtcNow:yyyyMMddHHmmss}";


        // ==========================================
        // CREATE PURCHASE
        // ==========================================

        var purchase = new Purchase
        {
            PurchaseNumber = purchaseNumber,

            SupplierId = dto.SupplierId,

            InvoiceNumber = dto.InvoiceNumber,

            PurchaseDate = DateTime.SpecifyKind(
                dto.PurchaseDate,
                DateTimeKind.Utc
            ),

            ReceivedDate = dto.ReceivedDate.HasValue
                ? DateTime.SpecifyKind(
                    dto.ReceivedDate.Value,
                    DateTimeKind.Utc
                )
                : null,

            Status = dto.Status,

            Tax = dto.Tax,

            Discount = dto.Discount,

            OtherCharges = dto.OtherCharges,

            Remarks = dto.Remarks,

            CreatedAt = DateTime.UtcNow
        };


        decimal subtotal = 0;


        // ==========================================
        // PURCHASE ITEMS
        // ==========================================

        foreach (var item in dto.Items)
        {
            var equipment = await _context.Equipment
                .FirstAsync(
                    e => e.Id == item.EquipmentId);


            var total =
                item.Quantity * item.UnitCost;


            subtotal += total;


            purchase.Items.Add(
                new PurchaseItem
                {
                    EquipmentId = item.EquipmentId,

                    Quantity = item.Quantity,

                    UnitCost = item.UnitCost,

                    Total = total
                });


            // ======================================
            // UPDATE STOCK
            // ======================================

            if (dto.Status.Equals(
                    "Received",
                    StringComparison.OrdinalIgnoreCase))
            {
                equipment.Quantity += item.Quantity;

                equipment.UpdatedAt =
                    DateTime.UtcNow;


                // ==================================
                // CREATE STOCK TRANSACTION
                // ==================================

                _context.StockTransactions.Add(
                    new StockTransaction
                    {
                        EquipmentId =
                            equipment.Id,

                        TransactionType =
                            "IN",

                        Quantity =
                            item.Quantity,

                        TransactionDate =
                            DateTime.UtcNow,

                        Remarks =
                            $"Purchase {purchaseNumber}"
                    });
            }
        }


        // ==========================================
        // CALCULATE TOTALS
        // ==========================================

        purchase.Subtotal = subtotal;

        purchase.GrandTotal =
            subtotal
            + dto.Tax
            + dto.OtherCharges
            - dto.Discount;


        // ==========================================
        // SAVE PURCHASE
        // ==========================================

        await _purchaseRepository.AddAsync(
            purchase);

        await _purchaseRepository.SaveAsync();


        // ==========================================
        // LOAD RELATIONSHIPS
        // ==========================================

        var savedPurchase =
            await _purchaseRepository.GetByIdAsync(
                purchase.Id);


        if (savedPurchase == null)
        {
            throw new Exception(
                "Purchase was saved but could not be retrieved.");
        }


        return MapToDto(savedPurchase);
    }


    // ==========================================
    // MAP ENTITY → RESPONSE DTO
    // ==========================================

    private static PurchaseResponseDto MapToDto(
        Purchase purchase)
    {
        return new PurchaseResponseDto
        {
            Id = purchase.Id,

            PurchaseNumber =
                purchase.PurchaseNumber,

            SupplierId =
                purchase.SupplierId,

            SupplierName =
                purchase.Supplier?.Name ?? string.Empty,

            InvoiceNumber =
                purchase.InvoiceNumber,

            PurchaseDate =
                purchase.PurchaseDate,

            ReceivedDate =
                purchase.ReceivedDate,

            Status =
                purchase.Status,

            Subtotal =
                purchase.Subtotal,

            Tax =
                purchase.Tax,

            Discount =
                purchase.Discount,

            OtherCharges =
                purchase.OtherCharges,

            GrandTotal =
                purchase.GrandTotal,

            Remarks =
                purchase.Remarks,

            CreatedAt =
                purchase.CreatedAt,

            Items =
                purchase.Items.Select(item =>
                    new PurchaseItemResponseDto
                    {
                        Id = item.Id,

                        EquipmentId =
                            item.EquipmentId,

                        EquipmentName =
                            item.Equipment?.Name
                            ?? string.Empty,

                        EquipmentCode =
                            item.Equipment?.EquipmentCode
                            ?? string.Empty,

                        Quantity =
                            item.Quantity,

                        UnitCost =
                            item.UnitCost,

                        Total =
                            item.Total
                    }).ToList()
        };
    }
}