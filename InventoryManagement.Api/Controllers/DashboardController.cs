using InventoryManagement.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin,staff")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Dashboard
        // ADMIN + STAFF
        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            // Total number of equipment records
            var totalEquipment = await _context.Equipment
                .CountAsync();

            // Total quantity of all equipment
            var totalStock = await _context.Equipment
                .SumAsync(e => e.Quantity);

            // Equipment where quantity is at or below minimum stock
            var lowStock = await _context.Equipment
                .CountAsync(e => e.Quantity <= e.MinimumStock);

            // Total categories
            var totalCategories = await _context.Categories
                .CountAsync();

            // Total suppliers
            var totalSuppliers = await _context.Suppliers
                .CountAsync();

            // Total users
            var totalUsers = await _context.Users
                .CountAsync();

            // Currently assigned equipment
            var assignedEquipment = await _context.EquipmentAssignments
                .CountAsync(a => a.Status == "Assigned");

            // Number of stock transactions
            var totalTransactions = await _context.StockTransactions
                .CountAsync();

            // Recent transactions
            var recentTransactions = await _context.StockTransactions
                .Include(t => t.Equipment)
                .OrderByDescending(t => t.TransactionDate)
                .Take(5)
                .Select(t => new
                {
                    t.Id,
                    t.TransactionType,
                    t.Quantity,
                    t.TransactionDate,
                    t.Remarks,

                    Equipment = t.Equipment == null
                        ? null
                        : new
                        {
                            t.Equipment.Id,
                            t.Equipment.EquipmentCode,
                            t.Equipment.Name
                        }
                })
                .ToListAsync();

            return Ok(new
            {
                totalEquipment,
                totalStock,
                lowStock,
                totalCategories,
                totalSuppliers,
                totalUsers,
                assignedEquipment,
                totalTransactions,
                recentTransactions
            });
        }
    }
}