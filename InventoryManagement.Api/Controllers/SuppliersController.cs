using InventoryManagement.Api.Data;
using InventoryManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SuppliersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SuppliersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Suppliers
        // ADMIN + STAFF
        [HttpGet]
        public async Task<IActionResult> GetSuppliers()
        {
            var suppliers = await _context.Suppliers
                .OrderBy(s => s.Name)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.ContactPerson,
                    s.Phone,
                    s.Email,
                    s.Address,
                    s.CreatedAt
                })
                .ToListAsync();

            return Ok(suppliers);
        }

        // GET: api/Suppliers/{id}
        // ADMIN + STAFF
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSupplier(int id)
        {
            var supplier = await _context.Suppliers
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.ContactPerson,
                    s.Phone,
                    s.Email,
                    s.Address,
                    s.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (supplier == null)
            {
                return NotFound(new
                {
                    message = "Supplier not found."
                });
            }

            return Ok(supplier);
        }

        // POST: api/Suppliers
        // ADMIN ONLY
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateSupplier(Supplier supplier)
        {
            if (string.IsNullOrWhiteSpace(supplier.Name))
            {
                return BadRequest(new
                {
                    message = "Supplier name is required."
                });
            }

            bool exists = await _context.Suppliers
                .AnyAsync(s =>
                    s.Name.ToLower() ==
                    supplier.Name.Trim().ToLower());

            if (exists)
            {
                return Conflict(new
                {
                    message = "Supplier already exists."
                });
            }

            supplier.Id = 0;
            supplier.Name = supplier.Name.Trim();
            supplier.CreatedAt = DateTime.UtcNow;

            _context.Suppliers.Add(supplier);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetSupplier),
                new { id = supplier.Id },
                new
                {
                    supplier.Id,
                    supplier.Name,
                    supplier.ContactPerson,
                    supplier.Phone,
                    supplier.Email,
                    supplier.Address,
                    supplier.CreatedAt
                }
            );
        }

        // PUT: api/Suppliers/{id}
        // ADMIN ONLY
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateSupplier(
            int id,
            Supplier updatedSupplier)
        {
            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == id);

            if (supplier == null)
            {
                return NotFound(new
                {
                    message = "Supplier not found."
                });
            }

            if (string.IsNullOrWhiteSpace(updatedSupplier.Name))
            {
                return BadRequest(new
                {
                    message = "Supplier name is required."
                });
            }

            bool duplicate = await _context.Suppliers
                .AnyAsync(s =>
                    s.Id != id &&
                    s.Name.ToLower() ==
                    updatedSupplier.Name.Trim().ToLower());

            if (duplicate)
            {
                return Conflict(new
                {
                    message =
                        "Another supplier with this name already exists."
                });
            }

            supplier.Name = updatedSupplier.Name.Trim();
            supplier.ContactPerson = updatedSupplier.ContactPerson;
            supplier.Phone = updatedSupplier.Phone;
            supplier.Email = updatedSupplier.Email;
            supplier.Address = updatedSupplier.Address;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Supplier updated successfully.",
                supplier
            });
        }

        // DELETE: api/Suppliers/{id}
        // ADMIN ONLY
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == id);

            if (supplier == null)
            {
                return NotFound(new
                {
                    message = "Supplier not found."
                });
            }

            bool hasEquipment = await _context.Equipment
                .AnyAsync(e => e.SupplierId == id);

            if (hasEquipment)
            {
                return BadRequest(new
                {
                    message =
                        "Cannot delete this supplier because equipment is assigned to it."
                });
            }

            _context.Suppliers.Remove(supplier);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Supplier deleted successfully."
            });
        }
    }
}