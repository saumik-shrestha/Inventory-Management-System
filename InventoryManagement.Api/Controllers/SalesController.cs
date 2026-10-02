using InventoryManagement.Api.Data;
using InventoryManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SalesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // GET: api/Sales
    // =========================================================

    [HttpGet]
    public async Task<IActionResult> GetSales()
    {
        var sales = await _context.Sales
            .Include(s => s.Customer)
            .Include(s => s.Items)
                .ThenInclude(i => i.Equipment)
            .OrderByDescending(s => s.Id)
            .Select(s => new
            {
                s.Id,
                s.SaleNumber,

                s.CustomerId,

                customerName = s.Customer != null
                    ? s.Customer.Name
                    : null,

                customerPhone = s.Customer != null
                    ? s.Customer.Phone
                    : null,

                s.SaleDate,
                s.Status,
                s.Subtotal,
                s.Tax,
                s.Discount,
                s.GrandTotal,
                s.Remarks,
                s.CreatedAt,

                items = s.Items.Select(i => new
                {
                    i.Id,
                    i.EquipmentId,

                    equipmentName = i.Equipment != null
                        ? i.Equipment.Name
                        : null,

                    equipmentCode = i.Equipment != null
                        ? i.Equipment.EquipmentCode
                        : null,

                    i.Quantity,
                    i.UnitPrice,
                    i.Total
                })
            })
            .ToListAsync();

        return Ok(sales);
    }


    // =========================================================
    // GET: api/Sales/5
    // =========================================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSale(int id)
    {
        var sale = await _context.Sales
            .Include(s => s.Customer)
            .Include(s => s.Items)
                .ThenInclude(i => i.Equipment)
            .Where(s => s.Id == id)
            .Select(s => new
            {
                s.Id,
                s.SaleNumber,

                s.CustomerId,

                customerName = s.Customer != null
                    ? s.Customer.Name
                    : null,

                customerPhone = s.Customer != null
                    ? s.Customer.Phone
                    : null,

                customerEmail = s.Customer != null
                    ? s.Customer.Email
                    : null,

                customerAddress = s.Customer != null
                    ? s.Customer.Address
                    : null,

                s.SaleDate,
                s.Status,
                s.Subtotal,
                s.Tax,
                s.Discount,
                s.GrandTotal,
                s.Remarks,
                s.CreatedAt,

                items = s.Items.Select(i => new
                {
                    i.Id,
                    i.EquipmentId,

                    equipmentName = i.Equipment != null
                        ? i.Equipment.Name
                        : null,

                    equipmentCode = i.Equipment != null
                        ? i.Equipment.EquipmentCode
                        : null,

                    i.Quantity,
                    i.UnitPrice,
                    i.Total
                })
            })
            .FirstOrDefaultAsync();

        if (sale == null)
        {
            return NotFound(new
            {
                message = "Sale not found."
            });
        }

        return Ok(sale);
    }


    // =========================================================
    // POST: api/Sales
    // =========================================================

    [HttpPost]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> CreateSale(
        [FromBody] CreateSaleRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(new
            {
                message = "At least one sale item is required."
            });
        }

        // -----------------------------------------------------
        // Check customer if provided
        // -----------------------------------------------------

        if (request.CustomerId.HasValue)
        {
            var customerExists = await _context.Customers
                .AnyAsync(c => c.Id == request.CustomerId.Value);

            if (!customerExists)
            {
                return BadRequest(new
                {
                    message =
                        $"Customer with ID {request.CustomerId.Value} was not found."
                });
            }
        }


        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            decimal subtotal = 0;

            var saleItems = new List<SaleItem>();


            // -------------------------------------------------
            // Process sale items
            // -------------------------------------------------

            foreach (var item in request.Items)
            {
                if (item.Quantity <= 0)
                {
                    return BadRequest(new
                    {
                        message =
                            "Quantity must be greater than 0."
                    });
                }

                if (item.UnitPrice < 0)
                {
                    return BadRequest(new
                    {
                        message =
                            "Unit price cannot be negative."
                    });
                }


                // Find equipment
                var equipment = await _context.Equipment
                    .FirstOrDefaultAsync(
                        e => e.Id == item.EquipmentId
                    );


                if (equipment == null)
                {
                    return BadRequest(new
                    {
                        message =
                            $"Equipment with ID {item.EquipmentId} was not found."
                    });
                }


                // Check stock
                if (equipment.Quantity < item.Quantity)
                {
                    return BadRequest(new
                    {
                        message =
                            $"Not enough stock for {equipment.Name}. " +
                            $"Available: {equipment.Quantity}, " +
                            $"Requested: {item.Quantity}."
                    });
                }


                // Calculate item total
                var itemTotal =
                    item.Quantity * item.UnitPrice;

                subtotal += itemTotal;


                // Create SaleItem
                saleItems.Add(
                    new SaleItem
                    {
                        EquipmentId = equipment.Id,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        Total = itemTotal
                    }
                );


                // ---------------------------------------------
                // Reduce equipment stock
                // ---------------------------------------------

                equipment.Quantity -= item.Quantity;

                equipment.UpdatedAt =
                    DateTime.UtcNow;


                // ---------------------------------------------
                // Create stock OUT transaction
                // ---------------------------------------------

                _context.StockTransactions.Add(
                    new StockTransaction
                    {
                        EquipmentId = equipment.Id,

                        TransactionType = "OUT",

                        Quantity = item.Quantity,

                        TransactionDate =
                            DateTime.UtcNow,

                        Remarks = "Sale"
                    }
                );
            }


            // -------------------------------------------------
            // Calculate totals
            // -------------------------------------------------

            var tax = request.Tax;

            var discount = request.Discount;

            var grandTotal =
                subtotal +
                tax -
                discount;


            if (grandTotal < 0)
            {
                return BadRequest(new
                {
                    message =
                        "Grand total cannot be negative."
                });
            }


            // -------------------------------------------------
            // Convert SaleDate to UTC
            // -------------------------------------------------

            DateTime saleDate;

            if (request.SaleDate.HasValue)
            {
                saleDate = DateTime.SpecifyKind(
                    request.SaleDate.Value,
                    DateTimeKind.Utc
                );
            }
            else
            {
                saleDate = DateTime.UtcNow;
            }


            // -------------------------------------------------
            // Create Sale
            // -------------------------------------------------

            var sale = new Sale
            {
                SaleNumber =
                    $"SO-{DateTime.UtcNow:yyyyMMddHHmmss}",

                // Customer is optional
                CustomerId =
                    request.CustomerId,

                // IMPORTANT:
                // PostgreSQL timestamp with time zone
                // requires UTC
                SaleDate =
                    saleDate,

                Status =
                    request.Status ??
                    "Completed",

                Subtotal =
                    subtotal,

                Tax =
                    tax,

                Discount =
                    discount,

                GrandTotal =
                    grandTotal,

                Remarks =
                    request.Remarks,

                CreatedAt =
                    DateTime.UtcNow,

                Items =
                    saleItems
            };


            _context.Sales.Add(sale);


            // -------------------------------------------------
            // Save
            // -------------------------------------------------

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();


            // -------------------------------------------------
            // Get created sale with customer and equipment
            // information
            // -------------------------------------------------

            var createdSale =
                await _context.Sales
                    .Include(s => s.Customer)
                    .Include(s => s.Items)
                        .ThenInclude(i => i.Equipment)
                    .Where(s => s.Id == sale.Id)
                    .Select(s => new
                    {
                        s.Id,
                        s.SaleNumber,

                        s.CustomerId,

                        customerName =
                            s.Customer != null
                                ? s.Customer.Name
                                : null,

                        customerPhone =
                            s.Customer != null
                                ? s.Customer.Phone
                                : null,

                        customerEmail =
                            s.Customer != null
                                ? s.Customer.Email
                                : null,

                        customerAddress =
                            s.Customer != null
                                ? s.Customer.Address
                                : null,

                        s.SaleDate,
                        s.Status,
                        s.Subtotal,
                        s.Tax,
                        s.Discount,
                        s.GrandTotal,
                        s.Remarks,
                        s.CreatedAt,

                        items = s.Items.Select(i => new
                        {
                            i.Id,
                            i.EquipmentId,

                            equipmentName =
                                i.Equipment != null
                                    ? i.Equipment.Name
                                    : null,

                            equipmentCode =
                                i.Equipment != null
                                    ? i.Equipment.EquipmentCode
                                    : null,

                            i.Quantity,
                            i.UnitPrice,
                            i.Total
                        })
                    })
                    .FirstAsync();


            return CreatedAtAction(
                nameof(GetSale),
                new
                {
                    id = sale.Id
                },
                createdSale
            );
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            return StatusCode(
                500,
                new
                {
                    message =
                        "Failed to create sale.",

                    error =
                        ex.InnerException?.Message
                        ?? ex.Message
                }
            );
        }
    }
}


// =============================================================
// REQUEST MODELS
// =============================================================

public class CreateSaleRequest
{
    // Customer is optional
    public int? CustomerId { get; set; }

    public DateTime? SaleDate { get; set; }

    public string? Status { get; set; }

    public decimal Tax { get; set; }

    public decimal Discount { get; set; }

    public string? Remarks { get; set; }

    public List<CreateSaleItemRequest> Items { get; set; }
        = new();
}


public class CreateSaleItemRequest
{
    public int EquipmentId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}