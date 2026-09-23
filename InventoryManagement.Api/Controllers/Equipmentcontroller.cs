using InventoryManagement.Api.Data;
using InventoryManagement.Api.DTOs;
using InventoryManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquipmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EquipmentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET: api/Equipment
        // ADMIN + STAFF
        // Search + Category + Status + Low Stock
        // =========================================================
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetEquipment(
            string? search = null,
            int? categoryId = null,
            string? status = null,
            bool? lowStock = null)
        {
            var query = _context.Equipment
                .AsNoTracking()
                .Include(e => e.Category)
                .Include(e => e.Supplier)
                .AsQueryable();

            // Search by equipment code, name, brand or model
            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();

                query = query.Where(e =>
                    e.EquipmentCode.ToLower().Contains(search) ||
                    e.Name.ToLower().Contains(search) ||
                    (e.Brand != null &&
                     e.Brand.ToLower().Contains(search)) ||
                    (e.Model != null &&
                     e.Model.ToLower().Contains(search)));
            }

            // Filter by category
            if (categoryId.HasValue)
            {
                query = query.Where(e =>
                    e.CategoryId == categoryId.Value);
            }

            // Filter by status
            if (!string.IsNullOrWhiteSpace(status))
            {
                status = status.Trim().ToLower();

                query = query.Where(e =>
                    e.Status.ToLower() == status);
            }

            // Filter low-stock equipment
            if (lowStock == true)
            {
                query = query.Where(e =>
                    e.Quantity <= e.MinimumStock);
            }

            var equipment = await query
                .OrderBy(e => e.Name)
                .Select(e => new EquipmentListDto
                {
                    Id = e.Id,
                    EquipmentCode = e.EquipmentCode,
                    Name = e.Name,

                    CategoryId = e.CategoryId,

                    CategoryName = e.Category != null
                        ? e.Category.Name
                        : null,

                    Brand = e.Brand,
                    Model = e.Model,
                    SerialNumber = e.SerialNumber,

                    SupplierId = e.SupplierId,

                    SupplierName = e.Supplier != null
                        ? e.Supplier.Name
                        : null,

                    Quantity = e.Quantity,
                    UnitPrice = e.UnitPrice,
                    MinimumStock = e.MinimumStock,
                    PurchaseDate = e.PurchaseDate,

                    Status = e.Status,
                    Description = e.Description,

                    CreatedAt = e.CreatedAt,
                    UpdatedAt = e.UpdatedAt
                })
                .ToListAsync();

            return Ok(equipment);
        }


        // =========================================================
        // GET: api/Equipment/{id}
        // ADMIN + STAFF
        // =========================================================
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetEquipmentById(int id)
        {
            var equipment = await _context.Equipment
                .Include(e => e.Category)
                .Include(e => e.Supplier)
                .Where(e => e.Id == id)
                .Select(e => new EquipmentResponseDto
                {
                    Id = e.Id,
                    EquipmentCode = e.EquipmentCode,
                    Name = e.Name,

                    CategoryId = e.CategoryId,

                    Category = e.Category == null
                        ? null
                        : new CategoryDto
                        {
                            Id = e.Category.Id,
                            Name = e.Category.Name,
                            Description = e.Category.Description,
                            CreatedAt = e.Category.CreatedAt
                        },

                    Brand = e.Brand,
                    Model = e.Model,
                    SerialNumber = e.SerialNumber,

                    SupplierId = e.SupplierId,

                    Quantity = e.Quantity,
                    UnitPrice = e.UnitPrice,
                    MinimumStock = e.MinimumStock,
                    PurchaseDate = e.PurchaseDate,

                    Status = e.Status,
                    Description = e.Description,

                    CreatedAt = e.CreatedAt,
                    UpdatedAt = e.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (equipment == null)
            {
                return NotFound(new
                {
                    message = "Equipment not found."
                });
            }

            return Ok(equipment);
        }


        // =========================================================
        // POST: api/Equipment
        // ADMIN ONLY
        // =========================================================
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateEquipment(
            Equipment equipment)
        {
            if (string.IsNullOrWhiteSpace(
                equipment.EquipmentCode))
            {
                return BadRequest(new
                {
                    message = "Equipment code is required."
                });
            }

            if (string.IsNullOrWhiteSpace(
                equipment.Name))
            {
                return BadRequest(new
                {
                    message = "Equipment name is required."
                });
            }

            if (equipment.CategoryId <= 0)
            {
                return BadRequest(new
                {
                    message = "Category is required."
                });
            }

            if (equipment.Quantity < 0)
            {
                return BadRequest(new
                {
                    message = "Quantity cannot be negative."
                });
            }

            if (equipment.UnitPrice < 0)
            {
                return BadRequest(new
                {
                    message = "Unit price cannot be negative."
                });
            }

            if (equipment.MinimumStock < 0)
            {
                return BadRequest(new
                {
                    message = "Minimum stock cannot be negative."
                });
            }

            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == equipment.CategoryId);

            if (!categoryExists)
            {
                return BadRequest(new
                {
                    message = "Selected category does not exist."
                });
            }

            if (equipment.SupplierId.HasValue)
            {
                var supplierExists = await _context.Suppliers
                    .AnyAsync(s =>
                        s.Id == equipment.SupplierId.Value);

                if (!supplierExists)
                {
                    return BadRequest(new
                    {
                        message = "Selected supplier does not exist."
                    });
                }
            }

            var codeExists = await _context.Equipment
                .AnyAsync(e =>
                    e.EquipmentCode.ToLower() ==
                    equipment.EquipmentCode
                        .Trim()
                        .ToLower());

            if (codeExists)
            {
                return Conflict(new
                {
                    message = "Equipment code already exists."
                });
            }

            if (!string.IsNullOrWhiteSpace(
                equipment.SerialNumber))
            {
                var serialExists = await _context.Equipment
                    .AnyAsync(e =>
                        e.SerialNumber ==
                        equipment.SerialNumber);

                if (serialExists)
                {
                    return Conflict(new
                    {
                        message = "Serial number already exists."
                    });
                }
            }

            equipment.Id = 0;

            equipment.CreatedAt = DateTime.UtcNow;
            equipment.UpdatedAt = DateTime.UtcNow;

            if (equipment.PurchaseDate.HasValue)
            {
                equipment.PurchaseDate =
                    DateTime.SpecifyKind(
                        equipment.PurchaseDate.Value,
                        DateTimeKind.Utc);
            }

            _context.Equipment.Add(equipment);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetEquipmentById),
                new { id = equipment.Id },
                equipment
            );
        }


        // =========================================================
        // PUT: api/Equipment/{id}
        // ADMIN ONLY
        // =========================================================
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateEquipment(
            int id,
            Equipment updatedEquipment)
        {
            var equipment = await _context.Equipment
                .FirstOrDefaultAsync(e => e.Id == id);

            if (equipment == null)
            {
                return NotFound(new
                {
                    message = "Equipment not found."
                });
            }

            if (string.IsNullOrWhiteSpace(
                updatedEquipment.EquipmentCode))
            {
                return BadRequest(new
                {
                    message = "Equipment code is required."
                });
            }

            if (string.IsNullOrWhiteSpace(
                updatedEquipment.Name))
            {
                return BadRequest(new
                {
                    message = "Equipment name is required."
                });
            }

            if (updatedEquipment.Quantity < 0)
            {
                return BadRequest(new
                {
                    message = "Quantity cannot be negative."
                });
            }

            if (updatedEquipment.UnitPrice < 0)
            {
                return BadRequest(new
                {
                    message = "Unit price cannot be negative."
                });
            }

            if (updatedEquipment.MinimumStock < 0)
            {
                return BadRequest(new
                {
                    message = "Minimum stock cannot be negative."
                });
            }

            var categoryExists = await _context.Categories
                .AnyAsync(c =>
                    c.Id == updatedEquipment.CategoryId);

            if (!categoryExists)
            {
                return BadRequest(new
                {
                    message = "Selected category does not exist."
                });
            }

            if (updatedEquipment.SupplierId.HasValue)
            {
                var supplierExists = await _context.Suppliers
                    .AnyAsync(s =>
                        s.Id ==
                        updatedEquipment.SupplierId.Value);

                if (!supplierExists)
                {
                    return BadRequest(new
                    {
                        message = "Selected supplier does not exist."
                    });
                }
            }

            var duplicateCode = await _context.Equipment
                .AnyAsync(e =>
                    e.Id != id &&
                    e.EquipmentCode.ToLower() ==
                    updatedEquipment.EquipmentCode
                        .Trim()
                        .ToLower());

            if (duplicateCode)
            {
                return Conflict(new
                {
                    message =
                        "Another equipment with this code already exists."
                });
            }

            if (!string.IsNullOrWhiteSpace(
                updatedEquipment.SerialNumber))
            {
                var duplicateSerial =
                    await _context.Equipment
                        .AnyAsync(e =>
                            e.Id != id &&
                            e.SerialNumber ==
                            updatedEquipment.SerialNumber);

                if (duplicateSerial)
                {
                    return Conflict(new
                    {
                        message =
                            "Another equipment with this serial number already exists."
                    });
                }
            }

            equipment.EquipmentCode =
                updatedEquipment.EquipmentCode.Trim();

            equipment.Name =
                updatedEquipment.Name.Trim();

            equipment.CategoryId =
                updatedEquipment.CategoryId;

            equipment.Brand =
                updatedEquipment.Brand;

            equipment.Model =
                updatedEquipment.Model;

            equipment.SerialNumber =
                updatedEquipment.SerialNumber;

            equipment.SupplierId =
                updatedEquipment.SupplierId;

            equipment.Quantity =
                updatedEquipment.Quantity;

            equipment.UnitPrice =
                updatedEquipment.UnitPrice;

            equipment.MinimumStock =
                updatedEquipment.MinimumStock;

            equipment.PurchaseDate =
                updatedEquipment.PurchaseDate;

            equipment.Status =
                updatedEquipment.Status;

            equipment.Description =
                updatedEquipment.Description;

            equipment.UpdatedAt =
                DateTime.UtcNow;

            if (equipment.PurchaseDate.HasValue)
            {
                equipment.PurchaseDate =
                    DateTime.SpecifyKind(
                        equipment.PurchaseDate.Value,
                        DateTimeKind.Utc);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Equipment updated successfully.",
                equipment
            });
        }


        // =========================================================
        // DELETE: api/Equipment/{id}
        // ADMIN ONLY
        // =========================================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteEquipment(int id)
        {
            var equipment = await _context.Equipment
                .FirstOrDefaultAsync(e => e.Id == id);

            if (equipment == null)
            {
                return NotFound(new
                {
                    message = "Equipment not found."
                });
            }

            var hasTransactions =
                await _context.StockTransactions
                    .AnyAsync(t =>
                        t.EquipmentId == id);

            if (hasTransactions)
            {
                return BadRequest(new
                {
                    message =
                        "This equipment cannot be deleted because stock transactions exist for it."
                });
            }

            var hasAssignments =
                await _context.EquipmentAssignments
                    .AnyAsync(a =>
                        a.EquipmentId == id);

            if (hasAssignments)
            {
                return BadRequest(new
                {
                    message =
                        "This equipment cannot be deleted because assignment records exist for it."
                });
            }

            _context.Equipment.Remove(equipment);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Equipment deleted successfully."
            });
        }
    }
}